/**
 * TCC FINANCE - Google Apps Script backend
 * Arsitektur: Vercel (frontend) -> Apps Script (API ini) -> Spreadsheet + Drive
 *
 * SETUP:
 * 1. Isi SPREADSHEET_ID dan DRIVE_FOLDER_ID di bawah.
 * 2. Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone.
 * 3. Copy Web App URL ke frontend/.env.local (NEXT_PUBLIC_APPS_SCRIPT_URL).
 */

const SPREADSHEET_ID = 'ISI_SPREADSHEET_ID_DI_SINI';
const DRIVE_FOLDER_ID = 'ISI_DRIVE_FOLDER_ID_DI_SINI';
const TIMEZONE = 'Asia/Jakarta';

const SHEETS = {
  USERS: 'USERS',
  EVENTS: 'EVENTS',
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
  CATEGORIES: 'CATEGORIES',
  PAYMENT_METHODS: 'PAYMENT_METHODS',
  AUDIT_LOGS: 'AUDIT_LOGS'
};

// ---------------------------------------------------------------------------
// ENTRY POINTS
// ---------------------------------------------------------------------------

function doGet(e) {
  try {
    const action = e.parameter.action || '';
    let result;

    switch (action) {
      case 'dashboard':
        result = calculateDashboard();
        break;
      case 'transactions':
        result = getTransactions(e.parameter);
        break;
      case 'events':
        result = getEvents(e.parameter);
        break;
      case 'event_detail':
        result = getEventDetail(e.parameter.event_id);
        break;
      case 'categories':
        result = getSheetAsObjects(SHEETS.CATEGORIES);
        break;
      case 'payment_methods':
        result = getSheetAsObjects(SHEETS.PAYMENT_METHODS);
        break;
      case 'report':
        result = getReport(e.parameter);
        break;
      case 'audit_logs':
        result = getSheetAsObjects(SHEETS.AUDIT_LOGS).reverse();
        break;
      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action });
    }

    return jsonResponse({ success: true, data: result });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action || '';
    const method = (body.method || 'POST').toUpperCase();
    let result;

    if (method === 'DELETE') {
      result = handleDelete(action, body);
    } else if (method === 'PUT') {
      result = handleUpdate(action, body);
    } else {
      result = handleCreate(action, body);
    }

    return jsonResponse({ success: true, data: result });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ---------------------------------------------------------------------------
// CREATE
// ---------------------------------------------------------------------------

function handleCreate(action, body) {
  switch (action) {
    case 'income':
      return createTransaction(SHEETS.INCOME, body, 'IN');
    case 'expense':
      return createTransaction(SHEETS.EXPENSE, body, 'EX');
    case 'event':
      return createEvent(body);
    case 'upload_bukti':
      return uploadBukti(body);
    default:
      throw new Error('Unknown create action: ' + action);
  }
}

function createTransaction(sheetName, body, prefix) {
  const sheet = getSheet(sheetName);
  const headers = getHeaders(sheet);
  const now = new Date();
  const id = generateId(prefix);

  const row = {
    transaction_id: id,
    tanggal: body.tanggal || formatDate(now),
    jam: body.jam || formatTime(now),
    [sheetName === SHEETS.INCOME ? 'nama_transaksi' : 'nama_pengeluaran']: body.nama || '',
    kategori: body.kategori || '',
    event_id: body.event_id || '',
    [sheetName === SHEETS.INCOME ? 'sumber_dana' : 'vendor']: body.sumber || body.vendor || '',
    nominal: Number(body.nominal) || 0,
    metode_pembayaran: body.metode_pembayaran || '',
    status: body.status || 'confirmed',
    penginput: body.penginput || '',
    catatan: body.catatan || '',
    bukti: body.bukti || '',
    created_at: formatDateTime(now)
  };

  appendRowFromObject(sheet, headers, row);
  logAudit(body.penginput, 'CREATE_' + sheetName, id, 'Membuat transaksi ' + sheetName + ' sebesar ' + row.nominal);
  return row;
}

function createEvent(body) {
  const sheet = getSheet(SHEETS.EVENTS);
  const headers = getHeaders(sheet);
  const id = generateId('EVT');

  const row = {
    event_id: id,
    nama_event: body.nama_event || '',
    game: body.game || '',
    tanggal_mulai: body.tanggal_mulai || '',
    tanggal_selesai: body.tanggal_selesai || '',
    jumlah_peserta: Number(body.jumlah_peserta) || 0,
    biaya_registrasi: Number(body.biaya_registrasi) || 0,
    target_pemasukan: Number(body.target_pemasukan) || 0,
    budget: Number(body.budget) || 0,
    prize_pool: Number(body.prize_pool) || 0,
    status: body.status || 'upcoming'
  };

  appendRowFromObject(sheet, headers, row);
  logAudit(body.penginput, 'CREATE_EVENT', id, 'Membuat event ' + row.nama_event);
  return row;
}

/**
 * Terima file sebagai base64 dari frontend, simpan ke Drive, kembalikan URL.
 * body: { filename, mimeType, base64Data }
 */
function uploadBukti(body) {
  const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  const decoded = Utilities.base64Decode(body.base64Data);
  const blob = Utilities.newBlob(decoded, body.mimeType, body.filename);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { url: file.getUrl(), fileId: file.getId() };
}

// ---------------------------------------------------------------------------
// READ
// ---------------------------------------------------------------------------

function getTransactions(params) {
  const income = getSheetAsObjects(SHEETS.INCOME).map(r => Object.assign({ type: 'income' }, r));
  const expense = getSheetAsObjects(SHEETS.EXPENSE).map(r => Object.assign({ type: 'expense' }, r));
  let all = income.concat(expense);

  if (params.event_id) {
    all = all.filter(r => r.event_id === params.event_id);
  }
  if (params.tanggal_dari && params.tanggal_sampai) {
    all = all.filter(r => r.tanggal >= params.tanggal_dari && r.tanggal <= params.tanggal_sampai);
  }

  all.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return all;
}

function getEvents(params) {
  const events = getSheetAsObjects(SHEETS.EVENTS);
  if (params.status) {
    return events.filter(e => e.status === params.status);
  }
  return events;
}

function getEventDetail(eventId) {
  const event = getSheetAsObjects(SHEETS.EVENTS).find(e => e.event_id === eventId);
  if (!event) throw new Error('Event tidak ditemukan: ' + eventId);
  return Object.assign({}, event, calculateEventSummary(eventId));
}

function getReport(params) {
  const income = getSheetAsObjects(SHEETS.INCOME);
  const expense = getSheetAsObjects(SHEETS.EXPENSE);

  const filterByDate = (rows) => {
    if (!params.tanggal_dari || !params.tanggal_sampai) return rows;
    return rows.filter(r => r.tanggal >= params.tanggal_dari && r.tanggal <= params.tanggal_sampai);
  };

  const incomeFiltered = filterByDate(income);
  const expenseFiltered = filterByDate(expense);

  const totalIncome = sumField(incomeFiltered, 'nominal');
  const totalExpense = sumField(expenseFiltered, 'nominal');

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    saldo: totalIncome - totalExpense,
    income_by_category: groupSum(incomeFiltered, 'kategori', 'nominal'),
    expense_by_category: groupSum(expenseFiltered, 'kategori', 'nominal'),
    jumlah_transaksi: incomeFiltered.length + expenseFiltered.length
  };
}

function calculateDashboard() {
  const income = getSheetAsObjects(SHEETS.INCOME);
  const expense = getSheetAsObjects(SHEETS.EXPENSE);
  const events = getSheetAsObjects(SHEETS.EVENTS);

  const totalIncome = sumField(income, 'nominal');
  const totalExpense = sumField(expense, 'nominal');

  return {
    saldo: totalIncome - totalExpense,
    total_income: totalIncome,
    total_expense: totalExpense,
    jumlah_event: events.length,
    jumlah_transaksi: income.length + expense.length,
    transaksi_terbaru: getTransactions({}).slice(0, 5)
  };
}

function calculateEventSummary(eventId) {
  const income = getSheetAsObjects(SHEETS.INCOME).filter(r => r.event_id === eventId);
  const expense = getSheetAsObjects(SHEETS.EXPENSE).filter(r => r.event_id === eventId);
  const totalIncome = sumField(income, 'nominal');
  const totalExpense = sumField(expense, 'nominal');

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    profit_loss: totalIncome - totalExpense,
    jumlah_transaksi: income.length + expense.length
  };
}

// ---------------------------------------------------------------------------
// UPDATE / DELETE
// ---------------------------------------------------------------------------

function handleUpdate(action, body) {
  switch (action) {
    case 'transaction':
      return updateRowById(body.sheet === 'expense' ? SHEETS.EXPENSE : SHEETS.INCOME, 'transaction_id', body.id, body.fields, body.penginput);
    case 'event':
      return updateRowById(SHEETS.EVENTS, 'event_id', body.id, body.fields, body.penginput);
    default:
      throw new Error('Unknown update action: ' + action);
  }
}

function handleDelete(action, body) {
  switch (action) {
    case 'transaction':
      return deleteRowById(body.sheet === 'expense' ? SHEETS.EXPENSE : SHEETS.INCOME, 'transaction_id', body.id, body.penginput);
    case 'event':
      return deleteRowById(SHEETS.EVENTS, 'event_id', body.id, body.penginput);
    default:
      throw new Error('Unknown delete action: ' + action);
  }
}

function updateRowById(sheetName, idField, idValue, fields, user) {
  const sheet = getSheet(sheetName);
  const headers = getHeaders(sheet);
  const idCol = headers.indexOf(idField);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === idValue) {
      Object.keys(fields).forEach(key => {
        const col = headers.indexOf(key);
        if (col !== -1) sheet.getRange(i + 1, col + 1).setValue(fields[key]);
      });
      logAudit(user, 'UPDATE_' + sheetName, idValue, 'Update field: ' + Object.keys(fields).join(', '));
      return { updated: true, id: idValue };
    }
  }
  throw new Error('Data tidak ditemukan: ' + idValue);
}

function deleteRowById(sheetName, idField, idValue, user) {
  const sheet = getSheet(sheetName);
  const headers = getHeaders(sheet);
  const idCol = headers.indexOf(idField);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === idValue) {
      sheet.deleteRow(i + 1);
      logAudit(user, 'DELETE_' + sheetName, idValue, 'Menghapus data');
      return { deleted: true, id: idValue };
    }
  }
  throw new Error('Data tidak ditemukan: ' + idValue);
}

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(name) {
  const sheet = getSpreadsheet().getSheetByName(name);
  if (!sheet) throw new Error('Sheet tidak ditemukan: ' + name);
  return sheet;
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

function getSheetAsObjects(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const obj = {};
    headers.forEach((h, idx) => (obj[h] = data[i][idx]));
    rows.push(obj);
  }
  return rows;
}

function appendRowFromObject(sheet, headers, obj) {
  const row = headers.map(h => (obj[h] !== undefined ? obj[h] : ''));
  sheet.appendRow(row);
}

function generateId(prefix) {
  return prefix + '-' + Utilities.formatDate(new Date(), TIMEZONE, 'yyyyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000);
}

function formatDate(date) {
  return Utilities.formatDate(date, TIMEZONE, 'dd/MM/yyyy');
}

function formatTime(date) {
  return Utilities.formatDate(date, TIMEZONE, 'HH:mm:ss');
}

function formatDateTime(date) {
  return Utilities.formatDate(date, TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
}

function sumField(rows, field) {
  return rows.reduce((sum, r) => sum + (Number(r[field]) || 0), 0);
}

function groupSum(rows, groupField, sumFieldName) {
  const result = {};
  rows.forEach(r => {
    const key = r[groupField] || 'Lainnya';
    result[key] = (result[key] || 0) + (Number(r[sumFieldName]) || 0);
  });
  return result;
}

function logAudit(user, aktivitas, transactionId, detail) {
  try {
    const sheet = getSheet(SHEETS.AUDIT_LOGS);
    sheet.appendRow([
      generateId('LOG'),
      user || 'system',
      aktivitas,
      transactionId || '',
      formatDateTime(new Date()),
      detail || ''
    ]);
  } catch (err) {
    // Jangan gagalkan request utama hanya karena audit log gagal
    Logger.log('Audit log error: ' + err.message);
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
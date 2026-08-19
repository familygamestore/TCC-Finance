/**
 * TCC FINANCE - Secure MultiBrand Backend v4
 * Google Apps Script -> Spreadsheet + Drive
 *
 * IMPORTANT:
 * - Run setupTCCFinance() once after replacing this file.
 * - Run getTCCSetupInfo() to verify the database URL.
 * - Super Admin writes are protected by a server-side session token.
 * - Normal Admins can only submit requests; they cannot edit/delete ledger data.
 */

const DEFAULT_TIMEZONE = 'Asia/Jakarta';
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const SESSION_TTL_SECONDS = 6 * 60 * 60;
// SECURITY NOTE: this is a bootstrap-only hash for the very first Super Admin login.
// must_change_password is forced to TRUE for this account (see setupTCCFinance_ below),
// so the account cannot be used until the password is changed. Rotate it immediately
// after your first deploy by logging in once and setting a new password.
const DEFAULT_SUPER_ADMIN_EMAIL = 'superadmin@tcc.local';
const DEFAULT_SUPER_ADMIN_PASSWORD_HASH = 'd432236a62050dc92d3c040e98d2ccc9ba05253b856e35fa85bfe1b662b3a143';
const DEFAULT_ADMIN_EMAIL = 'admin@tcc.local';
// (DEFAULT_ADMIN_PASSWORD_HASH was declared but never used anywhere in this file — removed.
// Regular Admin accounts are always created with an explicit, unique password via
// createAdmin/AUTH_USERS, never from a hardcoded default.)

const PROP_SPREADSHEET_ID = 'TCC_SPREADSHEET_ID';
const PROP_DRIVE_FOLDER_ID = 'TCC_DRIVE_FOLDER_ID';
const PROP_SETUP_DONE = 'TCC_SETUP_DONE';
const PROP_TIMEZONE = 'TCC_TIMEZONE';
const PROP_WHATSAPP_NUMBER = 'TCC_WHATSAPP_NUMBER';
const PROP_SUPER_ADMIN_EMAIL = 'TCC_SUPER_ADMIN_EMAIL';
const PROP_SUPER_ADMIN_PASSWORD_HASH = 'TCC_SUPER_ADMIN_PASSWORD_HASH';
const PROP_SUPER_ADMIN_PASSWORD_SALT = 'TCC_SUPER_ADMIN_PASSWORD_SALT';
const PROP_SESSION_PREFIX = 'TCC_SESSION_';

const SHEETS = {
  USERS: 'USERS', AUTH_USERS: 'AUTH_USERS', BRANDS: 'BRANDS', BRAND_USERS: 'BRAND_USERS',
  CASH_ACCOUNTS: 'CASH_ACCOUNTS', CASH_ADJUSTMENTS: 'CASH_ADJUSTMENTS', REQUESTS: 'REQUESTS',
  EVENTS: 'EVENTS', INCOME: 'INCOME', EXPENSE: 'EXPENSE', CATEGORIES: 'CATEGORIES',
  PAYMENT_METHODS: 'PAYMENT_METHODS', AUDIT_LOGS: 'AUDIT_LOGS', EVENT_BUDGETS: 'EVENT_BUDGETS', NOTIFICATIONS: 'NOTIFICATIONS', SETTINGS: 'SETTINGS'
};

function getConfig_() {
  const p = PropertiesService.getScriptProperties();
  return {
    spreadsheetId: p.getProperty(PROP_SPREADSHEET_ID) || '',
    driveFolderId: p.getProperty(PROP_DRIVE_FOLDER_ID) || '',
    timezone: p.getProperty(PROP_TIMEZONE) || DEFAULT_TIMEZONE,
    whatsappNumber: p.getProperty(PROP_WHATSAPP_NUMBER) || '',
    superAdminEmail: p.getProperty(PROP_SUPER_ADMIN_EMAIL) || DEFAULT_SUPER_ADMIN_EMAIL
  };
}

function setupTCCFinance() {
  const props = PropertiesService.getScriptProperties();
  let cfg = getConfig_();
  let ss = null;
  if (cfg.spreadsheetId) { try { ss = SpreadsheetApp.openById(cfg.spreadsheetId); } catch (e) {} }
  if (!ss) {
    ss = SpreadsheetApp.create('TCC Finance - Auto Generated');
    props.setProperty(PROP_SPREADSHEET_ID, ss.getId());
  }

  let folder = null;
  if (cfg.driveFolderId) { try { folder = DriveApp.getFolderById(cfg.driveFolderId); } catch (e) {} }
  if (!folder) {
    folder = DriveApp.createFolder('TCC Finance - Bukti Transaksi');
    props.setProperty(PROP_DRIVE_FOLDER_ID, folder.getId());
  }

  const schemas = getSheetSchemas_();
  Object.keys(schemas).forEach(name => ensureSheetSchema_(ss,name,schemas[name]));

  seedDefaultData_(ss);
  seedSuperAdmin_(ss, props);
  seedDefaultAdmin_(ss);
  props.setProperty(PROP_TIMEZONE, DEFAULT_TIMEZONE);
  props.setProperty(PROP_SETUP_DONE, 'true');
  return {
    success: true,
    spreadsheet_id: ss.getId(), spreadsheet_url: ss.getUrl(),
    drive_folder_id: folder.getId(), drive_folder_url: folder.getUrl(),
    super_admin_email: props.getProperty(PROP_SUPER_ADMIN_EMAIL),
    message: 'TCC Finance V23 berhasil di-setup/di-upgrade. Struktur multi-brand, approval, event universal, dan akses Super Admin dilindungi.'
  };
}

function upgradeTCCFinanceV4() { return setupTCCFinance(); }
function upgradeTCCFinanceV6() { return setupTCCFinance(); }
function upgradeTCCFinanceV8() { return setupTCCFinanceV8_(); }
function setupTCCFinanceV8_() {
  const result = setupTCCFinance();
  const ss = getSpreadsheet_();
  const schemas = getSheetSchemasV8_();
  Object.keys(schemas).forEach(name => ensureSheetSchema_(ss, name, schemas[name]));
  seedV8Defaults_(ss);
  PropertiesService.getScriptProperties().setProperty('TCC_SCHEMA_VERSION','8');
  return Object.assign({}, result, {schema_version:'8', message:'TCC Finance V23 schema compatibility upgrade berhasil dijalankan. Security, multi-brand access, event finance, notifications, settings, dan audit diperkuat.'});
}

function getSheetSchemasV8_() {
  const base = getSheetSchemas_();
  return Object.assign({}, base, {
    BRAND_USERS:['id','brand_id','user_id','role','permissions','status','created_at'],
    EVENT_BUDGETS:['budget_id','event_id','brand_id','registration_revenue','sponsor_revenue','other_income','prize_pool','operational_budget','other_expense','expected_profit','created_at','updated_at'],
    NOTIFICATIONS:['notification_id','user_id','brand_id','type','title','message','status','created_at'],
    SETTINGS:['key','value','description','updated_at','updated_by']
  });
}

function seedV8Defaults_(ss) {
  const sh=ss.getSheetByName('SETTINGS');
  if(sh && sh.getLastRow()<2) sh.getRange(2,1,6,5).setValues([
    ['currency','IDR','Mata uang aplikasi',formatDateTime_(new Date()),'SYSTEM'],
    ['timezone',DEFAULT_TIMEZONE,'Zona waktu aplikasi',formatDateTime_(new Date()),'SYSTEM'],
    ['low_cash_threshold','500000','Peringatan kas rendah',formatDateTime_(new Date()),'SYSTEM'],
    ['budget_warning_percent','80','Peringatan penggunaan budget (%)',formatDateTime_(new Date()),'SYSTEM'],
    ['max_login_attempts','5','Batas login gagal sebelum lock sementara',formatDateTime_(new Date()),'SYSTEM'],
    ['session_ttl_minutes','120','Masa berlaku session',formatDateTime_(new Date()),'SYSTEM']
  ]);
}

function getSheetSchemasV8_legacy(){return getSheetSchemasV8_();}

function getSheetSchemas_() {
  return {
    USERS: ['id','nama','email','role','status','created_at'],
    AUTH_USERS: ['id','email','password_hash','password_salt','role','status','must_change_password','created_at'],
    BRANDS: ['brand_id','nama_brand','status','created_at'],
    BRAND_USERS: ['id','brand_id','user_id','role','status'],
    CASH_ACCOUNTS: ['cash_id','brand_id','saldo_awal','saldo_aktual','updated_at','updated_by'],
    CASH_ADJUSTMENTS: ['adjustment_id','brand_id','saldo_sebelum','saldo_sesudah','selisih','alasan','dibuat_oleh','created_at'],
    REQUESTS: ['request_id','brand_id','user_id','user_name','type','nama','kategori','event_id','nominal','metode_pembayaran','vendor','catatan','bukti','status','approved_by','approved_at','rejection_reason','created_at','game','kategori_event','sistem_turnamen','tanggal_mulai','tanggal_selesai','jumlah_peserta','biaya_registrasi','target_pemasukan','budget','prize_pool','whatsapp_url','access_token_hash'],
    EVENTS: ['event_id','brand_id','nama_event','game','kategori_event','sistem_turnamen','tanggal_mulai','tanggal_selesai','jumlah_peserta','biaya_registrasi','target_pemasukan','budget','prize_pool','sponsor_revenue','other_income','other_expense','expected_profit','status','created_at'],
    INCOME: ['transaction_id','tanggal','jam','nama_transaksi','kategori','event_id','sumber_dana','nominal','metode_pembayaran','penginput','catatan','bukti','created_at','brand_id'],
    EXPENSE: ['transaction_id','tanggal','jam','nama_pengeluaran','kategori','event_id','vendor','nominal','metode_pembayaran','status','penginput','catatan','bukti','created_at','brand_id'],
    CATEGORIES: ['category_id','nama_kategori','tipe','status'],
    PAYMENT_METHODS: ['id','nama','status'],
    AUDIT_LOGS: ['log_id','user','aktivitas','transaction_id','waktu','detail'],
    EVENT_BUDGETS: ['budget_id','event_id','brand_id','registration_revenue','sponsor_revenue','other_income','prize_pool','operational_budget','other_expense','expected_profit','created_at','updated_at'],
    NOTIFICATIONS: ['notification_id','user_id','brand_id','type','title','message','status','created_at'],
    SETTINGS: ['key','value','description','updated_at','updated_by']
  };
}

function seedDefaultData_(ss) {
  const categories = ss.getSheetByName(SHEETS.CATEGORIES);
  if (categories.getLastRow() < 2) categories.getRange(2,1,8,4).setValues([
    ['CAT-IN-REG','Registrasi','income','ACTIVE'],['CAT-IN-SPONSOR','Sponsor','income','ACTIVE'],['CAT-IN-LAIN','Pemasukan Lainnya','income','ACTIVE'],
    ['CAT-EX-OPERASIONAL','Operasional','expense','ACTIVE'],['CAT-EX-HADIAH','Hadiah / Prize Pool','expense','ACTIVE'],['CAT-EX-MARKETING','Marketing','expense','ACTIVE'],
    ['CAT-EX-ADMIN','Administrasi','expense','ACTIVE'],['CAT-EX-LAIN','Pengeluaran Lainnya','expense','ACTIVE']
  ]);
  const methods = ss.getSheetByName(SHEETS.PAYMENT_METHODS);
  if (methods.getLastRow() < 2) methods.getRange(2,1,5,3).setValues([
    ['PM-CASH','Cash','ACTIVE'],['PM-BANK','Transfer Bank','ACTIVE'],['PM-QRIS','QRIS','ACTIVE'],['PM-EWALLET','E-Wallet','ACTIVE'],['PM-OTHER','Lainnya','ACTIVE']
  ]);
}

function seedSuperAdmin_(ss, props) {
  const email = props.getProperty(PROP_SUPER_ADMIN_EMAIL) || DEFAULT_SUPER_ADMIN_EMAIL;
  if (!props.getProperty(PROP_SUPER_ADMIN_PASSWORD_HASH)) props.setProperty(PROP_SUPER_ADMIN_PASSWORD_HASH, DEFAULT_SUPER_ADMIN_PASSWORD_HASH);
  props.setProperty(PROP_SUPER_ADMIN_EMAIL, email);
  const sheet = ss.getSheetByName(SHEETS.AUTH_USERS);
  const rows = getSheetAsObjects_(sheet);
  const exists = rows.find(r => String(r.email).toLowerCase() === email.toLowerCase());
  if (!exists) {
    appendRowFromObject(sheet, getHeaders_(sheet), {
      id: 'AUTH-SUPER-ADMIN', email, password_hash: props.getProperty(PROP_SUPER_ADMIN_PASSWORD_HASH), role: 'SUPER_ADMIN', status: 'ACTIVE', must_change_password: 'TRUE', created_at: formatDateTime_(new Date())
    });
  }
}

function seedDefaultAdmin_(ss) {
  // Production-safe: never create a shared/default Admin account automatically.
  // Admin accounts must be created explicitly by Super Admin.
  return;
}

/**
 * ONE-TIME ONBOARDING HELPER — how to log in for the first time.
 *
 * The Super Admin account created by setupTCCFinance() starts with a bootstrap
 * password whose plaintext is intentionally NOT stored anywhere in this file
 * (only its hash is, so it can't be read back). To choose your own first
 * password:
 *   1. Edit the PLAINTEXT_PASSWORD value below to a password you'll remember.
 *   2. In the Apps Script editor, select this function from the dropdown and
 *      click Run (once).
 *   3. Log in on the frontend with:
 *        email:    the value returned by getTCCSetupInfo().superAdminEmail
 *                  (superadmin@tcc.local unless you changed it)
 *        password: the PLAINTEXT_PASSWORD you set below
 *      You'll be forced to change it immediately after logging in — that's
 *      expected (must_change_password is set to TRUE).
 *   4. Afterwards, clear the PLAINTEXT_PASSWORD value below back to '' and
 *      save, so the plaintext doesn't linger in your script source.
 */
function setInitialSuperAdminPassword() {
  const PLAINTEXT_PASSWORD = ''; // <-- set a password here, run once, then clear it again
  if (!PLAINTEXT_PASSWORD) throw new Error('Isi dulu PLAINTEXT_PASSWORD di baris atas fungsi ini, lalu jalankan lagi.');
  if (PLAINTEXT_PASSWORD.length < 8) throw new Error('Gunakan password minimal 8 karakter.');

  const props = PropertiesService.getScriptProperties();
  const email = props.getProperty(PROP_SUPER_ADMIN_EMAIL) || DEFAULT_SUPER_ADMIN_EMAIL;
  const salt = generateSalt_();
  const hash = hashPassword_(PLAINTEXT_PASSWORD, salt);
  props.setProperty(PROP_SUPER_ADMIN_PASSWORD_HASH, hash);
  props.setProperty(PROP_SUPER_ADMIN_PASSWORD_SALT, salt);

  const ss = getSpreadsheet_();
  const sheet = ss.getSheetByName(SHEETS.AUTH_USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailCol = headers.indexOf('email');
  const hashCol = headers.indexOf('password_hash');
  const saltCol = headers.indexOf('password_salt');
  const mustChangeCol = headers.indexOf('must_change_password');
  let updated = false;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][emailCol]).toLowerCase() === email.toLowerCase()) {
      sheet.getRange(i + 1, hashCol + 1).setValue(hash);
      if (saltCol !== -1) sheet.getRange(i + 1, saltCol + 1).setValue(salt);
      sheet.getRange(i + 1, mustChangeCol + 1).setValue('TRUE');
      updated = true;
      break;
    }
  }
  if (!updated) throw new Error('Akun Super Admin belum ada. Jalankan setupTCCFinance() dulu, baru fungsi ini.');
  return 'OK. Login dengan email ' + email + ' dan password yang baru saja Anda set. Sekarang kosongkan lagi PLAINTEXT_PASSWORD di kode ini.';
}

function ensureSetup_() {
  const c = getConfig_();
  if (!c.spreadsheetId || !c.driveFolderId) {
    throw new Error('TCC Finance belum di-setup. Jalankan upgradeTCCFinanceV4() secara manual di Apps Script.');
  }
}
function getSpreadsheet_() { ensureSetup_(); return SpreadsheetApp.openById(getConfig_().spreadsheetId); }
function getDriveFolder_() { ensureSetup_(); return DriveApp.getFolderById(getConfig_().driveFolderId); }
function getTimezone_() { return getConfig_().timezone || DEFAULT_TIMEZONE; }

function getTCCSetupInfo() {
  const c = getConfig_();
  return {
    spreadsheet_id: c.spreadsheetId,
    spreadsheet_url: c.spreadsheetId ? SpreadsheetApp.openById(c.spreadsheetId).getUrl() : '',
    drive_folder_id: c.driveFolderId,
    drive_folder_url: c.driveFolderId ? DriveApp.getFolderById(c.driveFolderId).getUrl() : '',
    super_admin_email: c.superAdminEmail,
    whatsapp_number_configured: !!c.whatsappNumber
  };
}

function doGet(e) {
  try {
    const action = String((e.parameter || {}).action || '');
    ensureSetup_();
    let result;
    switch (action) {
      case 'config': { const tok=String(e.parameter.token||''); const c=getConfig_(); if(tok && getSession_(tok)) result={whatsapp_number:c.whatsappNumber,whatsapp_number_configured:!!c.whatsappNumber}; else result={whatsapp_number_configured:!!c.whatsappNumber}; break; }
      case 'session': result = sessionInfo_(e.parameter); break;
      case 'dashboard': { const session=requireSession_({token:String(e.parameter.token||'')}); result = calculateDashboardForSession_(session); break; }
      case 'transactions': { const session=requireSession_({token:String(e.parameter.token||'')}); result = getTransactionsForSession_(session,e.parameter); break; }
      case 'events': { const session=requireSession_({token:String(e.parameter.token||'')}); result = getEventsForSession_(session,e.parameter); break; }
      case 'event_detail': { const session=requireSession_({token:String(e.parameter.token||'')}); const ev=getEventDetail(e.parameter.event_id); if (session.role!=='SUPER_ADMIN') { if (!hasPermission_(session, ev.brand_id, 'view_events')) throw new Error('Anda tidak memiliki permission untuk melihat event brand ini.'); } result=ev; break; }
      case 'categories': result = getActiveCategories_(); break;
      case 'payment_methods': result = getActivePaymentMethods_(); break;
      case 'report': { const session=requireSession_({token:String(e.parameter.token||'')}); result = getReportForSession_(session,e.parameter); break; }
      case 'audit_logs': requireSuperAdmin_({token:String(e.parameter.token||'')}); result = getSheetAsObjects_(getSheet_(SHEETS.AUDIT_LOGS)).reverse(); break;
      case 'brands': result = getBrandsForSession_(e.parameter); break;
      case 'cash': result = getCashOverviewForSession_(e.parameter); break;
      case 'requests': result = getRequests(e.parameter); break;
      case 'request_status': result = getRequestStatus_(e.parameter.request_id, e.parameter.request_access_token, e.parameter.token); break;
      case 'users': { const session=requireSuperAdmin_({token:String(e.parameter.token||'')}); result = getUsersForSession_(session); break; }
      case 'access': requireSuperAdmin_({token:String(e.parameter.token||'')}); result = getAccessControl_(); break;
      default: return jsonResponse({ success:false, error:'Unknown action: ' + action });
    }
    return jsonResponse({ success:true, data:result });
  } catch (err) { return jsonResponse({ success:false, error:err.message }); }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = String(body.action || '');
    if (action === 'login') return jsonResponse({ success:true, data:login_(body) });
    if (action === 'logout') { if (body.token) revokeSession_(body.token); return jsonResponse({ success:true, data:{logged_out:true} }); }
    ensureSetup_();
    const method = String(body.method || 'POST').toUpperCase();
    let result;
    if (method === 'DELETE') result = handleDelete_(action, body);
    else if (method === 'PUT') result = handleUpdate_(action, body);
    else result = handleCreate_(action, body);
    return jsonResponse({ success:true, data:result });
  } catch (err) { return jsonResponse({ success:false, error:err.message }); }
}

function handleCreate_(action, body) {
  switch (action) {
    case 'request': return createFinanceRequest_(body);
    case 'auth_user': requireSuperAdmin_(body); return createAuthUser_(body);
    case 'upload_bukti': return uploadBukti_(body);
    case 'income': return createFinanceRequest_(Object.assign({},body,{type:'INCOME'}));
    case 'expense': return createFinanceRequest_(Object.assign({},body,{type:'EXPENSE'}));
    case 'event': return createFinanceRequest_(Object.assign({},body,{type:'EVENT'}));
    case 'brand': requireSuperAdmin_(body); return createBrand_(body);
    case 'cash_setup': requireSuperAdmin_(body); return setupCash_(body);
    case 'cash_adjustment': requireSuperAdmin_(body); return createCashAdjustment_(body);
    default: throw new Error('Unknown create action: ' + action);
  }
}
function handleUpdate_(action, body) {
  if (action === 'access') return updateBrandAccess_(body);
  if (action === 'auth_password') return changePasswordForSession_(body);
  const session = requireSuperAdmin_(body);
  const actor = session.email;
  switch (action) {
    case 'request': return updateRequestStatus_(body);
    case 'brand': return updateRowById_(SHEETS.BRANDS,'brand_id',body.id,body.fields||{},actor);
    case 'cash_setup': return setupCash_(body);
    case 'transaction': return updateRowById_(body.sheet === 'expense' ? SHEETS.EXPENSE : SHEETS.INCOME,'transaction_id',body.id,body.fields||{},actor);
    case 'event': return updateRowById_(SHEETS.EVENTS,'event_id',body.id,body.fields||{},actor);
    case 'config': return setConfig_(body);
    case 'auth_user': return createAuthUser_(body);
    default: throw new Error('Unknown update action: ' + action);
  }
}
function handleDelete_(action, body) {
  const session = requireSuperAdmin_(body);
  const actor = session.email;
  switch (action) {
    case 'request': throw new Error('Pengajuan tidak dapat dihapus. Gunakan REJECTED untuk menutup pengajuan.');
    case 'transaction': return deleteRowById_(body.sheet === 'expense' ? SHEETS.EXPENSE : SHEETS.INCOME,'transaction_id',body.id,actor);
    case 'event': return deleteRowById_(SHEETS.EVENTS,'event_id',body.id,actor);
    case 'brand': return deleteRowById_(SHEETS.BRANDS,'brand_id',body.id,actor);
    default: throw new Error('Unknown delete action: ' + action);
  }
}

function createTransaction_(sheetName, body, prefix) {
  const session = requireSuperAdmin_(body);
  const sheet = getSheet_(sheetName);
  const expectedType = sheetName === SHEETS.INCOME ? 'income' : 'expense';
  validateCategory_(body.kategori, expectedType);

  const nominal = numberOrZero_(body.nominal);
  if (nominal <= 0) throw new Error('Nominal harus lebih besar dari 0.');

  const now = new Date(), id = generateId_(prefix);
  const row = {
    transaction_id:id,
    tanggal:cleanText_(body.tanggal || formatDate_(now),20),
    jam:cleanText_(body.jam || formatTime_(now),20),
    [sheetName === SHEETS.INCOME ? 'nama_transaksi' : 'nama_pengeluaran']:cleanText_(body.nama,160),
    kategori:cleanText_(body.kategori,100),
    event_id:cleanText_(body.event_id,80),
    [sheetName === SHEETS.INCOME ? 'sumber_dana' : 'vendor']:cleanText_(body.sumber || body.vendor,160),
    nominal,
    metode_pembayaran:cleanText_(body.metode_pembayaran,80),
    status:sheetName === SHEETS.EXPENSE ? 'confirmed' : undefined,
    penginput:session.email,
    catatan:cleanText_(body.catatan,1000),
    bukti:cleanText_(body.bukti,1000),
    created_at:formatDateTime_(now),
    brand_id:cleanText_(body.brand_id,80)
  };
  if (!getActiveBrand_(row.brand_id)) throw new Error('Brand tidak valid atau tidak aktif.');

  appendRowFromObject(sheet,getHeaders_(sheet),row);
  logAudit_(session.email,'CREATE_'+sheetName,id,'Membuat transaksi '+sheetName+' sebesar '+row.nominal);
  return row;
}

function createEvent_(body) {
  const session = requireSuperAdmin_(body);
  const brandId = String(body.brand_id || '').trim();
  if (!getActiveBrand_(brandId)) throw new Error('Brand tidak valid atau tidak aktif.');

  const name = cleanText_(body.nama_event,160);
  const game = cleanText_(body.game,120);
  if (!name) throw new Error('Nama event wajib diisi.');
  if (!game) throw new Error('Game wajib diisi.');
  if (body.tanggal_mulai || body.tanggal_selesai) {
    if (!validDateRange_(body.tanggal_mulai,body.tanggal_selesai)) throw new Error('Tanggal event tidak valid.');
  }

  const row = {
    event_id:generateId_('EVT'),
    brand_id:brandId,
    nama_event:name,
    game,
    kategori_event:cleanText_(body.kategori_event,100),
    sistem_turnamen:cleanText_(body.sistem_turnamen,100),
    tanggal_mulai:cleanText_(body.tanggal_mulai,20),
    tanggal_selesai:cleanText_(body.tanggal_selesai,20),
    jumlah_peserta:integerOrZero_(body.jumlah_peserta),
    biaya_registrasi:numberOrZero_(body.biaya_registrasi),
    target_pemasukan:numberOrZero_(body.target_pemasukan) || (integerOrZero_(body.jumlah_peserta) * numberOrZero_(body.biaya_registrasi)),
    budget:numberOrZero_(body.budget),
    prize_pool:numberOrZero_(body.prize_pool),
    sponsor_revenue:numberOrZero_(body.sponsor_revenue),
    other_income:numberOrZero_(body.other_income),
    other_expense:numberOrZero_(body.other_expense),
    expected_profit:(numberOrZero_(body.target_pemasukan) || (integerOrZero_(body.jumlah_peserta) * numberOrZero_(body.biaya_registrasi)))+numberOrZero_(body.sponsor_revenue)+numberOrZero_(body.other_income)-numberOrZero_(body.prize_pool)-numberOrZero_(body.budget)-numberOrZero_(body.other_expense),
    status:['upcoming','ongoing','completed','cancelled'].includes(String(body.status||'').toLowerCase()) ? String(body.status).toLowerCase() : 'upcoming',
    created_at:formatDateTime_(new Date())
  };
  appendRowFromObject(getSheet_(SHEETS.EVENTS),getHeaders_(getSheet_(SHEETS.EVENTS)),row);
  const eb=getSheet_(SHEETS.EVENT_BUDGETS);
  if(eb) appendRowFromObject(eb,getHeaders_(eb),{budget_id:generateId_('EB'),event_id:row.event_id,brand_id:brandId,registration_revenue:row.target_pemasukan,sponsor_revenue:row.sponsor_revenue,other_income:row.other_income,prize_pool:row.prize_pool,operational_budget:row.budget,other_expense:row.other_expense,expected_profit:row.expected_profit,created_at:row.created_at,updated_at:row.created_at});
  logAudit_(session.email,'CREATE_EVENT',row.event_id,'Membuat event '+row.nama_event);
  return row;
}

function validateCategory_(name, type) {
  if (!name) throw new Error('Kategori wajib dipilih.');
  const found = getActiveCategories_().find(r => String(r.nama_kategori).trim()===String(name).trim() && String(r.tipe).toLowerCase()===type);
  if (!found) throw new Error('Kategori tidak valid atau tidak aktif.');
}
function getActiveCategories_() { return getSheetAsObjects_(getSheet_(SHEETS.CATEGORIES)).filter(r=>!['inactive','nonaktif'].includes(String(r.status).toLowerCase())); }
function getActivePaymentMethods_() { return getSheetAsObjects_(getSheet_(SHEETS.PAYMENT_METHODS)).filter(r=>!['inactive','nonaktif'].includes(String(r.status).toLowerCase())); }

function getTransactions(params) {
  const income=getSheetAsObjects_(getSheet_(SHEETS.INCOME)).map(r=>Object.assign({type:'income'},r));
  const expense=getSheetAsObjects_(getSheet_(SHEETS.EXPENSE)).map(r=>Object.assign({type:'expense'},r));
  let all=income.concat(expense);
  if(params.event_id) all=all.filter(r=>r.event_id===params.event_id);
  if(params.brand_id) all=all.filter(r=>String(r.brand_id)===String(params.brand_id));
  all.sort((a,b)=>sheetDateTimeKey_(b.created_at)-sheetDateTimeKey_(a.created_at)); return all;
}
function getEvents(params) { let rows=getSheetAsObjects_(getSheet_(SHEETS.EVENTS)); if(params.status) rows=rows.filter(e=>e.status===params.status); if(params.brand_id) rows=rows.filter(e=>String(e.brand_id)===String(params.brand_id)); return rows; }
function getEventDetail(eventId) { const event=getSheetAsObjects_(getSheet_(SHEETS.EVENTS)).find(e=>e.event_id===eventId); if(!event) throw new Error('Event tidak ditemukan.'); return Object.assign({},event,calculateEventSummary_(eventId)); }
function getReport(params) { const income=getSheetAsObjects_(getSheet_(SHEETS.INCOME)), expense=getSheetAsObjects_(getSheet_(SHEETS.EXPENSE)); const i=sumField_(income,'nominal'), e=sumField_(expense,'nominal'); return {total_income:i,total_expense:e,saldo:i-e,income_by_category:groupSum_(income,'kategori','nominal'),expense_by_category:groupSum_(expense,'kategori','nominal'),jumlah_transaksi:income.length+expense.length}; }
function calculateDashboard() { const income=getSheetAsObjects_(getSheet_(SHEETS.INCOME)), expense=getSheetAsObjects_(getSheet_(SHEETS.EXPENSE)), events=getSheetAsObjects_(getSheet_(SHEETS.EVENTS)); const i=sumField_(income,'nominal'), e=sumField_(expense,'nominal'); return {saldo:i-e,total_income:i,total_expense:e,jumlah_event:events.length,jumlah_transaksi:income.length+expense.length,transaksi_terbaru:getTransactions({}).slice(0,5)}; }
function calculateEventSummary_(eventId) { const i=getSheetAsObjects_(getSheet_(SHEETS.INCOME)).filter(r=>r.event_id===eventId),e=getSheetAsObjects_(getSheet_(SHEETS.EXPENSE)).filter(r=>r.event_id===eventId); const ti=sumField_(i,'nominal'),te=sumField_(e,'nominal'); return {total_income:ti,total_expense:te,profit_loss:ti-te,jumlah_transaksi:i.length+e.length}; }

function updateRowById_(sheetName,idField,idValue,fields,user) {
  const sheet = getSheet_(sheetName);
  const headers = getHeaders_(sheet);
  const data = sheet.getDataRange().getValues();
  const idCol = headers.indexOf(idField);
  if (idCol === -1) throw new Error('Kolom ID tidak ditemukan.');

  const allowed = sheetName === SHEETS.INCOME || sheetName === SHEETS.EXPENSE
    ? ['tanggal','jam','kategori','event_id','sumber_dana','nama_transaksi','nama_pengeluaran','vendor','nominal','metode_pembayaran','status','penginput','catatan','bukti']
    : sheetName === SHEETS.EVENTS
      ? ['brand_id','nama_event','game','kategori_event','sistem_turnamen','tanggal_mulai','tanggal_selesai','jumlah_peserta','biaya_registrasi','target_pemasukan','budget','prize_pool','sponsor_revenue','other_income','other_expense','expected_profit','status']
      : ['nama_brand','status'];

  const requested = Object.keys(fields || {});
  const invalid = requested.filter(k => !allowed.includes(k));
  if (invalid.length) throw new Error('Field tidak boleh diubah: ' + invalid.join(', '));

  for (let i=1;i<data.length;i++) {
    if (String(data[i][idCol]) !== String(idValue)) continue;

    if (sheetName === SHEETS.INCOME || sheetName === SHEETS.EXPENSE) {
      const category = fields.kategori !== undefined ? String(fields.kategori).trim() : String(data[i][headers.indexOf('kategori')] || '');
      validateCategory_(category, sheetName === SHEETS.INCOME ? 'income' : 'expense');
      if (fields.nominal !== undefined && numberOrZero_(fields.nominal) <= 0) throw new Error('Nominal harus lebih besar dari 0.');
    }
    if (sheetName === SHEETS.EVENTS && fields.brand_id !== undefined && !getActiveBrand_(fields.brand_id)) {
      throw new Error('Brand tidak valid atau tidak aktif.');
    }

    requested.forEach(k => {
      const c = headers.indexOf(k);
      if (c === -1) return;
      let value = fields[k];
      if (['nominal','budget','prize_pool','target_pemasukan','biaya_registrasi'].includes(k)) value = numberOrZero_(value);
      else if (k === 'jumlah_peserta') value = integerOrZero_(value);
      else value = cleanText_(value, k === 'catatan' ? 1000 : 500);
      sheet.getRange(i+1,c+1).setValue(value);
    });

    logAudit_(user || 'SUPER_ADMIN','UPDATE_' + sheetName,idValue,'Update: ' + requested.join(', '));
    invalidateSheetCache_(sheetName);
    return {updated:true,id:idValue};
  }
  throw new Error('Data tidak ditemukan: ' + idValue);
}

function deleteRowById_(sheetName,idField,idValue,user) { const sheet=getSheet_(sheetName),headers=getHeaders_(sheet),idCol=headers.indexOf(idField),data=sheet.getDataRange().getValues(); for(let i=1;i<data.length;i++){if(String(data[i][idCol])===String(idValue)){sheet.deleteRow(i+1);logAudit_(user,'DELETE_'+sheetName,idValue,'Menghapus data');invalidateSheetCache_(sheetName);return {deleted:true,id:idValue};}} throw new Error('Data tidak ditemukan: '+idValue); }


function getRequests(params) {
  // Request listing is private by design. Only an authenticated session
  // may access the ledger; public tracking uses request_status + access token.
  const auth = requireSession_({token:String(params.token || '')});
  let rows = getSheetAsObjects_(getSheet_(SHEETS.REQUESTS)).reverse();

  if (auth.role !== 'SUPER_ADMIN') {
    const uid = String(auth.userId || auth.email);
    rows = rows.filter(r =>
      String(r.user_id) === uid ||
      hasPermission_(auth, r.brand_id, 'view_requests')
    );
  }

  const status = String(params.status || '').toUpperCase();
  const type = String(params.type || '').toUpperCase();
  if (status) rows = rows.filter(r => String(r.status).toUpperCase() === status);
  if (type) rows = rows.filter(r => String(r.type).toUpperCase() === type);
  if (params.request_id) rows = rows.filter(r => String(r.request_id) === String(params.request_id));
  return rows.map(sanitizeRequest_);
}

function createFinanceRequest_(body) {
  const auth = requireSession_({token:String(body.token||'')});
  body = Object.assign({}, body, {user_id:auth.userId||auth.email,user_name:auth.userName||auth.email});

  const type = String(body.type || '').toUpperCase();
  const allowed = ['INCOME','EXPENSE','TOURNAMENT','SPONSOR','EVENT'];
  if (!allowed.includes(type)) throw new Error('Jenis pengajuan tidak valid.');

  const brandId = String(body.brand_id || '').trim();
  if (!brandId || !getActiveBrand_(brandId)) throw new Error('Brand tidak valid atau tidak aktif.');
  assertPermission_(auth, brandId, 'create_request');

  const name = cleanText_(body.nama, 160);
  if (!name) throw new Error('Nama/judul pengajuan wajib diisi.');

  const nominal = numberOrZero_(body.nominal);
  const peserta = integerOrZero_(body.jumlah_peserta);
  const biaya = numberOrZero_(body.biaya_registrasi);
  const target = numberOrZero_(body.target_pemasukan) || (peserta * biaya);
  const budget = numberOrZero_(body.budget);
  const prize = numberOrZero_(body.prize_pool);

  if (['INCOME','EXPENSE'].includes(type) && nominal <= 0) throw new Error('Nominal harus lebih besar dari 0.');
  if (['TOURNAMENT','EVENT'].includes(type) && !cleanText_(body.game, 120)) throw new Error('Game wajib diisi.');
  if (['TOURNAMENT','EVENT'].includes(type) && !validDateRange_(body.tanggal_mulai, body.tanggal_selesai)) throw new Error('Tanggal acara tidak valid.');
  if (peserta < 0 || biaya < 0 || target < 0 || budget < 0 || prize < 0) throw new Error('Nilai angka tidak valid.');

  const id = generateId_('REQ');
  const accessToken = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  const row = {
    request_id: id,
    brand_id: brandId,
    user_id: cleanText_(body.user_id || 'ADMIN', 80),
    user_name: cleanText_(body.user_name || 'Admin', 100) || 'Admin',
    type,
    nama: name,
    kategori: cleanText_(body.kategori, 100),
    event_id: cleanText_(body.event_id, 80),
    nominal,
    metode_pembayaran: cleanText_(body.metode_pembayaran, 80),
    vendor: cleanText_(body.vendor, 160),
    catatan: cleanText_(body.catatan, 1000),
    bukti: cleanText_(body.bukti, 1000),
    status:'PENDING',
    approved_by:'',
    approved_at:'',
    rejection_reason:'',
    created_at:formatDateTime_(new Date()),
    game:cleanText_(body.game, 120),
    kategori_event:cleanText_(body.kategori_event, 100),
    sistem_turnamen:cleanText_(body.sistem_turnamen, 100),
    tanggal_mulai:cleanText_(body.tanggal_mulai, 20),
    tanggal_selesai:cleanText_(body.tanggal_selesai, 20),
    jumlah_peserta:peserta,
    biaya_registrasi:biaya,
    target_pemasukan:target,
    budget,
    prize_pool:prize,
    whatsapp_url:'',
    access_token_hash:hashPassword_(accessToken)
  };

  if (['INCOME','EXPENSE'].includes(type)) validateCategory_(row.kategori, type.toLowerCase());
  appendRowFromObject(getSheet_(SHEETS.REQUESTS), getHeaders_(getSheet_(SHEETS.REQUESTS)), row);
  logAudit_(row.user_name, 'CREATE_REQUEST', id, 'Pengajuan ' + type);
  return {request_id:id,status:'PENDING',type,request_access_token:accessToken};
}

function sanitizeRequest_(row) {
  const out = Object.assign({}, row);
  delete out.access_token_hash;
  return out;
}

function getRequestStatus_(id, accessToken, superToken) {
  const requestId = String(id || '').trim();
  if (!requestId) throw new Error('ID pengajuan wajib diisi.');
  const r = getSheetAsObjects_(getSheet_(SHEETS.REQUESTS)).find(x => String(x.request_id) === requestId);
  if (!r) throw new Error('Pengajuan tidak ditemukan.');

  if (superToken) {
    requireSuperAdmin_({token:superToken});
  } else {
    const supplied = String(accessToken || '');
    if (!supplied || !safeEqual_(hashPassword_(supplied), String(r.access_token_hash || ''))) {
      throw new Error('Akses pengajuan tidak valid.');
    }
  }
  return sanitizeRequest_(r);
}

function sessionInfo_(params) {
  const session = requireSession_({token:String(params.token || '')}, true);
  return {role:session.role,email:session.email,user_id:session.userId||session.email,user_name:session.userName||session.email,expires_at:session.expiresAt};
}
function requireSession_(body, allowPasswordChange) {
  const token = String(body.token || '');
  if (!token) throw new Error('Login diperlukan.');
  const session = getSession_(token);
  if (!session || !session.role || !session.email) throw new Error('Sesi tidak valid atau sudah kedaluwarsa. Silakan login kembali.');
  if (session.mustChangePassword && !allowPasswordChange) throw new Error('PASSWORD_CHANGE_REQUIRED');
  session.__token = token;
  return session;
}


function uploadBukti_(body) {
  const requestId = String(body.request_id || '').trim();
  const accessToken = String(body.request_access_token || '');
  if (!requestId || !accessToken) throw new Error('Akses upload tidak valid.');
  const row = getRequestStatus_(requestId, accessToken, '');
  if (row.status !== 'PENDING') throw new Error('Bukti hanya dapat diunggah untuk pengajuan PENDING.');
  if (!body.base64Data || !body.filename || !body.mimeType) throw new Error('Data file tidak lengkap.');

  const mime = String(body.mimeType).toLowerCase();
  const allowedMimes = ['image/jpeg','image/png','image/webp','application/pdf'];
  if (!allowedMimes.includes(mime)) throw new Error('Format bukti harus JPG, PNG, WEBP, atau PDF.');
  const filename = cleanFileName_(body.filename);
  const estimatedBytes = Math.ceil(String(body.base64Data).length * 0.75);
  if (estimatedBytes <= 0 || estimatedBytes > MAX_UPLOAD_BYTES) throw new Error('Ukuran bukti maksimal 8 MB.');

  const decoded = Utilities.base64Decode(String(body.base64Data));
  const file = getDriveFolder_().createFile(Utilities.newBlob(decoded, mime, filename));
  const url = file.getUrl();

  updateRequestFieldsById_(requestId, {bukti:url});
  return {url,fileId:file.getId()};
}


function updateRequestStatus_(body) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const requestId = String(body.id || '').trim();
    const status = String(body.status || '').toUpperCase();
    if (!['APPROVED','REJECTED','CANCELLED'].includes(status)) throw new Error('Status approval tidak valid.');

    const session = requireSuperAdmin_(body);
    const sheet = getSheet_(SHEETS.REQUESTS);
    const headers = getHeaders_(sheet);
    const data = sheet.getDataRange().getValues();
    const idCol = headers.indexOf('request_id');
    const statusCol = headers.indexOf('status');

    for (let i=1; i<data.length; i++) {
      if (String(data[i][idCol]) !== requestId) continue;

      const rowNum = i + 1;
      const current = String(data[i][statusCol] || '').toUpperCase();
      if (current !== 'PENDING') throw new Error('Pengajuan sudah diproses: ' + current);

      const obj = {};
      headers.forEach((h,j) => obj[h] = data[i][j]);

      let wa = '';
      if (status === 'APPROVED') {
        if (['INCOME','EXPENSE'].includes(obj.type)) finalizeApprovedFinance_(obj, body);
        if (obj.type === 'SPONSOR') finalizeApprovedSponsor_(obj, body);
        if (obj.type === 'EVENT') finalizeApprovedEvent_(obj, body);
        if (['TOURNAMENT','SPONSOR','EVENT'].includes(obj.type)) wa = buildWhatsAppUrl_(obj);
      }

      const set = (f,v) => {
        const c = headers.indexOf(f);
        if (c !== -1) sheet.getRange(rowNum,c+1).setValue(v);
      };
      set('status', status);
      set('approved_by', session.email);
      set('approved_at', formatDateTime_(new Date()));
      set('rejection_reason', status === 'REJECTED' ? cleanText_(body.reason, 500) : '');
      set('whatsapp_url', wa);

      logAudit_(session.email, status + '_REQUEST', requestId, body.reason || '');
      invalidateSheetCache_(SHEETS.REQUESTS);
      return {request_id:requestId,status,whatsapp_url:wa};
    }
    throw new Error('Pengajuan tidak ditemukan: ' + requestId);
  } finally {
    lock.releaseLock();
  }
}

function finalizeApprovedFinance_(obj,body){const common={tanggal:formatDate_(new Date()),jam:formatTime_(new Date()),kategori:obj.kategori,event_id:obj.event_id,nominal:Number(obj.nominal)||0,metode_pembayaran:obj.metode_pembayaran,penginput:obj.user_name||obj.user_id||body.user,catatan:obj.catatan,bukti:obj.bukti,brand_id:obj.brand_id};if(String(obj.type).toUpperCase()==='INCOME')createTransaction_(SHEETS.INCOME,Object.assign({},common,{nama:obj.nama}), 'IN');else createTransaction_(SHEETS.EXPENSE,Object.assign({},common,{nama:obj.nama,vendor:obj.vendor}),'EX');}
function finalizeApprovedSponsor_(obj, body) {
  const nominal = Number(obj.nominal) || 0;
  if (nominal <= 0) throw new Error('Nominal sponsor harus lebih besar dari 0 untuk approval.');
  createTransaction_(SHEETS.INCOME, {
    token: body.token,
    tanggal: formatDate_(new Date()), jam: formatTime_(new Date()),
    kategori: 'Sponsor', event_id: obj.event_id || '', nominal,
    metode_pembayaran: obj.metode_pembayaran || 'Lainnya',
    penginput: obj.user_name || obj.user_id || body.user,
    catatan: obj.catatan || ('Sponsor: ' + (obj.vendor || obj.nama || 'Sponsor')),
    bukti: obj.bukti || '', brand_id: obj.brand_id, nama: obj.nama || 'Pemasukan Sponsor'
  }, 'IN');
}
function finalizeApprovedEvent_(obj,body){
  // The approving Super Admin session is reused; do not perform a second
  // authentication lookup without forwarding the token.
  return createEvent_({
    token:body.token,
    user:body.user,
    brand_id:obj.brand_id,
    nama_event:obj.nama,
    game:obj.game,
    kategori_event:obj.kategori_event,
    sistem_turnamen:obj.sistem_turnamen,
    tanggal_mulai:obj.tanggal_mulai,
    tanggal_selesai:obj.tanggal_selesai,
    jumlah_peserta:obj.jumlah_peserta,
    biaya_registrasi:obj.biaya_registrasi,
    target_pemasukan:obj.target_pemasukan,
    budget:obj.budget,
    prize_pool:obj.prize_pool,
    sponsor_revenue:obj.sponsor_revenue,
    other_income:obj.other_income,
    other_expense:obj.other_expense,
    status:'upcoming'
  });
}
function cancelFinanceRequest_(body){ const session=requireSuperAdmin_(body); return updateRequestStatus_(Object.assign({},body,{status:'CANCELLED',user:session.email})); }

const DEFAULT_ADMIN_PERMISSIONS_=[];
function getUserBrandAccess_(session){
  if(session.role==='SUPER_ADMIN') return getSheetAsObjects_(getSheet_(SHEETS.BRANDS)).filter(r=>String(r.status).toUpperCase()!=='INACTIVE').map(b=>({brand_id:String(b.brand_id),permissions:['*']}));
  const rows=getSheetAsObjects_(getSheet_(SHEETS.BRAND_USERS));
  const uid=String(session.userId||session.email);
  return rows.filter(r=>String(r.user_id)===uid && String(r.status).toUpperCase()!=='INACTIVE').map(r=>({brand_id:String(r.brand_id),permissions:parsePermissions_(r.permissions)}));
}
function parsePermissions_(raw){try{const a=JSON.parse(String(raw||''));return Array.isArray(a)?a.map(String):DEFAULT_ADMIN_PERMISSIONS_.slice();}catch(e){return DEFAULT_ADMIN_PERMISSIONS_.slice();}}
function hasPermission_(session,brandId,permission){if(session.role==='SUPER_ADMIN')return true;const row=getUserBrandAccess_(session).find(x=>x.brand_id===String(brandId));return !!row && (row.permissions.includes('*')||row.permissions.includes(permission));}
function assertPermission_(session,brandId,permission){if(!hasPermission_(session,brandId,permission))throw new Error('Anda tidak memiliki permission '+permission+' untuk brand ini.');}
function getUsersForSession_(session) {
  if (session.role !== 'SUPER_ADMIN') throw new Error('Akses Super Admin diperlukan.');
  const authRows = getSheetAsObjects_(getSheet_(SHEETS.AUTH_USERS));
  const profileRows = getSheetAsObjects_(getSheet_(SHEETS.USERS));
  const profileById = {};
  profileRows.forEach(r => { profileById[String(r.id)] = r; });
  const accessRows = getSheetAsObjects_(getSheet_(SHEETS.BRAND_USERS));
  return authRows.map(u => {
    const p = profileById[String(u.id)] || {};
    const access = accessRows.filter(a => String(a.user_id) === String(u.id) && String(a.status).toUpperCase() !== 'INACTIVE');
    return {
      id:String(u.id||''), nama:String(p.nama||u.email||''), email:String(u.email||''), role:String(u.role||''),
      status:String(u.status||''), must_change_password:String(u.must_change_password||'FALSE').toUpperCase()==='TRUE',
      created_at:String(u.created_at||p.created_at||''),
      brand_ids:access.map(a=>String(a.brand_id||'')),
      permissions:access.reduce((all,a)=>all.concat(parsePermissions_(a.permissions)),[])
        .filter((v,i,arr)=>arr.indexOf(v)===i)
    };
  });
}

function getAccessControl_(){
 const users=getSheetAsObjects_(getSheet_(SHEETS.AUTH_USERS)).filter(u=>String(u.role).toUpperCase()==='ADMIN').map(u=>({id:u.id,email:u.email,status:u.status}));
 const brands=getSheetAsObjects_(getSheet_(SHEETS.BRANDS)).filter(b=>String(b.status).toUpperCase()!=='INACTIVE');
 const access=getSheetAsObjects_(getSheet_(SHEETS.BRAND_USERS)).map(r=>({id:r.id,user_id:String(r.user_id),brand_id:String(r.brand_id),permissions:parsePermissions_(r.permissions),status:r.status}));
 return {users,brands,access,permission_catalog:[['view_cash','Lihat Kas'],['view_cash_history','Lihat Riwayat Kas'],['view_transactions','Lihat Transaksi'],['export_transactions','Export Transaksi'],['view_events','Lihat Event'],['view_event_finance','Lihat Keuangan Event'],['create_request','Buat Pengajuan'],['view_requests','Lihat Pengajuan'],['view_reports','Lihat Report'],['export_reports','Export Report']]};
}
function updateBrandAccess_(body){
 const session=requireSuperAdmin_(body); const userId=String(body.user_id||''); const brandId=String(body.brand_id||'');
 if(!userId||!brandId)throw new Error('User dan brand wajib diisi.');
 if(!getActiveBrand_(brandId))throw new Error('Brand tidak aktif.');
 const sh=getSheet_(SHEETS.BRAND_USERS), headers=getHeaders_(sh), rows=getSheetAsObjects_(sh);
 const perms=Array.isArray(body.permissions)?body.permissions.map(String):[]; const existing=rows.find(r=>String(r.user_id)===userId&&String(r.brand_id)===brandId);
 if(!perms.length){if(existing){const data=sh.getDataRange().getValues(),hc=headers.indexOf('id');for(let i=1;i<data.length;i++)if(String(data[i][hc])===String(existing.id)){sh.deleteRow(i+1);break;}} logAudit_(session.email,'REVOKE_BRAND_ACCESS',userId+'|'+brandId,'Permission dicabut');return {updated:true,revoked:true};}
 if(existing){const data=sh.getDataRange().getValues(),hc=headers.indexOf('id');for(let i=1;i<data.length;i++)if(String(data[i][hc])===String(existing.id)){const pc=headers.indexOf('permissions'),sc=headers.indexOf('status');if(pc>=0)sh.getRange(i+1,pc+1).setValue(JSON.stringify(perms));if(sc>=0)sh.getRange(i+1,sc+1).setValue('ACTIVE');break;}}
 else appendRowFromObject(sh,headers,{id:generateId_('BU'),brand_id:brandId,user_id:userId,role:'ADMIN',permissions:JSON.stringify(perms),status:'ACTIVE',created_at:formatDateTime_(new Date())});
 logAudit_(session.email,'UPDATE_BRAND_ACCESS',userId+'|'+brandId,JSON.stringify(perms)); return {updated:true};
}
function getTransactionsForSession_(session,params){let rows=getTransactions(params);if(session.role==='SUPER_ADMIN')return rows;return rows.filter(r=>hasPermission_(session,r.brand_id,'view_transactions'));}
function getEventsForSession_(session,params){let rows=getEvents(params);if(session.role==='SUPER_ADMIN')return rows;return rows.filter(r=>hasPermission_(session,r.brand_id,'view_events'));}
function calculateDashboardForSession_(session){
 const brands=getCashOverviewForSession_({token:findTokenForSession_(session)});
 const income=brands.reduce((s,b)=>s+Number(b.total_income||0),0), expense=brands.reduce((s,b)=>s+Number(b.total_expense||0),0);
 const events=getEventsForSession_(session,{}), tx=getTransactionsForSession_(session,{});
 const monthly=buildMonthlyCashflow_(tx,6);
 return {saldo:brands.reduce((s,b)=>s+Number(b.saldo_sistem||0),0),total_income:income,total_expense:expense,jumlah_event:events.length,jumlah_transaksi:tx.length,transaksi_terbaru:tx.slice(0,8),cash_by_brand:brands,monthly_cashflow:monthly};
}
function buildMonthlyCashflow_(rows,count){
 const now=new Date(), out=[];
 for(let i=count-1;i>=0;i--){const d=new Date(now.getFullYear(),now.getMonth()-i,1);out.push({key:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),label:Utilities.formatDate(d,getTimezone_(),'MMM'),income:0,expense:0});}
 const map={};out.forEach(x=>map[x.key]=x);
 rows.forEach(r=>{const raw=String(r.created_at||r.tanggal||'');const t=sheetDateTimeKey_(raw);if(!t)return;const d=new Date(t),key=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');if(!map[key])return;const n=Number(r.nominal)||0;if(r.type==='income')map[key].income+=n;else map[key].expense+=n;});
 return out;
}
function findTokenForSession_(session){return session.__token||'';}
function getReportForSession_(session,params){const tx=getTransactionsForSession_(session,params||{}),inc=tx.filter(x=>x.type==='income'),exp=tx.filter(x=>x.type==='expense');return {total_income:sumField_(inc,'nominal'),total_expense:sumField_(exp,'nominal'),saldo:sumField_(inc,'nominal')-sumField_(exp,'nominal'),income_by_category:groupSum_(inc,'kategori','nominal'),expense_by_category:groupSum_(exp,'kategori','nominal'),jumlah_transaksi:tx.length};}

function getUserBrandIds_(session) { return getUserBrandAccess_(session).map(x=>String(x.brand_id)); }
function requireAdminOrSuper_(params) { const session=requireSession_(params); return session; }
function assertBrandAccess_(session, brandId) {
  if (session.role==='SUPER_ADMIN') return true;
  if (!getUserBrandIds_(session).includes(String(brandId))) throw new Error('Anda tidak memiliki akses ke brand ini.');
  return true;
}
function getBrandsForSession_(params) {
  const session=requireSession_(params);
  const ids=getUserBrandIds_(session);
  return getSheetAsObjects_(getSheet_(SHEETS.BRANDS)).filter(r=>String(r.status).toUpperCase()!=='INACTIVE' && ids.includes(String(r.brand_id)));
}
function getCashOverviewForSession_(params) {
  const session=requireSession_(params);
  const rows=getCashOverview();
  if(session.role==='SUPER_ADMIN') return rows;
  const ids=getUserBrandIds_(session);
  return rows.filter(r=>ids.includes(String(r.brand_id)) && hasPermission_(session,r.brand_id,'view_cash'));
}
function getCashOverview(){const brands=getSheetAsObjects_(getSheet_(SHEETS.BRANDS)).filter(r=>String(r.status).toUpperCase()!=='INACTIVE'),accounts=getSheetAsObjects_(getSheet_(SHEETS.CASH_ACCOUNTS)),income=getSheetAsObjects_(getSheet_(SHEETS.INCOME)),expense=getSheetAsObjects_(getSheet_(SHEETS.EXPENSE));return brands.map(b=>{const a=accounts.find(x=>String(x.brand_id)===String(b.brand_id))||{},inc=income.filter(t=>String(t.brand_id)===String(b.brand_id)),exp=expense.filter(t=>String(t.brand_id)===String(b.brand_id)),sa=Number(a.saldo_awal)||0,ti=sumField_(inc,'nominal'),te=sumField_(exp,'nominal'),ss=sa+ti-te;return{brand_id:b.brand_id,nama_brand:b.nama_brand,saldo_awal:sa,total_income:ti,total_expense:te,saldo_sistem:ss,saldo_aktual:a.saldo_aktual===''||a.saldo_aktual===undefined?ss:Number(a.saldo_aktual),updated_at:a.updated_at||''};});}
function createBrand_(body) {
  const session = requireSuperAdmin_(body);
  const name = cleanText_(body.nama_brand, 100);
  if (!name) throw new Error('Nama brand wajib diisi.');
  const brands = getSheetAsObjects_(getSheet_(SHEETS.BRANDS));
  if (brands.some(b => String(b.nama_brand).trim().toLowerCase() === name.toLowerCase() && String(b.status).toUpperCase() !== 'INACTIVE')) {
    throw new Error('Nama brand sudah digunakan.');
  }
  const sheet = getSheet_(SHEETS.BRANDS);
  const id = generateId_('BRAND');
  appendRowFromObject(sheet,getHeaders_(sheet),{
    brand_id:id,nama_brand:name,status:'ACTIVE',created_at:formatDateTime_(new Date())
  });
  logAudit_(session.email,'CREATE_BRAND',id,'Membuat brand '+name);
  return {brand_id:id};
}

function updateBrand_(body){return updateRowById_(SHEETS.BRANDS,'brand_id',body.id,body.fields||{},body.user);}
function setupCash_(body) {
  const session = requireSuperAdmin_(body);
  if (!getActiveBrand_(body.brand_id)) throw new Error('Brand tidak valid atau tidak aktif.');
  const sheet = getSheet_(SHEETS.CASH_ACCOUNTS);
  const headers = getHeaders_(sheet);
  const data = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('brand_id');
  const now = formatDateTime_(new Date());
  const saldoAwal = numberOrZero_(body.saldo_awal);
  const saldoAktual = body.saldo_aktual === undefined ? saldoAwal : numberOrZero_(body.saldo_aktual);

  for (let i=1;i<data.length;i++) {
    if (String(data[i][idCol]) === String(body.brand_id)) {
      const f = {saldo_awal:saldoAwal,saldo_aktual:saldoAktual,updated_at:now,updated_by:session.email};
      Object.keys(f).forEach(k => { const c=headers.indexOf(k); if(c!==-1) sheet.getRange(i+1,c+1).setValue(f[k]); });
      return {updated:true,brand_id:body.brand_id};
    }
  }

  appendRowFromObject(sheet,headers,{
    cash_id:generateId_('CASH'),brand_id:body.brand_id,saldo_awal:saldoAwal,saldo_aktual:saldoAktual,
    updated_at:now,updated_by:session.email
  });
  return {created:true,brand_id:body.brand_id};
}

function createCashAdjustment_(body) {
  const session = requireSuperAdmin_(body);
  const before = numberOrZero_(body.saldo_sebelum);
  const after = numberOrZero_(body.saldo_sesudah);
  if (!getActiveBrand_(body.brand_id)) throw new Error('Brand tidak valid atau tidak aktif.');
  const id = generateId_('ADJ');
  appendRowFromObject(getSheet_(SHEETS.CASH_ADJUSTMENTS),getHeaders_(getSheet_(SHEETS.CASH_ADJUSTMENTS)),{
    adjustment_id:id,brand_id:body.brand_id,saldo_sebelum:before,saldo_sesudah:after,selisih:after-before,
    alasan:cleanText_(body.alasan,500),dibuat_oleh:session.email,created_at:formatDateTime_(new Date())
  });
  setupCash_({token:body.token,brand_id:body.brand_id,saldo_awal:body.saldo_awal,saldo_aktual:after});
  return {adjustment_id:id};
}

function requireSuperAdmin_(body) {
  const token = String(body.token || '');
  if (!token) throw new Error('SUPER ADMIN wajib login.');
  const session = getSession_(token);
  if (!session || session.role !== 'SUPER_ADMIN' || !session.email) {
    throw new Error('Sesi Super Admin tidak valid atau sudah kedaluwarsa. Silakan login kembali.');
  }
  return session;
}

function requireTokenParam_(params) {
  requireSuperAdmin_({token:String(params.token || '')});
}

function login_(body) {
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  if (!email || !password) throw new Error('Email dan password wajib diisi.');
  const lockKey='TCC_LOGIN_FAIL_'+hashPassword_(email);
  const cache=CacheService.getScriptCache();
  const failed=Number(cache.get(lockKey)||0);
  if(failed>=5) throw new Error('Akun sementara dikunci karena terlalu banyak percobaan login. Coba lagi dalam beberapa menit.');
  const ss = getSpreadsheet_();
  const sh = ss.getSheetByName(SHEETS.AUTH_USERS);
  const rows = sh ? getSheetAsObjects_(sh) : [];
  const row = rows.find(r => String(r.email || '').trim().toLowerCase() === email);
  const cfg = getConfig_();
  let role = '', userId = email, userName = email, storedHash = '', storedSalt = '';
  if (row && String(row.status || '').toUpperCase() === 'ACTIVE') {
    role = String(row.role || '').toUpperCase(); userId = String(row.id || email); userName = String(row.email || email); storedHash = String(row.password_hash || ''); storedSalt = String(row.password_salt || '');
  } else if (email === cfg.superAdminEmail.toLowerCase()) {
    role = 'SUPER_ADMIN'; storedHash = PropertiesService.getScriptProperties().getProperty(PROP_SUPER_ADMIN_PASSWORD_HASH) || DEFAULT_SUPER_ADMIN_PASSWORD_HASH; storedSalt = PropertiesService.getScriptProperties().getProperty(PROP_SUPER_ADMIN_PASSWORD_SALT) || '';
  } else throw new Error('Akun tidak ditemukan atau tidak aktif.');
  if (!['SUPER_ADMIN','ADMIN'].includes(role)) throw new Error('Role akun tidak valid.');
  if (!safeEqual_(hashPassword_(password, storedSalt), storedHash)) { const next=failed+1; cache.put(lockKey,String(next),600); throw new Error(next>=5?'Terlalu banyak percobaan login. Akun dikunci sementara.':'Email atau password salah.'); }
  cache.remove(lockKey);
  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const mustChangePassword = String(row?.must_change_password || 'FALSE').toUpperCase() === 'TRUE';
  CacheService.getScriptCache().put(PROP_SESSION_PREFIX + token, JSON.stringify({email,role,userId,userName,expiresAt,mustChangePassword}), SESSION_TTL_SECONDS);
  logAudit_(email,'LOGIN_'+role,'','Login berhasil');
  return {token,role,email,user_id:userId,user_name:userName,expires_at:expiresAt,must_change_password:mustChangePassword};
}

function getSession_(token) {
  try {
    const value = String(token || '');
    if (!value || value.length > 100) return null;
    const raw = CacheService.getScriptCache().get(PROP_SESSION_PREFIX + value);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !['SUPER_ADMIN','ADMIN'].includes(session.role) || !session.email || Number(session.expiresAt) <= Date.now()) {
      CacheService.getScriptCache().remove(PROP_SESSION_PREFIX + value);
      return null;
    }
    session.__token=value; return session;
  } catch (e) {
    return null;
  }
}

function revokeSession_(token) {
  const value = String(token || '');
  if (value) CacheService.getScriptCache().remove(PROP_SESSION_PREFIX + value);
}

function changePasswordForSession_(body) {
  const session = requireSession_(body, true);
  const current = String(body.current_password || '');
  const next = String(body.new_password || '');
  if (next.length < 12) throw new Error('Password baru minimal 12 karakter.');
  if (next === current) throw new Error('Password baru harus berbeda dari password lama.');

  if (session.role === 'SUPER_ADMIN') {
    const props = PropertiesService.getScriptProperties();
    const oldHash = props.getProperty(PROP_SUPER_ADMIN_PASSWORD_HASH) || DEFAULT_SUPER_ADMIN_PASSWORD_HASH;
    const oldSalt = props.getProperty(PROP_SUPER_ADMIN_PASSWORD_SALT) || '';
    if (!safeEqual_(hashPassword_(current, oldSalt), oldHash)) throw new Error('Password lama salah.');
    const newSalt = generateSalt_();
    const newHash = hashPassword_(next, newSalt);
    props.setProperty(PROP_SUPER_ADMIN_PASSWORD_HASH, newHash);
    props.setProperty(PROP_SUPER_ADMIN_PASSWORD_SALT, newSalt);
    const sh = getSheet_(SHEETS.AUTH_USERS);
    const headers = getHeaders_(sh);
    const data = sh.getDataRange().getValues();
    const emailCol = headers.indexOf('email'), hashCol = headers.indexOf('password_hash'), saltCol = headers.indexOf('password_salt'), changeCol = headers.indexOf('must_change_password');
    for (let i=1;i<data.length;i++) {
      if (String(data[i][emailCol] || '').toLowerCase() === String(session.email).toLowerCase()) {
        if (hashCol !== -1) sh.getRange(i+1,hashCol+1).setValue(newHash);
        if (saltCol !== -1) sh.getRange(i+1,saltCol+1).setValue(newSalt);
        if (changeCol !== -1) sh.getRange(i+1,changeCol+1).setValue('FALSE');
        break;
      }
    }
  } else {
    const sh = getSheet_(SHEETS.AUTH_USERS);
    const headers = getHeaders_(sh);
    const data = sh.getDataRange().getValues();
    const idCol = headers.indexOf('id'), hashCol = headers.indexOf('password_hash'), saltCol = headers.indexOf('password_salt'), changeCol = headers.indexOf('must_change_password');
    let found = false;
    for (let i=1;i<data.length;i++) {
      if (String(data[i][idCol]) === String(session.userId)) {
        const oldSalt = saltCol !== -1 ? String(data[i][saltCol] || '') : '';
        if (!safeEqual_(hashPassword_(current, oldSalt), String(data[i][hashCol] || ''))) throw new Error('Password lama salah.');
        const newSalt = generateSalt_();
        sh.getRange(i+1, hashCol+1).setValue(hashPassword_(next, newSalt));
        if (saltCol !== -1) sh.getRange(i+1, saltCol+1).setValue(newSalt);
        if (changeCol !== -1) sh.getRange(i+1, changeCol+1).setValue('FALSE');
        found = true; break;
      }
    }
    if (!found) throw new Error('Akun Admin tidak ditemukan.');
  }
  // Invalidate current session so the client must login again with the new password.
  revokeSession_(session.__token);
  logAudit_(session.email, 'CHANGE_PASSWORD', session.userId || session.email, 'Password akun diubah');
  return {changed:true, requires_login:true};
}

function changeSuperAdminPassword_(body) {
  const session = requireSuperAdmin_(body);
  const oldHash = PropertiesService.getScriptProperties().getProperty(PROP_SUPER_ADMIN_PASSWORD_HASH) || DEFAULT_SUPER_ADMIN_PASSWORD_HASH;
  const oldSalt = PropertiesService.getScriptProperties().getProperty(PROP_SUPER_ADMIN_PASSWORD_SALT) || '';
  if (!safeEqual_(hashPassword_(String(body.current_password || ''), oldSalt), oldHash)) throw new Error('Password lama salah.');

  const newPassword = String(body.new_password || '');
  if (newPassword.length < 12) throw new Error('Password baru minimal 12 karakter.');
  if (newPassword === String(body.current_password || '')) throw new Error('Password baru harus berbeda dari password lama.');

  const newSalt = generateSalt_();
  const hash = hashPassword_(newPassword, newSalt);
  PropertiesService.getScriptProperties().setProperty(PROP_SUPER_ADMIN_PASSWORD_HASH, hash);
  PropertiesService.getScriptProperties().setProperty(PROP_SUPER_ADMIN_PASSWORD_SALT, newSalt);

  const sh = getSheet_(SHEETS.AUTH_USERS);
  const rows = sh.getDataRange().getValues();
  const headers = getHeaders_(sh);
  const emailCol = headers.indexOf('email');
  const hashCol = headers.indexOf('password_hash');
  const saltCol = headers.indexOf('password_salt');
  const changeCol = headers.indexOf('must_change_password');
  for (let i=1;i<rows.length;i++) {
    if (String(rows[i][emailCol]).toLowerCase() === session.email.toLowerCase()) {
      if (hashCol !== -1) sh.getRange(i+1,hashCol+1).setValue(hash);
      if (saltCol !== -1) sh.getRange(i+1,saltCol+1).setValue(newSalt);
      if (changeCol !== -1) sh.getRange(i+1,changeCol+1).setValue('FALSE');
      break;
    }
  }
  logAudit_(session.email, 'CHANGE_SUPER_ADMIN_PASSWORD', '', 'Password Super Admin diubah');
  return {changed:true};
}

function createAuthUser_(body) {
  const session = requireSuperAdmin_(body);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const name = cleanText_(body.nama || email, 120);
  if (!email || !email.includes('@')) throw new Error('Email admin tidak valid.');
  if (password.length < 12) throw new Error('Password admin minimal 12 karakter.');
  const sh = getSheet_(SHEETS.AUTH_USERS); const rows = getSheetAsObjects_(sh);
  if (rows.some(r => String(r.email).toLowerCase() === email)) throw new Error('Email sudah terdaftar.');
  const id=generateId_('AUTH');
  const salt=generateSalt_();
  appendRowFromObject(sh,getHeaders_(sh),{id,email,password_hash:hashPassword_(password,salt),password_salt:salt,role:'ADMIN',status:'ACTIVE',must_change_password:'TRUE',created_at:formatDateTime_(new Date())});
  const us=getSheet_(SHEETS.USERS); appendRowFromObject(us,getHeaders_(us),{id,nama:name,email,role:'ADMIN',status:'ACTIVE',created_at:formatDateTime_(new Date())});
  const requestedBrands = Array.isArray(body.brand_ids) ? body.brand_ids.map(String) : [];
  const activeBrands = getSheetAsObjects_(getSheet_(SHEETS.BRANDS)).filter(r=>String(r.status).toUpperCase()!=='INACTIVE');
  const selected = activeBrands.filter(b=>requestedBrands.includes(String(b.brand_id)));
  const permissions = Array.isArray(body.permissions) && body.permissions.length ? body.permissions.map(String) : [];
  const bu=getSheet_(SHEETS.BRAND_USERS);
  selected.forEach(b=>appendRowFromObject(bu,getHeaders_(bu),{id:generateId_('BU'),brand_id:b.brand_id,user_id:id,role:'ADMIN',permissions:JSON.stringify(permissions),status:'ACTIVE',created_at:formatDateTime_(new Date())}));
  logAudit_(session.email,'CREATE_ADMIN',id,'Membuat akun admin '+email);
  return {id,email,role:'ADMIN',status:'ACTIVE'};
}

function setConfig_(body) {
  const session = requireSuperAdmin_(body);
  const number = String(body.whatsapp_number || '').replace(/\D/g,'');
  if (number && (number.length < 10 || number.length > 15)) throw new Error('Nomor WhatsApp tidak valid.');
  PropertiesService.getScriptProperties().setProperty(PROP_WHATSAPP_NUMBER, number);
  logAudit_(session.email, 'UPDATE_WHATSAPP_CONFIG', '', number ? 'Nomor WhatsApp diperbarui' : 'Nomor WhatsApp dihapus');
  return {whatsapp_number_configured:!!number};
}

function buildWhatsAppUrl_(obj) {
  const number = getConfig_().whatsappNumber;
  if (!number) return '';
  const message = [
    'Halo TCC,',
    'Status pengajuan: DISETUJUI',
    'ID: ' + cleanText_(obj.request_id, 80),
    'Jenis: ' + cleanText_(obj.type, 40),
    'Nama: ' + cleanText_(obj.nama, 160),
    obj.game ? 'Game: ' + cleanText_(obj.game, 120) : '',
    obj.catatan ? 'Catatan: ' + cleanText_(obj.catatan, 1000) : ''
  ].filter(Boolean).join('\n');
  return 'https://wa.me/' + number + '?text=' + encodeURIComponent(message);
}

function hashPassword_(password, salt) {
  // Salt opsional (backward-compatible): baris/akun lama yang belum punya
  // salt tersimpan tetap bisa login seperti biasa (hash tanpa salt, sama
  // seperti versi sebelumnya). Password BARU/yang diganti selalu dapat
  // salt acak baru — migrasi bertahap, tidak mengunci akun lama.
  const input = salt ? (String(salt) + ':' + String(password)) : String(password);
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return bytes.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2,'0')).join('');
}
function generateSalt_() { return Utilities.getUuid().replace(/-/g,'') + Utilities.getUuid().replace(/-/g,''); }

function ensureSheetSchema_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();
  const current = lastRow > 0 && lastCol > 0 ? sh.getRange(1,1,1,lastCol).getValues()[0].map(String) : [];
  const normalized = current.map(h => h.trim());

  if (lastRow === 0 || normalized.every(h => !h)) {
    sh.getRange(1,1,1,headers.length).setValues([headers]);
  } else {
    const existing = new Set(normalized.filter(Boolean));
    const missing = headers.filter(h => !existing.has(h));
    if (missing.length) sh.getRange(1,sh.getLastColumn()+1,1,missing.length).setValues([missing]);
  }
  sh.setFrozenRows(1);
}

function cleanText_(value, maxLen) {
  return String(value == null ? '' : value).replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0, maxLen || 500);
}
function cleanFileName_(value) {
  const base = cleanText_(value, 120).replace(/[\\\/:*?"<>|]+/g,'_');
  return base || ('bukti_' + Date.now());
}
function numberOrZero_(value) {
  const raw = String(value == null ? '' : value).replace(/[^0-9,.-]/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(',', '.');
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}
function integerOrZero_(value) {
  const raw = String(value == null ? '' : value).replace(/[^0-9-]/g,'');
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}
function validDateRange_(start, end) {
  if (!start || !end) return false;
  const a = new Date(String(start) + 'T00:00:00');
  const b = new Date(String(end) + 'T00:00:00');
  return !isNaN(a.getTime()) && !isNaN(b.getTime()) && a.getTime() <= b.getTime();
}
function getActiveBrand_(brandId) {
  return getSheetAsObjects_(getSheet_(SHEETS.BRANDS)).find(b =>
    String(b.brand_id) === String(brandId) && String(b.status).toUpperCase() !== 'INACTIVE'
  ) || null;
}
function safeEqual_(a,b) {
  a=String(a); b=String(b);
  if (a.length !== b.length) return false;
  let diff=0;
  for (let i=0;i<a.length;i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function updateRequestFieldsById_(requestId, fields) {
  const sheet = getSheet_(SHEETS.REQUESTS), headers = getHeaders_(sheet), data = sheet.getDataRange().getValues();
  const idCol = headers.indexOf('request_id');
  for (let i=1;i<data.length;i++) {
    if (String(data[i][idCol]) === String(requestId)) {
      Object.keys(fields).forEach(k => {
        const c = headers.indexOf(k);
        if (c !== -1) sheet.getRange(i+1,c+1).setValue(fields[k]);
      });
      return true;
    }
  }
  throw new Error('Pengajuan tidak ditemukan.');
}

function getSheet_(name){const sh=getSpreadsheet_().getSheetByName(name);if(!sh)throw new Error('Sheet tidak ditemukan: '+name);return sh;}

// --- Lightweight read cache (Fitur upgrade: mempercepat baca berulang tanpa
// membuat data terasa basi). Sheet yang berkaitan dengan auth/sesi/permission
// SENGAJA tidak di-cache demi keamanan (perubahan password/akses harus
// langsung berlaku, bukan menunggu TTL). Semua sheet lain di-cache singkat
// (20 detik) dan langsung di-invalidate begitu ada tulis (create/update/delete),
// jadi data tetap terasa real-time setelah aksi user, sekaligus lebih cepat
// untuk baca berulang (mis. dashboard yang baca INCOME+EXPENSE+EVENTS sekaligus).
const CACHE_TTL_SECONDS_ = 20;
const NO_CACHE_SHEETS_ = { USERS:1, AUTH_USERS:1, BRAND_USERS:1 };
function invalidateSheetCache_(sheetName){ try { CacheService.getScriptCache().remove('sheet_'+sheetName); } catch(e){} }
function getHeaders_(sheet){return sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];}
function getSheetAsObjects_(sheet){
  const name = sheet.getName();
  const cacheable = !NO_CACHE_SHEETS_[name];
  const cache = cacheable ? CacheService.getScriptCache() : null;
  if (cache) {
    try {
      const cached = cache.get('sheet_'+name);
      if (cached) return JSON.parse(cached);
    } catch(e) { /* cache miss/corrupt, fall through to live read */ }
  }
  const data=sheet.getDataRange().getValues();
  let rows;
  if(data.length<2) { rows=[]; }
  else {
    const headers=data[0]; rows=[];
    for(let i=1;i<data.length;i++){const o={};headers.forEach((h,j)=>o[h]=normalizeSheetValue_(h,data[i][j]));rows.push(o);}
  }
  if (cache) { try { cache.put('sheet_'+name, JSON.stringify(rows), CACHE_TTL_SECONDS_); } catch(e) { /* payload > 100KB cache limit, skip caching silently */ } }
  return rows;
}
function normalizeSheetValue_(header,value){if(!(value instanceof Date))return value;const k=String(header).toLowerCase();if(['tanggal','tanggal_mulai','tanggal_selesai'].includes(k))return formatDate_(value);if(k==='jam')return formatTime_(value);if(['created_at','waktu','approved_at'].includes(k))return formatDateTime_(value);return formatDateTime_(value);}
function appendRowFromObject(sheet,headers,obj){sheet.appendRow(headers.map(h=>obj[h]!==undefined?obj[h]:'')); invalidateSheetCache_(sheet.getName());}
function generateId_(prefix){return prefix+'-'+Utilities.formatDate(new Date(),getTimezone_(),'yyyyMMddHHmmss')+'-'+Math.floor(Math.random()*1000);}
function formatDate_(d){return Utilities.formatDate(d,getTimezone_(),'dd/MM/yyyy');}
function formatTime_(d){return Utilities.formatDate(d,getTimezone_(),'HH:mm:ss');}
function formatDateTime_(d){return Utilities.formatDate(d,getTimezone_(),'dd/MM/yyyy HH:mm:ss');}
function sheetDateTimeKey_(value){const raw=String(value||'').trim(),m=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/);if(!m){const d=new Date(raw);return isNaN(d.getTime())?0:d.getTime();}return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]),Number(m[4]||0),Number(m[5]||0),Number(m[6]||0)).getTime();}
function sumField_(rows,field){return rows.reduce((s,r)=>s+(Number(r[field])||0),0);}
function groupSum_(rows,groupField,sumFieldName){const r={};rows.forEach(x=>{const k=x[groupField]||'Lainnya';r[k]=(r[k]||0)+(Number(x[sumFieldName])||0);});return r;}
function logAudit_(user,activity,id,detail){try{getSheet_(SHEETS.AUDIT_LOGS).appendRow([generateId_('LOG'),user||'system',activity,id||'',formatDateTime_(new Date()),detail||'']);}catch(e){Logger.log(e.message);}}
function jsonResponse(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);}

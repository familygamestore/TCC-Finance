# TCC Finance System

Sistem keuangan sederhana untuk TCC. Arsitektur:

```
GitHub → Vercel (frontend Next.js) → Google Apps Script (API) → Google Spreadsheet (database) → Google Drive (bukti)
```

Tidak ada database eksternal (bukan MySQL/Firebase/Supabase/dll). Semua data ada di Google Spreadsheet, semua file bukti ada di Google Drive.

## Isi folder

```
tcc-finance/
├── apps-script/     -> kode backend (Code.gs), copy-paste ke Google Apps Script
├── frontend/         -> aplikasi Next.js minimalis (dashboard, transaksi, event)
└── docs/              -> struktur spreadsheet & catatan setup
```

## Cara setup (urutan wajib)

### 1. Buat Google Spreadsheet

1. Buat spreadsheet baru di Google Sheets, beri nama misalnya `TCC_DATABASE`.
2. Buat sheet-sheet berikut, sesuai header di `docs/spreadsheet-setup.md`:
   `USERS`, `EVENTS`, `INCOME`, `EXPENSE`, `CATEGORIES`, `PAYMENT_METHODS`, `AUDIT_LOGS`.
3. Salin **Spreadsheet ID** dari URL (bagian antara `/d/` dan `/edit`).

### 2. Buat folder Google Drive untuk bukti

1. Buat folder baru di Google Drive, misalnya `TCC_BUKTI_TRANSAKSI`.
2. Salin **Folder ID** dari URL.

### 3. Deploy Google Apps Script

1. Buka [script.google.com](https://script.google.com) → New Project.
2. Hapus isi default, copy-paste seluruh isi `apps-script/Code.gs`.
3. Di bagian atas file, isi `SPREADSHEET_ID` dan `DRIVE_FOLDER_ID` dengan ID dari langkah 1 & 2.
4. Klik **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** (supaya bisa diakses dari website)
5. Klik Deploy, izinkan akses (authorize). Salin **Web App URL** yang dihasilkan — ini yang dipakai frontend.
6. Setiap kali kamu mengubah `Code.gs`, buat **New deployment** lagi (atau manage deployment → edit → new version) supaya perubahan berlaku.

### 4. Setup frontend (Next.js) secara lokal

```bash
cd frontend
cp .env.example .env.local
# isi NEXT_PUBLIC_APPS_SCRIPT_URL dengan Web App URL dari langkah 3
npm install
npm run dev
```

Buka `http://localhost:3000`.

### 5. Push ke GitHub

```bash
cd tcc-finance
git init
git add .
git commit -m "init: TCC finance system"
git branch -M main
git remote add origin <URL_REPO_GITHUB_KAMU>
git push -u origin main
```

### 6. Deploy ke Vercel

1. Buka [vercel.com](https://vercel.com) → New Project → import repo GitHub kamu.
2. Set **Root Directory** ke `frontend`.
3. Tambahkan Environment Variable:
   - `NEXT_PUBLIC_APPS_SCRIPT_URL` = Web App URL dari Apps Script.
4. Deploy.

Setelah ini, alur lengkap sudah jalan: Vercel → Apps Script → Spreadsheet/Drive.

## Alur data (ringkas)

```
Browser (Vercel)
   │  fetch(NEXT_PUBLIC_APPS_SCRIPT_URL)
   ▼
Google Apps Script Web App
   │  doGet  -> baca dashboard/transaksi/event/kategori/laporan
   │  doPost -> action: create/update/delete (dikirim via POST + field "method")
   ▼
Google Spreadsheet (data) + Google Drive (file bukti)
```

Saldo & profit/loss **tidak disimpan manual** — selalu dihitung dari data transaksi di `Code.gs` (lihat fungsi `calculateDashboard` dan `calculateEventSummary`).

## Catatan

- Ini starter minimalis: fokus ke alur data yang benar-benar jalan, bukan ke tampilan mewah. Silakan kembangkan UI-nya sesuai kebutuhan TCC.
- Google Spreadsheet cocok untuk tahap awal. Kalau volume transaksi sudah sangat besar (ribuan/bulan), pertimbangkan migrasi ke database sungguhan nanti — arsitektur ini tetap bisa jadi titik awal yang valid.

# TCC Finance v3 Ultra

Financial command center untuk TCC dengan Next.js, Vercel, Google Apps Script, dan Google Sheets.

## Stack
- Next.js 16.2.11
- React 19.2.8
- TypeScript 5.9+
- Node.js 22
- Google Apps Script + Google Sheets

## Vercel
Set **Root Directory** ke `frontend`.

Environment variable:

```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Build command: `npm run build`
Install command: `npm install`

## Spreadsheet
Sheet wajib: `USERS`, `EVENTS`, `INCOME`, `EXPENSE`, `CATEGORIES`, `PAYMENT_METHODS`, `AUDIT_LOGS`.

`CATEGORIES.tipe` harus `income` atau `expense`. Kategori inactive tidak ditampilkan dan transaksi tidak dapat dibuat memakai kategori inactive.

`PAYMENT_METHODS` menggunakan header `id | nama | status`.

## Google Apps Script
Set `SPREADSHEET_ID`, `DRIVE_FOLDER_ID`, dan timezone di `apps-script/Code.gs`, lalu deploy sebagai Web App.

Setelah mengubah `Code.gs`, buat **New version** pada deployment Web App agar perubahan backend aktif.

# TCC Finance v6 Ultra

- Login Super Admin + Admin berbasis AUTH_USERS.
- Super Admin dapat membuat akun Admin.
- Admin memiliki portal pengajuan dan riwayat pengajuan miliknya.
- Form input diperbaiki agar background putih selalu memakai teks gelap dan kontras.
- Google Apps Script + Spreadsheet tetap menjadi backend/database.

## Kredensial testing baru
Super Admin (setup baru): `superadmin@tcc.local` / `TCC@Admin2026!`
Default Admin (setup baru): `admin@tcc.local` / `TCC@Admin2026!`

Segera ganti password sebelum production. Jika Script Properties dari instalasi lama sudah berisi password hash, nilai lama tetap dipertahankan sampai kamu menggantinya.

## Deploy Apps Script
1. Ganti `apps-script/Code.gs`.
2. Jalankan `upgradeTCCFinanceV4()` satu kali.
3. Deploy > Manage deployments > Edit > New version > Deploy.
4. Pastikan `NEXT_PUBLIC_APPS_SCRIPT_URL` menunjuk deployment terbaru.

## Local
```bash
npm.cmd install
npm.cmd run dev
```

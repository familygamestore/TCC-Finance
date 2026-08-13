# TCC Finance v5 — Upgrade Spreadsheet Lama

Versi ini dirancang untuk **upgrade database lama**, bukan membuat database operasional baru.

## Apps Script

1. Buka Apps Script yang terhubung ke Spreadsheet lama.
2. Ganti isi `Code.gs` dengan file v5.
3. Jalankan `upgradeTCCFinanceV4()`.
4. Berikan izin Google jika diminta.
5. Pastikan fungsi selesai tanpa error.
6. Deploy → Manage deployments → Edit → pilih **New version** → Deploy.

Upgrade mempertahankan data lama dan menambahkan header yang belum tersedia. Jangan menghapus sheet atau kolom lama secara manual.

## Kolom baru yang penting

Sheet `REQUESTS` mendapat:

```text
access_token_hash
```

Token asli tidak disimpan di Spreadsheet.

## Keamanan

Endpoint data finansial memerlukan session Super Admin. Endpoint status pengajuan requester memerlukan `request_access_token` yang hanya diberikan saat pengajuan dibuat.

Password Super Admin tidak disimpan plaintext.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Untuk production:

```bash
npm run build
npm run start
```

Pastikan `NEXT_PUBLIC_APPS_SCRIPT_URL` menunjuk ke deployment Apps Script terbaru.

## Catatan

Spreadsheet tetap menjadi database. Pengguna tidak perlu mengisi transaksi secara manual untuk workflow normal.

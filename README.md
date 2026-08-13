# TCC Finance MultiBrand Secure Workflow v5.0

Financial command center TCC dengan Next.js, Vercel, Google Apps Script, Google Sheets, dan workflow approval Super Admin.

## Upgrade v5

- Super Admin session diverifikasi ulang dari backend.
- Dashboard, transaksi, event, cash, report, audit log, dan users tidak lagi menjadi endpoint publik.
- Requester tidak lagi bisa membaca seluruh riwayat pengajuan. Setiap pengajuan memiliki `request_access_token` yang hanya disimpan di browser requester dan hash-nya disimpan di Spreadsheet.
- `REQUESTS` otomatis mendapat kolom `access_token_hash` saat upgrade.
- Approval menggunakan `LockService` agar dua klik ACC bersamaan tidak membuat final transaction/event ganda.
- Password default tidak lagi ditulis plaintext di frontend atau source backend. Script Properties menggunakan SHA-256 hash yang diberikan untuk akun Super Admin.
- Password baru minimal 12 karakter dan harus berbeda dari password lama.
- Field sensitif seperti ID transaksi, timestamp, dan brand tidak dapat diubah melalui payload edit biasa.
- Validasi brand, kategori, nominal, tanggal, status event, nama file, dan MIME upload diperketat.
- Upload bukti dibatasi ke JPG/PNG/WEBP/PDF dan maksimal 8 MB serta memerlukan access token pengajuan.
- CSS disatukan ke satu design system dark sehingga tidak ada konflik background/teks/form antara komponen lama dan baru.
- Layout responsif untuk desktop, tablet, dan mobile.
- Proxy Next.js hanya menerima GET/POST, memvalidasi URL Apps Script, membatasi payload, dan mematikan caching response sensitif.

## Role

### Admin biasa

- Membuat pengajuan Tournament
- Membuat pengajuan Sponsor
- Membuat pengajuan Acara
- Mengajukan Income
- Mengajukan Expense
- Melihat status pengajuan miliknya sendiri

Admin biasa tidak mempunyai akses backend ke transaksi final, event final, cash, report, audit log, users, brand management, atau aksi edit/hapus.

### Super Admin

Setelah login, Super Admin dapat:

- ACC / Tolak pengajuan
- Melihat transaksi
- Edit / hapus transaksi
- Melihat / edit / hapus event
- Membuat brand
- Mengatur saldo awal
- Mengatur WhatsApp approval
- Mengganti password
- Melihat data operasional yang dilindungi

## Password

Password plaintext tidak ditanam di frontend.

Hash default yang digunakan Apps Script:

`364ca129d77d2ac1fce9f7ca2063519f12f831c531bcad63e9cd6e861e931803`

Hash tersebut adalah SHA-256 dari password testing yang sebelumnya digunakan. Setelah login, ganti password dari panel Super Admin.

## Upgrade Spreadsheet lama

Jangan membuat Spreadsheet baru.

1. Ganti `apps-script/Code.gs` dengan file v5.
2. Jalankan `upgradeTCCFinanceV4()` satu kali.
3. Script akan menambahkan kolom yang belum ada tanpa merusak kolom/data lama.
4. Pastikan `AUTH_USERS` dan kolom `REQUESTS.access_token_hash` muncul.
5. Buat **New version** pada deployment Web App.
6. Update deployment ke versi terbaru.

## Frontend

Masuk ke folder:

```bash
cd frontend
npm install
npm run dev
```

Buka:

```text
http://localhost:3000
```

Untuk Vercel, set Root Directory ke `frontend` dan environment variable:

```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Build:

```bash
npm run build
```

## Testing

Urutan pengujian:

1. Buka Pusat Pengajuan.
2. Pilih brand.
3. Kirim Tournament.
4. Pastikan status `PENDING`.
5. Pastikan requester hanya bisa melihat pengajuan miliknya.
6. Login Super Admin.
7. Pastikan pengajuan muncul di Approval Center.
8. ACC.
9. Pastikan status menjadi `APPROVED`.
10. Jika WhatsApp sudah dikonfigurasi, pastikan URL WhatsApp dibuat.
11. Test Sponsor.
12. Test Acara dan pastikan event final dibuat setelah ACC.
13. Test Expense.
14. Test Income.
15. Pastikan transaksi final baru dibuat setelah ACC.
16. Pastikan Admin tidak dapat mengakses endpoint transaksi tanpa session Super Admin.
17. Pastikan edit/hapus hanya berhasil dengan session Super Admin.
18. Ganti password Super Admin.
19. Logout dan pastikan token lama tidak dapat digunakan.

## V11 note
The V11 upgrade adds a public landing page, responsive analytics dashboard, brand-scoped cash visibility, and Super Admin Access Control. Keep `frontend/.env.local` out of GitHub and configure `NEXT_PUBLIC_APPS_SCRIPT_URL` in Vercel when deploying.

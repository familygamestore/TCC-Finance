# TCC Finance V7 Ultra Universal Event + Secure Multi-Brand

## Upgrade utama
- Universal event builder: game bebas, kategori event bebas, sistem turnamen bebas.
- Pilihan cepat jumlah tim: 4, 8, 16, 32, 64, 128, 256 atau custom.
- Game bisa diketik langsung dan memiliki datalist suggestion.
- Biaya registrasi: Rp25.000, Rp50.000, Rp75.000, Rp100.000 atau manual.
- Budget: Rp500.000, Rp1.000.000, Rp1.500.000, Rp2.000.000 atau manual.
- Prize pool: Rp500.000, Rp1.000.000, Rp1.500.000, Rp2.000.000 atau manual.
- Input nominal tampil sebagai Rupiah saat diketik, tetapi dikirim sebagai angka bersih ke backend.
- Target pemasukan dapat dihitung otomatis dari jumlah tim x biaya registrasi.
- Backend Apps Script menerima angka berformat Rupiah seperti `Rp 5.000` tanpa mengubahnya menjadi nol.
- Spreadsheet schema di-upgrade secara aman dengan menambahkan kolom yang hilang tanpa menimpa kolom/data lama.
- Admin biasa tidak dapat membuka data Super Admin. Membuka `/super-admin` dari sesi Admin akan kembali ke login Super Admin.
- Login pada halaman Super Admin menolak kredensial role ADMIN.
- Semua operasi edit/hapus/approval/cash setup tetap divalidasi server-side sebagai SUPER_ADMIN.

## Setup Apps Script
1. Ganti `apps-script/Code.gs` dengan versi ini.
2. Jalankan `upgradeTCCFinanceV6()` satu kali.
3. Deploy Apps Script sebagai Web App versi baru.
4. Pastikan URL deployment yang baru dipakai di `frontend/.env.local`.

## Local
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```
Buka `http://localhost:3000`.

Jangan menjalankan `npm audit fix --force` sebelum dependency compatibility diperiksa.

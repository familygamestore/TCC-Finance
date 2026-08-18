# TCC Finance V25 — FINAL FIXED

TCC Finance adalah finance command center multi-brand berbasis Next.js + Google Apps Script + Google Sheets. V25 menyatukan UI responsive, RBAC per brand, approval workflow, universal event builder, cash management, dashboard, audit, dan deployment Vercel.

## Arsitektur
- `frontend/` — Next.js 16 + React 19
- `apps-script/Code.gs` — API, auth, RBAC, approval, Spreadsheet/Drive
- `frontend/app/api/apps-script/route.ts` — proxy Next.js ke Apps Script
- Google Sheets — penyimpanan data

## Role
### SUPER_ADMIN
Full access ke seluruh brand, kas, transaksi, event, pengajuan, user, access control, settings dan audit.

### ADMIN
Akses hanya ke brand dan permission yang diberikan Super Admin. Pengajuan wajib login; ledger sensitif dibuat setelah approval Super Admin.

## Workflow
Admin → Pengajuan → PENDING → Super Admin → APPROVED/REJECTED → transaksi/event final.

## Local
```powershell
cd frontend
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```
Buka `http://localhost:3000`.

## Apps Script
1. Buka Google Apps Script.
2. Masukkan `apps-script/Code.gs`.
3. Jalankan `setupTCCFinance()` sekali.
4. Deploy sebagai Web App.
5. Salin URL `/exec`.

## Cara login pertama kali
`setupTCCFinance()` membuat akun Super Admin (`superadmin@tcc.local`), tapi
password bootstrap-nya sengaja **tidak** disimpan dalam bentuk plaintext di
manapun di source code ini (hanya hash-nya) — jadi tidak ada password default
yang bisa langsung dipakai. Untuk set password pertama Anda sendiri:
1. Di Apps Script editor, buka fungsi `setInitialSuperAdminPassword()` di
   `Code.gs`.
2. Isi baris `PLAINTEXT_PASSWORD = ''` dengan password pilihan Anda (min. 8
   karakter).
3. Pilih fungsi `setInitialSuperAdminPassword` dari dropdown, klik **Run**
   (sekali saja).
4. Login di frontend dengan email `superadmin@tcc.local` dan password yang
   baru saja Anda set. Anda akan langsung diminta ganti password — itu
   memang disengaja (`must_change_password`).
5. Kosongkan lagi `PLAINTEXT_PASSWORD` di kode dan simpan, supaya password
   tidak tertinggal dalam bentuk teks biasa di script Anda.

Akun Admin (bukan Super Admin) tidak dibuat otomatis — buat lewat menu
Administration setelah login sebagai Super Admin.

## Vercel
Root Directory: `frontend`
Build Command: `npm run build`
Output Directory: kosong/default Next.js
Node.js: 22.x

Environment Variable:
```text
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

## Security
- Requests private dan wajib session.
- Public request tracking hanya menggunakan access token.
- Admin tidak mendapat permission default.
- Super Admin diperlukan untuk approval, ledger mutation, cash setup/adjustment, brand management dan administration.
- Login memiliki lockout percobaan gagal dan session expiry.

## Production checklist
- [ ] `npm.cmd install` sukses
- [ ] `npm.cmd run typecheck` sukses
- [ ] `npm.cmd run build` sukses
- [ ] Apps Script `/exec` aktif
- [ ] `NEXT_PUBLIC_APPS_SCRIPT_URL` di Vercel sudah benar
- [ ] Test login Admin
- [ ] Test login Super Admin
- [ ] Test brand access
- [ ] Test request → approval
- [ ] Test event approval
- [ ] Test cash visibility
- [ ] Test logout/session expiry

## V25 fixed items
- Tidak membuat default/shared Admin otomatis.
- Admin wajib mengganti password sementara pada login pertama.
- Password change tersedia untuk Admin dan Super Admin.
- Session menolak akses aplikasi selama `must_change_password=true`.
- Approval Sponsor membuat pemasukan ledger setelah disetujui.
- Requests tetap private dan wajib authenticated.


## Final verification
The release archive is source-only by design: no `node_modules`, `.next`, or TypeScript build-info artifacts are shipped. Before GitHub/Vercel deployment, run the exact commands below from `frontend/`:

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

If `typecheck` or `build` reports an error, stop deployment and fix that error first. Vercel Root Directory must be `frontend`; Output Directory must remain the default for Next.js.

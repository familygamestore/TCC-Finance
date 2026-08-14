# TCC Finance V15 — Ultra Enterprise Command Center

TCC Finance V15 adalah upgrade menyeluruh dari V10/V14 untuk pengelolaan multi-brand finance, kas, transaksi, pengajuan, event, approval, analytics, user management, dan access control berbasis Google Sheets + Google Apps Script + Next.js.

## Prinsip V15

- Super Admin = akses mutlak ke seluruh brand, kas, transaksi, pengajuan, event, users, settings, audit, dan permission.
- Admin = hanya melihat brand yang secara eksplisit diberikan oleh Super Admin.
- Admin tidak mendapatkan semua brand secara otomatis.
- Pengajuan Admin masuk PENDING dan diproses Super Admin.
- Akses brand dan permission diperiksa di backend, bukan hanya disembunyikan di UI.
- UI responsive untuk HP 320px+, Android, iPhone, iPad, tablet, laptop, desktop, dan wide monitor.
- Dark/Light mode dan sidebar collapse tersimpan di browser.

## Fitur

### Workspace
- Landing page sebelum login.
- Dashboard command center.
- Cash overview.
- Income/expense summary.
- Event overview.
- Quick actions.
- Responsive navigation drawer.

### Finance
- Multi-brand cash account.
- Saldo awal, saldo sistem, saldo aktual.
- Rekonsiliasi dan cash adjustment.
- Transaction ledger.
- Kategori dan payment method.
- Format nominal Rupiah.
- Quick amount selector.

### Pengajuan
- Income.
- Expense.
- Event/tournament.
- Sponsor.
- Status PENDING / APPROVED / REJECTED.
- Approval Super Admin.
- Access token untuk tracking pengajuan.

### Event
- Game bebas/custom.
- Kategori bebas.
- Jumlah tim/peserta.
- Biaya registrasi.
- Budget.
- Prize pool.
- Sponsor revenue.
- Event budget summary.

### Access Control
Super Admin dapat memilih:

`Admin → Brand → Permission`

Permission tersedia:

- view_cash
- view_transactions
- view_events
- create_request
- view_reports

Mencabut semua permission akan menghapus assignment brand tersebut.

### Security
- Server-side session validation.
- Session expiration.
- Login attempt limiting.
- Super Admin protected endpoints.
- Brand permission checks.
- Audit log.
- Password minimum 12 karakter untuk account management.
- Admin baru tidak memperoleh semua brand otomatis.

## Struktur

```text
TCC-Finance-V15/
├── apps-script/Code.gs
├── docs/spreadsheet-setup.md
├── docs/spreadsheet-template/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── utils/
├── vercel.json
└── README.md
```

## Local Development

```powershell
cd frontend
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Open `http://localhost:3000`.

## Apps Script

1. Buka Google Apps Script.
2. Ganti Code.gs dengan `apps-script/Code.gs`.
3. Jalankan `setupTCCFinance()` sekali.
4. Deploy sebagai Web App.
5. Salin URL `/exec`.
6. Di Vercel set environment variable:

```text
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

Jika frontend memakai route proxy internal, pastikan route tersebut juga membaca environment variable yang sama.

## GitHub → Vercel

Root repository adalah folder project ini. Karena Next.js berada di `frontend`, ada dua pilihan:

### Pilihan A — Vercel Root Directory
Set:

```text
Root Directory = frontend
```

Build command:

```text
npm run build
```

Output Directory biarkan default Next.js.

### Pilihan B — Repository root
Gunakan konfigurasi Vercel yang menjalankan build dari `frontend`. Jangan set Output Directory menjadi `public` karena ini bukan static export.

## Environment

Salin `.env.example` menjadi `.env.local` jika perlu. Jangan commit secret.

## Verifikasi sebelum production

```powershell
npm.cmd run typecheck
npm.cmd run build
```

Build harus bersih sebelum push ke GitHub.

## Catatan database

Spreadsheet adalah source of truth. Jalankan setup Apps Script sebelum frontend mencoba membaca dashboard, brand, cash, transaksi, event, atau request.

## Versi

V15 — Ultra Enterprise Command Center.

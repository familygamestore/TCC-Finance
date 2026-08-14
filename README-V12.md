# TCC Finance V12 — V10 UI Foundation + Ultra UX

V12 intentionally keeps the V10 visual foundation and improves it instead of replacing it.

## Upgrades
- V10 sidebar/card/form visual language preserved.
- Light / Dark mode with persisted preference.
- Collapsible desktop sidebar + mobile drawer navigation.
- Landing page before authentication.
- Dashboard analytics: cash flow bars, finance health, income/expense/net summary.
- Request center redesigned: request type cards stay compact; full request form opens in a right-side drawer.
- Super Admin can open the request center; Admin remains request-focused.
- Responsive layout for phone, tablet, iPad and desktop.
- Form controls retain dark readable text on light inputs and adapt to dark mode.
- Existing Apps Script / Spreadsheet architecture retained.

## Local test
```powershell
cd frontend
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

## Vercel
- Root Directory: `frontend`
- Framework: Next.js
- Output Directory: leave default/empty
- Configure `NEXT_PUBLIC_APPS_SCRIPT_URL` in Vercel Environment Variables.

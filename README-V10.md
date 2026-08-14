# TCC Finance V10 — Ultra Command Center

V10 is a responsive-first redesign of TCC Finance. It keeps the Google Apps Script + Google Sheets architecture and upgrades navigation, dashboard hierarchy, forms, tables, mobile behavior, and role-aware UX.

## Local development

```powershell
cd frontend
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

## Environment

Create `frontend/.env.local` locally:

```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Never commit `.env.local`.

## Vercel

- Framework: Next.js
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: leave default/empty
- Add `NEXT_PUBLIC_APPS_SCRIPT_URL` in Vercel Environment Variables.

# TCC Finance V10 Frontend

Responsive Next.js command center for TCC Finance. Backend remains Google Apps Script + Google Sheets.

## Local

```powershell
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Create `.env.local` from `.env.example`:

```env
NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Never commit `.env.local`.

## Vercel

Set:

- Framework: Next.js
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: default/empty
- Environment Variable: `NEXT_PUBLIC_APPS_SCRIPT_URL`

# TCC Finance Frontend

## Stack
- Next.js 16.2.11
- React 19.2.8
- TypeScript 5.9.x
- Vercel
- Google Apps Script proxy

## Vercel
Set **Root Directory** to `frontend`.

Build settings:
- Framework: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Output Directory: `.next`

Environment variable:
`NEXT_PUBLIC_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

## Main fixes
- Fixed `@/*` path alias with `baseUrl`.
- Verified all `@/` imports resolve to files in the project.
- Upgraded Next.js from 14.2.5 to patched 16.2.11.
- Upgraded React and React DOM to 19.2.8.
- Added TypeScript and React/Node type packages.
- Removed deprecated `next lint` build script.
- Hardened the Apps Script API proxy with HTTPS validation, dynamic rendering, and Node.js runtime.
- Added Node.js engine requirement >=20.9.

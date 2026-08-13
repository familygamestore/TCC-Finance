# TCC Finance V9 Ultra Command Center

V9 upgrades the existing V8 project without removing the finance workflow.

## Main upgrades
- Hydration-safe dashboard authentication: browser-only auth state is read after hydration.
- Premium responsive command-center navbar with role-aware navigation, account area, mobile menu, active states and logout.
- Super Admin dashboard remains protected by frontend and backend role checks.
- Improved loading skeletons and error retry UI.
- Stronger form hierarchy and readable white inputs with dark text.
- Event, cash, request and transaction modules remain compatible with the existing Apps Script architecture.
- Auth change event synchronizes navigation immediately after login/logout.

## Local verification
```powershell
cd frontend
npm.cmd install
npm.cmd run typecheck
npm.cmd run build
npm.cmd run dev
```

Do not deploy until localhost tests are clean.

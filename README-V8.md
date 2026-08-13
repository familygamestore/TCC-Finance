# TCC Finance V8 Ultra Enterprise

V8 upgrades the V7 foundation with stronger server-side multi-brand authorization, admin brand access, login attempt throttling, event financial planning, additional spreadsheet modules, and higher-contrast forms.

## Local development

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

## Apps Script migration

1. Replace `apps-script/Code.gs` in the Apps Script project.
2. Run `upgradeTCCFinanceV8()` once from the Apps Script editor.
3. Deploy a **new web-app version**.
4. Keep the same Spreadsheet and Drive configuration; the migration creates missing sheets without deleting existing data.

## V8 additions

- Server-side brand access checks for authenticated users.
- Admin accounts can be assigned to selected brands when created; if none are supplied, active brands are assigned for backward compatibility.
- Login failure throttling: repeated failures temporarily lock further attempts.
- `EVENT_BUDGETS`, `NOTIFICATIONS`, and `SETTINGS` sheets.
- Event financial plan: registration revenue, sponsor revenue, other income, prize pool, operational budget, other expense, expected profit.
- Expanded quick money presets.
- Strong input contrast, autofill handling, focus states, and mobile-friendly quick chips.
- `upgradeTCCFinanceV8()` is idempotent and preserves existing rows.

## Important

Google Apps Script deployments are separate from the local Next.js server. After changing `Code.gs`, a new deployment version must be published before the local frontend can use the new backend behavior.

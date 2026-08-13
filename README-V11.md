# TCC Finance V11 Ultra Enterprise

Major upgrade from V9:
- Landing page before authentication
- Dedicated responsive dashboard with analytics chart
- Multi-brand cash visibility
- Admin brand/feature permissions via Access Control
- Super Admin full access
- Responsive navigation and mobile drawer
- Public assets directory for custom images/logos
- Next.js/Vercel-compatible structure

## Local
cd frontend
npm install
npm run typecheck
npm run build
npm run dev

## Vercel
Root Directory: `frontend`
Framework: Next.js
Output Directory: leave default/empty
Environment variable:
`NEXT_PUBLIC_APPS_SCRIPT_URL`

## Apps Script
Copy `apps-script/Code.gs` into the deployed Apps Script project and run the appropriate setup/upgrade function. Existing BRAND_USERS rows remain backward compatible; missing permission columns are added by schema upgrade.

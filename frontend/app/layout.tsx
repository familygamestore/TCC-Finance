import './globals.css';
import Navigation from '@/components/common/Navigation';

export const metadata = {
  title: 'TCC Finance — Command Center',
  description: 'Multi-brand financial and event management platform untuk TCC',
  openGraph: {
    title: 'TCC Finance — Command Center',
    description: 'Multi-brand financial and event management platform untuk TCC',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="app-frame">
          <Navigation />
          <div className="app-content">
            <header className="mobile-topbar">
              <div><strong>TCC FINANCE</strong><span>Command Center</span></div>
              <div className="mobile-topbar-status"><span className="status-dot"/> Secure</div>
            </header>
            <main className="main-content">{children}</main>
            <footer className="footer">TCC Finance · Secure operational ledger · Google Sheets backend</footer>
          </div>
        </div>
      </body>
    </html>
  );
}

import Link from 'next/link';
import Navigation from '@/components/common/Navigation';
import './globals.css';

export const metadata = {
  title: 'TCC Finance — Secure Command Center',
  description: 'Secure multi-brand financial command center untuk TCC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link href="/" className="brand" aria-label="TCC Finance Dashboard">
              <span className="brand-mark">T</span>
              <span className="brand-copy"><strong>TCC FINANCE</strong><span>Financial Command Center</span></span>
            </Link>
            <Navigation />
          </header>
          <main>{children}</main>
          <footer className="footer">TCC Finance • Secure operational ledger • Data powered by Google Sheets</footer>
        </div>
      </body>
    </html>
  );
}

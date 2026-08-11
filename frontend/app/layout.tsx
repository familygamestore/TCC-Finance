import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'TCC Finance',
  description: 'Sistem keuangan TCC'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <div className="shell">
          <nav className="nav" aria-label="Navigasi utama">
            <Link href="/">Dashboard</Link>
            <Link href="/transactions">Transaksi</Link>
            <Link href="/events">Event</Link>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}

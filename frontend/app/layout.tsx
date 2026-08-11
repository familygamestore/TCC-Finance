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
          <nav className="nav">
            <a href="/">Dashboard</a>
            <a href="/transactions">Transaksi</a>
            <a href="/events">Event</a>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}

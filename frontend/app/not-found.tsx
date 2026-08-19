export default function NotFound() {
  return (
    <div className="loading" style={{ flexDirection: 'column', textAlign: 'center', gap: 16, minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: 440, padding: '32px 28px' }}>
        <div className="eyebrow">404</div>
        <h1 style={{ margin: '8px 0 6px' }}>Halaman tidak ditemukan</h1>
        <p className="subtitle" style={{ marginBottom: 20 }}>
          Halaman yang Anda cari tidak ada, atau URL-nya sudah berubah.
        </p>
        <a className="btn" href="/">Kembali ke Dashboard</a>
      </div>
    </div>
  );
}

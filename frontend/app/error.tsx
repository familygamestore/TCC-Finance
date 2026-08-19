'use client';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="loading" style={{ flexDirection: 'column', textAlign: 'center', gap: 16, minHeight: '60vh' }}>
      <div className="card" style={{ maxWidth: 440, padding: '32px 28px' }}>
        <div className="eyebrow">Terjadi kesalahan</div>
        <h1 style={{ margin: '8px 0 6px' }}>Ada yang tidak beres</h1>
        <p className="subtitle" style={{ marginBottom: 20 }}>
          Halaman ini gagal dimuat karena error yang tidak terduga. Data Anda aman —
          coba muat ulang halaman ini, atau kembali ke Dashboard.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => reset()}>Coba lagi</button>
          <a className="btn secondary" href="/">Kembali ke Dashboard</a>
        </div>
        {error?.digest && (
          <p className="muted" style={{ marginTop: 16, fontSize: 'var(--fs-3xs)' }}>Kode error: {error.digest}</p>
        )}
      </div>
    </div>
  );
}

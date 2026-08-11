'use client';

import { useEffect, useState } from 'react';
import { api, Dashboard } from '../lib/api';

function formatRupiah(n: number) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDashboard().then(setData).catch(e => setError(e.message));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p className="subtitle">Ringkasan keuangan TCC, dihitung langsung dari data transaksi.</p>

      {error && <p className="error">{error}</p>}
      {!data && !error && <p className="muted">Memuat data...</p>}

      {data && (
        <>
          <div className="grid">
            <div className="card">
              <div className="label">Saldo</div>
              <div className="value">{formatRupiah(data.saldo)}</div>
            </div>
            <div className="card">
              <div className="label">Total Pemasukan</div>
              <div className="value">{formatRupiah(data.total_income)}</div>
            </div>
            <div className="card">
              <div className="label">Total Pengeluaran</div>
              <div className="value">{formatRupiah(data.total_expense)}</div>
            </div>
            <div className="card">
              <div className="label">Jumlah Event</div>
              <div className="value">{data.jumlah_event}</div>
            </div>
          </div>

          <h2>Transaksi terbaru</h2>
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Kategori</th>
                <th>Nominal</th>
              </tr>
            </thead>
            <tbody>
              {data.transaksi_terbaru.map(t => (
                <tr key={t.transaction_id}>
                  <td>{t.tanggal} {t.jam}</td>
                  <td><span className={`tag ${t.type}`}>{t.type === 'income' ? 'Masuk' : 'Keluar'}</span></td>
                  <td>{t.kategori}</td>
                  <td>{formatRupiah(t.nominal)}</td>
                </tr>
              ))}
              {data.transaksi_terbaru.length === 0 && (
                <tr><td colSpan={4} className="muted">Belum ada transaksi.</td></tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

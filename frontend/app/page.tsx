'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, Dashboard } from '@/lib/api';
import Card from '@/components/common/Card';
import { formatRupiah } from '@/utils/formatters';

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api.getDashboard());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">Ringkasan keuangan TCC dari data transaksi.</p>
        </div>
        <button type="button" className="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? 'Memuat...' : 'Refresh'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}
      {loading && !data && <p className="muted">Memuat data...</p>}

      {data && (
        <>
          <div className="grid">
            <Card label="Saldo" value={formatRupiah(data.saldo)} />
            <Card label="Total Pemasukan" value={formatRupiah(data.total_income)} />
            <Card label="Total Pengeluaran" value={formatRupiah(data.total_expense)} />
            <Card label="Jumlah Event" value={data.jumlah_event} />
          </div>

          <section>
            <h2>Transaksi terbaru</h2>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Nominal</th></tr></thead>
                <tbody>
                  {data.transaksi_terbaru.map(t => (
                    <tr key={t.transaction_id}>
                      <td>{t.tanggal} {t.jam}</td>
                      <td><span className={`tag ${t.type}`}>{t.type === 'income' ? 'Masuk' : 'Keluar'}</span></td>
                      <td>{t.kategori || '-'}</td>
                      <td>{formatRupiah(t.nominal)}</td>
                    </tr>
                  ))}
                  {data.transaksi_terbaru.length === 0 && <tr><td colSpan={4} className="muted empty">Belum ada transaksi.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

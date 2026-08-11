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
    setLoading(true); setError('');
    try { setData(await api.getDashboard()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal memuat dashboard'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const saldo = data?.saldo ?? 0;
  return <div>
    <div className="page-header">
      <div><div className="eyebrow">Overview • TCC Finance</div><h1>Command Center</h1><p className="subtitle">Pantau arus kas, transaksi, dan event dari satu layar.</p></div>
      <div className="actions"><button className="btn secondary" onClick={() => void load()} disabled={loading}><span className={loading ? 'spinner' : ''}></span>{loading ? ' Memuat' : '↻ Refresh'}</button></div>
    </div>
    {error && <div className="alert"><span>⚠</span>{error}</div>}
    {loading && !data && <div className="loading"><span className="spinner"/> Mengambil data keuangan...</div>}
    {data && <>
      <div className="dashboard-hero"><div className="hero-card"><div className="eyebrow">Net Balance</div><div className="hero-value">{formatRupiah(saldo)}</div><div className="hero-meta"><span className="mini-stat"><span className="status-dot"/>Live data</span><span className="mini-stat">{data.jumlah_transaksi} transaksi</span><span className="mini-stat">{data.jumlah_event} event</span></div></div></div>
      <div className="grid">
        <Card label="Saldo" value={formatRupiah(data.saldo)} />
        <Card label="Total Pemasukan" value={formatRupiah(data.total_income)} />
        <Card label="Total Pengeluaran" value={formatRupiah(data.total_expense)} />
        <Card label="Jumlah Event" value={data.jumlah_event} />
      </div>
      <section className="section"><div className="section-head"><h2>Aktivitas terbaru</h2><span className="muted">5 transaksi terakhir</span></div>
        <div className="table-wrap"><table><thead><tr><th>Waktu</th><th>Tipe</th><th>Transaksi</th><th>Kategori</th><th>Nominal</th></tr></thead><tbody>
          {data.transaksi_terbaru.map(t => <tr key={t.transaction_id}><td>{t.tanggal} {t.jam}</td><td><span className={`tag ${t.type}`}>{t.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}</span></td><td>{String(t.nama_transaksi || t.nama_pengeluaran || '-')}</td><td>{t.kategori || '-'}</td><td><strong>{formatRupiah(t.nominal)}</strong></td></tr>)}
          {!data.transaksi_terbaru.length && <tr><td colSpan={5} className="muted empty">Belum ada transaksi.</td></tr>}
        </tbody></table></div>
      </section>
    </>}
  </div>;
}

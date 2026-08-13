'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, Dashboard, getAuthRole } from '@/lib/api';
import Card from '@/components/common/Card';
import { useRouter } from 'next/navigation';
import { formatRupiah } from '@/utils/formatters';

export default function DashboardPage() {
  const [role, setRole] = useState<string | null>(null);
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await api.getDashboard()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal memuat dashboard.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const sync = () => setRole(getAuthRole());
    sync();
    window.addEventListener('tcc-auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('tcc-auth-changed', sync); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => { if (role === 'SUPER_ADMIN') void load(); }, [role, load]);

  // Keep the first server render deterministic. Auth state is read only after hydration.
  if (role === null) return <div className="dashboard-skeleton" aria-busy="true"><div className="skeleton-header"/><div className="skeleton-grid">{[1,2,3,4].map(x => <div className="skeleton-card" key={x}/>)}</div><div className="skeleton-table"/></div>;

  if (role !== 'SUPER_ADMIN') return <div className="auth-wrap"><div className="auth-card access-denied-card"><div className="access-icon">⌁</div><div className="eyebrow">Restricted Dashboard</div><h1>Super Admin Only</h1><p className="subtitle">Dashboard keuangan utama dilindungi. Login sebagai Super Admin untuk melihat saldo, transaksi, dan laporan.</p><div className="actions"><button className="btn" onClick={() => router.push('/super-admin')}>Login Super Admin</button><button className="btn secondary" onClick={() => router.push('/admin')}>Area Admin</button></div></div></div>;

  const saldo = data?.saldo ?? 0;
  return <div>
    <div className="page-header command-header">
      <div><div className="eyebrow">Command Center • Live Finance</div><h1>Dashboard</h1><p className="subtitle">Satu pusat kendali untuk kas, transaksi, event, dan approval.</p></div>
      <div className="actions"><span className="live-pill"><span className="status-dot"/> Live</span><button className="btn secondary" onClick={() => void load()} disabled={loading}><span className={loading ? 'spinner' : ''}></span>{loading ? ' Memuat' : '↻ Refresh'}</button></div>
    </div>
    {error && <div className="alert"><span>⚠</span><span>{error}</span><button className="alert-action" onClick={() => void load()}>Coba lagi</button></div>}
    {loading && !data && <div className="loading-panel"><span className="spinner"/> Mengambil data keuangan...</div>}
    {data && <>
      <div className="dashboard-hero"><div className="hero-card hero-card-premium"><div className="hero-glow"/><div className="eyebrow">Net Balance</div><div className="hero-value">{formatRupiah(saldo)}</div><div className="hero-meta"><span className="mini-stat"><span className="status-dot"/>Data tersinkron</span><span className="mini-stat">{data.jumlah_transaksi} transaksi</span><span className="mini-stat">{data.jumlah_event} event</span></div></div></div>
      <div className="grid">
        <Card icon="Rp" label="Saldo" value={formatRupiah(data.saldo)} />
        <Card icon="↗" label="Total Pemasukan" value={formatRupiah(data.total_income)} />
        <Card icon="↘" label="Total Pengeluaran" value={formatRupiah(data.total_expense)} />
        <Card icon="◆" label="Jumlah Event" value={data.jumlah_event} />
      </div>
      <section className="section"><div className="section-head"><div><div className="eyebrow">Ledger</div><h2>Aktivitas terbaru</h2></div><span className="muted">5 transaksi terakhir</span></div>
        <div className="table-wrap"><table><thead><tr><th>Waktu</th><th>Tipe</th><th>Transaksi</th><th>Kategori</th><th>Nominal</th></tr></thead><tbody>
          {data.transaksi_terbaru.map(t => <tr key={t.transaction_id}><td>{t.tanggal} {t.jam}</td><td><span className={`tag ${t.type}`}>{t.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}</span></td><td><strong>{String(t.nama_transaksi || t.nama_pengeluaran || '-')}</strong></td><td>{t.kategori || '-'}</td><td><strong>{formatRupiah(t.nominal)}</strong></td></tr>)}
          {!data.transaksi_terbaru.length && <tr><td colSpan={5} className="muted empty">Belum ada transaksi.</td></tr>}
        </tbody></table></div>
      </section>
    </>}
  </div>;
}

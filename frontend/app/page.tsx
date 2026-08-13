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
    const sync = () => setRole(getAuthRole() || null);
    sync();
    window.addEventListener('tcc-auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('tcc-auth-changed', sync); window.removeEventListener('storage', sync); };
  }, []);

  useEffect(() => { if (role === 'SUPER_ADMIN') void load(); }, [role, load]);

  if (role === null) return <div className="dashboard-skeleton" aria-busy="true"><div className="skeleton-header"/><div className="skeleton-grid">{[1,2,3,4].map(x => <div className="skeleton-card" key={x}/>)}</div><div className="skeleton-table"/></div>;

  if (role !== 'SUPER_ADMIN') return <div className="access-page"><div className="access-panel"><div className="access-icon">⌁</div><div className="eyebrow">Protected workspace</div><h1>Super Admin access required</h1><p className="subtitle">Dashboard utama berisi kas lintas brand, ledger dan approval. Masuk menggunakan akun Super Admin untuk melanjutkan.</p><div className="actions"><button className="btn" onClick={() => router.push('/super-admin')}>Masuk Super Admin</button><button className="btn secondary" onClick={() => router.push('/admin')}>Area Admin</button></div></div></div>;

  const saldo = data?.saldo ?? 0;
  const net = (data?.total_income ?? 0) - (data?.total_expense ?? 0);

  return <div>
    <div className="page-header command-header">
      <div><div className="eyebrow">Command Center · Finance</div><h1>Good evening, Admin.</h1><p className="subtitle">Pantau kas, transaksi, event, dan approval dari satu workspace.</p></div>
      <div className="actions"><span className="live-pill"><span className="status-dot"/> System online</span><button className="btn secondary" onClick={() => void load()} disabled={loading}>{loading ? 'Memuat…' : '↻ Refresh'}</button></div>
    </div>

    {error && <div className="alert"><span>⚠</span><span>{error}</span><button className="alert-action" onClick={() => void load()}>Coba lagi</button></div>}

    {loading && !data && <div className="loading-panel"><span className="spinner"/> Mengambil data keuangan...</div>}

    {data && <>
      <section className="hero-grid">
        <div className="hero-card">
          <div className="hero-top"><div><div className="eyebrow">Total cash balance</div><span className="hero-label">Saldo tersedia lintas workspace</span></div><span className="hero-chip">LIVE</span></div>
          <div className="hero-value">{formatRupiah(saldo)}</div>
          <div className="hero-bottom"><span><i className="positive-dot"/> Data tersinkron</span><span>{data.jumlah_transaksi} transaksi</span><span>{data.jumlah_event} event</span></div>
        </div>
        <div className="quick-panel"><div className="eyebrow">Quick actions</div><div className="quick-actions"><button onClick={() => router.push('/transactions')}><b>↕</b><span>Transaksi</span></button><button onClick={() => router.push('/requests')}><b>✓</b><span>Pengajuan</span></button><button onClick={() => router.push('/events')}><b>◆</b><span>Event</span></button><button onClick={() => router.push('/cash')}><b>₽</b><span>Kas brand</span></button></div></div>
      </section>

      <div className="grid metric-grid">
        <Card icon="₽" label="Saldo" value={formatRupiah(data.saldo)} />
        <Card icon="↗" label="Total pemasukan" value={formatRupiah(data.total_income)} />
        <Card icon="↘" label="Total pengeluaran" value={formatRupiah(data.total_expense)} />
        <Card icon="◆" label="Net movement" value={formatRupiah(net)} />
      </div>

      <section className="section ledger-section">
        <div className="section-head"><div><div className="eyebrow">Operational ledger</div><h2>Aktivitas terbaru</h2></div><button className="text-button" onClick={() => router.push('/transactions')}>Lihat semua →</button></div>
        <div className="table-wrap"><table><thead><tr><th>Waktu</th><th>Tipe</th><th>Transaksi</th><th>Kategori</th><th className="amount-col">Nominal</th></tr></thead><tbody>
          {data.transaksi_terbaru.map(t => <tr key={t.transaction_id}><td>{t.tanggal} <span className="muted">{t.jam}</span></td><td><span className={`tag ${t.type}`}>{t.type === 'income' ? 'PEMASUKAN' : 'PENGELUARAN'}</span></td><td><strong>{String(t.nama_transaksi || t.nama_pengeluaran || '-')}</strong></td><td>{t.kategori || '-'}</td><td className="amount-col"><strong className={t.type === 'income' ? 'income-text' : 'expense-text'}>{t.type === 'income' ? '+' : '-'}{formatRupiah(t.nominal)}</strong></td></tr>)}
          {!data.transaksi_terbaru.length && <tr><td colSpan={5} className="muted empty">Belum ada transaksi.</td></tr>}
        </tbody></table></div>
      </section>
    </>}
  </div>;
}

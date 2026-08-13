'use client';
import { useCallback,useEffect,useMemo,useState } from 'react';
import { api,Dashboard,getAuthRole } from '@/lib/api';
import { formatRupiah } from '@/utils/formatters';
import Card from '@/components/common/Card';
import { useRouter } from 'next/navigation';

function FlowChart({data}:{data:Dashboard|null}){
 const income=data?.total_income||0, expense=data?.total_expense||0;
 const values=useMemo(()=>{const base=Math.max(income,expense,1);return [0.34,0.5,0.43,0.68,0.59,Math.min(0.94,0.62+income/base*.25),Math.min(0.98,0.52+expense/base*.3)];},[income,expense]);
 return <div className="chart-card"><div className="chart-title"><div><div className="eyebrow">Analytics</div><h2>Cash flow overview</h2></div><span className="chart-legend"><i className="legend-income"/> Income <i className="legend-expense"/> Expense</span></div><div className="chart"><div className="chart-grid-lines"><i/><i/><i/><i/></div><div className="bars">{values.map((v,i)=><div className="bar-group" key={i}><div className="bar income-bar" style={{height:`${Math.round(v*100)}%`}}/><div className="bar expense-bar" style={{height:`${Math.round(Math.max(.16,v*.55)*100)}%`}}/><small>{['Jan','Feb','Mar','Apr','May','Jun','Jul'][i]}</small></div>)}</div></div></div>
}

export default function DashboardPage(){
 const router=useRouter(); const [role,setRole]=useState(''); const [data,setData]=useState<Dashboard|null>(null); const [error,setError]=useState(''); const [loading,setLoading]=useState(false);
 const load=useCallback(async()=>{setLoading(true);setError('');try{setData(await api.getDashboard())}catch(e){setError(e instanceof Error?e.message:'Gagal memuat dashboard.')}finally{setLoading(false)}},[]);
 useEffect(()=>{const sync=()=>setRole(getAuthRole());sync();window.addEventListener('tcc-auth-changed',sync);return()=>window.removeEventListener('tcc-auth-changed',sync)},[]);
 useEffect(()=>{if(role)void load()},[role,load]);
 if(!role)return <div className="dashboard-skeleton"><div className="skeleton-header"/><div className="skeleton-grid">{[1,2,3,4].map(x=><div className="skeleton-card" key={x}/>)}</div></div>;
 if(role!=='SUPER_ADMIN' && role!=='ADMIN')return <div className="auth-wrap"><div className="auth-card"><div className="eyebrow">Workspace terkunci</div><h1>Login diperlukan</h1><p className="subtitle">Silakan login untuk membuka dashboard.</p><button className="btn" onClick={()=>router.push('/admin')}>Login</button></div></div>;
 const saldo=data?.saldo||0;
 return <div>
  <div className="page-header command-header"><div><div className="eyebrow">{role==='SUPER_ADMIN'?'Super Admin':'Admin'} • Financial Overview</div><h1>Command Center</h1><p className="subtitle">Ringkasan keuangan dan aktivitas yang tersedia untuk akun ini.</p></div><div className="actions"><span className="live-pill"><span className="status-dot"/> Live</span><button className="btn secondary" onClick={()=>void load()} disabled={loading}>{loading?'Memuat…':'↻ Refresh'}</button></div></div>
  {error&&<div className="alert">⚠ {error}<button className="alert-action" onClick={()=>void load()}>Coba lagi</button></div>}
  {data&&<>
   <div className="dashboard-hero"><div className="hero-card hero-card-premium"><div className="eyebrow">Available cash</div><div className="hero-value">{formatRupiah(saldo)}</div><div className="hero-meta"><span className="mini-stat"><span className="status-dot"/>Data tersinkron</span><span className="mini-stat">{data.jumlah_transaksi} transaksi</span><span className="mini-stat">{data.jumlah_event} event</span></div></div></div>
   <div className="grid"><Card icon="Rp" label="Saldo" value={formatRupiah(data.saldo)}/><Card icon="↗" label="Total Pemasukan" value={formatRupiah(data.total_income)}/><Card icon="↘" label="Total Pengeluaran" value={formatRupiah(data.total_expense)}/><Card icon="◆" label="Event" value={data.jumlah_event}/></div>
   <div className="analytics-grid"><FlowChart data={data}/><div className="insight-card"><div className="eyebrow">Quick actions</div><h2>Operasional</h2><div className="quick-actions"><button onClick={()=>router.push('/requests')}><b>+ Pengajuan</b><span>Ajukan kebutuhan baru</span></button><button onClick={()=>router.push('/events')}><b>◆ Event</b><span>Kelola event</span></button><button onClick={()=>router.push('/cash')}><b>Rp Kas</b><span>Lihat saldo brand</span></button><button onClick={()=>router.push('/transactions')}><b>↕ Transaksi</b><span>Audit ledger</span></button></div></div></div>
   <section className="section"><div className="section-head"><div><div className="eyebrow">Ledger</div><h2>Aktivitas terbaru</h2></div><span className="muted">5 transaksi terakhir</span></div><div className="table-wrap"><table><thead><tr><th>Waktu</th><th>Tipe</th><th>Transaksi</th><th>Kategori</th><th>Nominal</th></tr></thead><tbody>{data.transaksi_terbaru.map(t=><tr key={t.transaction_id}><td>{t.tanggal} {t.jam}</td><td><span className={`tag ${t.type}`}>{t.type==='income'?'PEMASUKAN':'PENGELUARAN'}</span></td><td><strong>{String(t.nama_transaksi||t.nama_pengeluaran||'-')}</strong></td><td>{t.kategori||'-'}</td><td><strong>{formatRupiah(t.nominal)}</strong></td></tr>)}{!data.transaksi_terbaru.length&&<tr><td colSpan={5} className="empty muted">Belum ada transaksi.</td></tr>}</tbody></table></div></section>
  </>}
 </div>
}

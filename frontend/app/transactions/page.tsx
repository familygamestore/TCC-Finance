'use client';
import { useEffect, useMemo, useState } from 'react';
import { api, Transaction } from '@/lib/api';
import { formatRupiah } from '@/utils/formatters';
import { exportToCsv } from '@/utils/csvExport';

export default function TransactionsPage(){
 const [rows,setRows]=useState<Transaction[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [q,setQ]=useState('');
 const [type,setType]=useState<'ALL'|'INCOME'|'EXPENSE'>('ALL');
 const [from,setFrom]=useState('');
 const [to,setTo]=useState('');

 useEffect(()=>{
  let cancelled=false;
  setLoading(true);
  setError('');
  api.getTransactions()
   .then(data=>{if(!cancelled){setRows(data);setLoading(false);}})
   .catch(e=>{if(!cancelled){setError(e instanceof Error?e.message:'Gagal memuat transaksi.');setLoading(false);}});
  return ()=>{cancelled=true};
 },[]);

 const filtered = useMemo(()=>{
  const query = q.trim().toLowerCase();
  return rows.filter(t=>{
   if (type!=='ALL' && String(t.type).toUpperCase()!==type) return false;
   if (from && String(t.tanggal) < from) return false;
   if (to && String(t.tanggal) > to) return false;
   if (query) {
    const haystack = [t.transaction_id, t.nama_transaksi, t.nama_pengeluaran, t.kategori, t.catatan]
     .map(v=>String(v||'').toLowerCase()).join(' ');
    if (!haystack.includes(query)) return false;
   }
   return true;
  });
 }, [rows, q, type, from, to]);

 function handleExport(){
  exportToCsv(
   `transaksi-${new Date().toISOString().slice(0,10)}.csv`,
   filtered as unknown as Record<string, unknown>[],
   [
    { key:'transaction_id', label:'ID' },
    { key:'tanggal', label:'Tanggal' },
    { key:'jam', label:'Jam' },
    { key:'type', label:'Tipe' },
    { key:'nama_transaksi', label:'Nama (Income)' },
    { key:'nama_pengeluaran', label:'Nama (Expense)' },
    { key:'kategori', label:'Kategori' },
    { key:'nominal', label:'Nominal' },
    { key:'catatan', label:'Catatan' },
   ]
  );
 }

 return <div>
  <div className="page-header"><div><div className="eyebrow">Finance Ledger</div><h1>Transaksi</h1><p className="subtitle">Data transaksi ditampilkan sesuai akses brand dan permission akun. Perubahan finansial sensitif tetap melalui workflow Super Admin.</p></div></div>
  {error&&<div className="alert">⚠ {error}</div>}

  <div className="table-filter-bar">
   <input
    type="search"
    placeholder="Cari ID, nama, kategori, catatan…"
    value={q}
    onChange={e=>setQ(e.target.value)}
    aria-label="Cari transaksi"
   />
   <div className="filter-group">
    <select value={type} onChange={e=>setType(e.target.value as 'ALL'|'INCOME'|'EXPENSE')} aria-label="Filter tipe">
     <option value="ALL">Semua tipe</option>
     <option value="INCOME">Income</option>
     <option value="EXPENSE">Expense</option>
    </select>
    <input type="date" value={from} onChange={e=>setFrom(e.target.value)} aria-label="Dari tanggal"/>
    <input type="date" value={to} onChange={e=>setTo(e.target.value)} aria-label="Sampai tanggal"/>
    {(q||type!=='ALL'||from||to)&&<button className="btn secondary" onClick={()=>{setQ('');setType('ALL');setFrom('');setTo('')}}>Reset</button>}
   </div>
   <span className="filter-count">{filtered.length} dari {rows.length} transaksi</span>
   <button className="btn secondary" onClick={handleExport} disabled={!filtered.length}>⬇ Export CSV</button>
  </div>

  <section className="section"><div className="table-wrap"><table><thead><tr><th>ID</th><th>Tanggal</th><th>Tipe</th><th>Nama</th><th>Kategori</th><th>Nominal</th></tr></thead><tbody>
   {loading&&<tr><td colSpan={6} className="empty muted"><span className="spinner"/> Memuat transaksi…</td></tr>}
   {!loading&&filtered.map(t=><tr key={t.transaction_id}><td data-label="ID">{t.transaction_id}</td><td data-label="Tanggal">{t.tanggal} {t.jam}</td><td data-label="Tipe">{t.type}</td><td data-label="Nama">{String(t.nama_transaksi||t.nama_pengeluaran)}</td><td data-label="Kategori">{t.kategori}</td><td data-label="Nominal">{formatRupiah(t.nominal)}</td></tr>)}
   {!loading&&!error&&!filtered.length&&<tr><td colSpan={6} className="empty muted">{rows.length?'Tidak ada transaksi yang cocok dengan filter.':'Belum ada transaksi.'}</td></tr>}
  </tbody></table></div></section>
 </div>;
}

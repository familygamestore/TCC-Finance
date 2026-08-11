'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, Transaction, Category, PaymentMethod } from '@/lib/api';
import { formatDateTimeDisplay, formatRupiah } from '@/utils/formatters';

type FormState = { nama:string;kategori:string;nominal:string;metode_pembayaran:string;catatan:string;penginput:string };
const EMPTY_FORM:FormState={nama:'',kategori:'',nominal:'',metode_pembayaran:'',catatan:'',penginput:''};

export default function TransactionsPage(){
 const [list,setList]=useState<Transaction[]>([]),[categories,setCategories]=useState<Category[]>([]),[paymentMethods,setPaymentMethods]=useState<PaymentMethod[]>([]),[error,setError]=useState('');
 const [type,setType]=useState<'income'|'expense'>('income'),[form,setForm]=useState<FormState>(EMPTY_FORM),[submitting,setSubmitting]=useState(false),[loading,setLoading]=useState(true),[loadingCategories,setLoadingCategories]=useState(true);
 const filteredCategories=useMemo(()=>categories.filter(c=>!['inactive','nonaktif'].includes(String(c.status).toLowerCase())&&String(c.tipe).toLowerCase()===type),[categories,type]);
 const load=useCallback(async()=>{setLoading(true);try{setList(await api.getTransactions());}catch(e){setError(e instanceof Error?e.message:'Gagal memuat transaksi')}finally{setLoading(false)}},[]);
 const loadCategories=useCallback(async()=>{setLoadingCategories(true);try{setCategories(await api.getCategories())}catch(e){setError(e instanceof Error?e.message:'Gagal memuat kategori')}finally{setLoadingCategories(false)}},[]);
 const loadPaymentMethods=useCallback(async()=>{try{setPaymentMethods((await api.getPaymentMethods()).filter(m=>!['inactive','nonaktif'].includes(String(m.status).toLowerCase())))}catch{setPaymentMethods([])}},[]);
 useEffect(()=>{void load();void loadCategories();void loadPaymentMethods()},[load,loadCategories,loadPaymentMethods]);
 useEffect(()=>{if(form.kategori&&!filteredCategories.some(c=>c.nama_kategori===form.kategori))setForm(p=>({...p,kategori:''}))},[filteredCategories,form.kategori]);
 const change=(key:keyof FormState)=>(e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>)=>setForm(p=>({...p,[key]:e.target.value}));
 async function submit(e:React.FormEvent){e.preventDefault();const nominal=Number(form.nominal);if(!form.nama.trim()||!form.kategori||!form.penginput.trim())return setError('Nama, kategori, dan penginput wajib diisi.');if(!Number.isFinite(nominal)||nominal<=0)return setError('Nominal harus lebih dari 0.');setSubmitting(true);setError('');try{const payload={...form,nominal};if(type==='income')await api.createIncome(payload);else await api.createExpense(payload);setForm(EMPTY_FORM);await load()}catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan transaksi')}finally{setSubmitting(false)}}
 async function del(t:Transaction){if(!confirm('Hapus transaksi ini?'))return;try{await api.deleteTransaction(t.type,t.transaction_id);await load()}catch(e){setError(e instanceof Error?e.message:'Gagal menghapus transaksi')}}
 return <div><div className="page-header"><div><div className="eyebrow">Ledger • Cash Flow</div><h1>Transaksi</h1><p className="subtitle">Input pemasukan dan pengeluaran dengan kategori yang terkontrol.</p></div><div className="actions"><button className="btn secondary" onClick={()=>{void load();void loadCategories();void loadPaymentMethods()}} disabled={loading}>↻ Refresh</button></div></div>
 {error&&<div className="alert"><span>⚠</span>{error}</div>}
 <form className="panel" onSubmit={submit}><div className="form-title"><strong>Input transaksi baru</strong><span>Semua data akan masuk ke ledger Google Sheets.</span></div>
 <label>Tipe<select value={type} onChange={e=>setType(e.target.value as 'income'|'expense')}><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></label>
 <label>Nama transaksi<input required placeholder="Contoh: Registrasi MLBB" value={form.nama} onChange={change('nama')}/></label>
 <label>Kategori<select required value={form.kategori} onChange={change('kategori')} disabled={loadingCategories}><option value="">{loadingCategories?'Memuat kategori…':'Pilih kategori'}</option>{filteredCategories.map(c=><option key={c.category_id||`${c.tipe}-${c.nama_kategori}`} value={c.nama_kategori}>{c.nama_kategori}</option>)}</select><span className="helper">Kategori otomatis difilter berdasarkan tipe transaksi.</span></label>
 <label>Nominal (Rp)<input required min="1" step="1" type="number" inputMode="numeric" placeholder="0" value={form.nominal} onChange={change('nominal')}/></label>
 <label>Metode pembayaran<select value={form.metode_pembayaran} onChange={change('metode_pembayaran')}><option value="">Pilih metode</option>{paymentMethods.map(m=><option key={m.id||m.nama} value={m.nama}>{m.nama}</option>)}</select><span className="helper">Sumber dari sheet PAYMENT_METHODS.</span></label>
 <label>Penginput<input required placeholder="Nama admin" value={form.penginput} onChange={change('penginput')}/></label>
 <label>Catatan<textarea rows={3} placeholder="Keterangan tambahan (opsional)" value={form.catatan} onChange={change('catatan')}/></label>
 <button className="btn" type="submit" disabled={submitting||loadingCategories||filteredCategories.length===0}>{submitting?'Menyimpan…':type==='income'?'＋ Simpan pemasukan':'＋ Simpan pengeluaran'}</button>
 </form>
 <section className="section"><div className="section-head"><h2>Riwayat transaksi</h2><span className="muted">{list.length} data</span></div><div className="table-wrap"><table><thead><tr><th>Tanggal & waktu</th><th>Tipe</th><th>Nama</th><th>Kategori</th><th>Nominal</th><th>Aksi</th></tr></thead><tbody>{list.map(t=><tr key={t.transaction_id}><td>{formatDateTimeDisplay(t.tanggal,t.jam)}</td><td><span className={`tag ${t.type}`}>{t.type==='income'?'PEMASUKAN':'PENGELUARAN'}</span></td><td>{String(t.nama_transaksi||t.nama_pengeluaran||'-')}</td><td>{t.kategori||'-'}</td><td><strong>{formatRupiah(t.nominal)}</strong></td><td className="row-actions"><button type="button" onClick={()=>void del(t)}>Hapus</button></td></tr>)}{!loading&&!list.length&&<tr><td colSpan={6} className="empty muted">Belum ada transaksi.</td></tr>}</tbody></table></div></section>
 </div>;
}

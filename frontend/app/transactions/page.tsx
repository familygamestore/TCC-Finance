'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, Transaction } from '@/lib/api';
import { formatRupiah } from '@/utils/formatters';

type FormState = { nama: string; kategori: string; nominal: string; metode_pembayaran: string; catatan: string; penginput: string };
const EMPTY_FORM: FormState = { nama: '', kategori: '', nominal: '', metode_pembayaran: '', catatan: '', penginput: '' };

export default function TransactionsPage() {
  const [list, setList] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setList(await api.getTransactions()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal memuat transaksi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nominal = Number(form.nominal);
    if (!form.nama.trim() || !form.kategori.trim() || !form.penginput.trim()) return setError('Nama, kategori, dan penginput wajib diisi.');
    if (!Number.isFinite(nominal) || nominal <= 0) return setError('Nominal harus berupa angka lebih dari 0.');

    setSubmitting(true); setError('');
    try {
      const payload = { ...form, nominal };
      if (type === 'income') await api.createIncome(payload); else await api.createExpense(payload);
      setForm(EMPTY_FORM);
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Gagal menyimpan transaksi'); }
    finally { setSubmitting(false); }
  }

  async function handleDelete(t: Transaction) {
    if (!window.confirm('Hapus transaksi ini?')) return;
    setError('');
    try { await api.deleteTransaction(t.type, t.transaction_id); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Gagal menghapus transaksi'); }
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Transaksi</h1><p className="subtitle">Catat pemasukan dan pengeluaran TCC.</p></div>
        <button type="button" className="secondary" onClick={() => void load()} disabled={loading}>{loading ? 'Memuat...' : 'Refresh'}</button>
      </div>
      {error && <div className="alert error">{error}</div>}

      <form className="panel" onSubmit={handleSubmit}>
        <label>Tipe<select value={type} onChange={e => setType(e.target.value as 'income' | 'expense')}><option value="income">Pemasukan</option><option value="expense">Pengeluaran</option></select></label>
        <label>Nama transaksi<input required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} /></label>
        <label>Kategori<input required value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} /></label>
        <label>Nominal (Rp)<input required min="1" step="1" type="number" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} /></label>
        <label>Metode pembayaran<input value={form.metode_pembayaran} onChange={e => setForm({ ...form, metode_pembayaran: e.target.value })} /></label>
        <label>Penginput<input required value={form.penginput} onChange={e => setForm({ ...form, penginput: e.target.value })} /></label>
        <label>Catatan<textarea rows={2} value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} /></label>
        <button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan transaksi'}</button>
      </form>

      <h2>Riwayat transaksi</h2>
      <div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Nama</th><th>Kategori</th><th>Nominal</th><th></th></tr></thead>
        <tbody>
          {list.map(t => <tr key={t.transaction_id}><td>{t.tanggal} {t.jam}</td><td><span className={`tag ${t.type}`}>{t.type === 'income' ? 'Masuk' : 'Keluar'}</span></td><td>{String(t.nama_transaksi || t.nama_pengeluaran || '-')}</td><td>{t.kategori || '-'}</td><td>{formatRupiah(t.nominal)}</td><td className="row-actions"><button type="button" onClick={() => void handleDelete(t)}>Hapus</button></td></tr>)}
          {!loading && list.length === 0 && <tr><td colSpan={6} className="muted empty">Belum ada transaksi.</td></tr>}
        </tbody>
      </table></div>
    </div>
  );
}

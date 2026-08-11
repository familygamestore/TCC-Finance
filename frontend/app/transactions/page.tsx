'use client';

import { useEffect, useState } from 'react';
import { api, Transaction } from '../../lib/api';

function formatRupiah(n: number) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

export default function TransactionsPage() {
  const [list, setList] = useState<Transaction[]>([]);
  const [error, setError] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [form, setForm] = useState({ nama: '', kategori: '', nominal: '', metode_pembayaran: '', catatan: '', penginput: '' });
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.getTransactions().then(setList).catch(e => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = { ...form, nominal: Number(form.nominal) };
      if (type === 'income') await api.createIncome(payload);
      else await api.createExpense(payload);
      setForm({ nama: '', kategori: '', nominal: '', metode_pembayaran: '', catatan: '', penginput: '' });
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(t: Transaction) {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      await api.deleteTransaction(t.type, t.transaction_id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Transaksi</h1>
      <p className="subtitle">Catat pemasukan dan pengeluaran. Data langsung tersimpan di Google Spreadsheet.</p>

      {error && <p className="error">{error}</p>}

      <form className="panel" onSubmit={handleSubmit}>
        <label>
          Tipe
          <select value={type} onChange={e => setType(e.target.value as 'income' | 'expense')}>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </label>
        <label>
          Nama transaksi
          <input required value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
        </label>
        <label>
          Kategori
          <input required value={form.kategori} onChange={e => setForm({ ...form, kategori: e.target.value })} />
        </label>
        <label>
          Nominal (Rp)
          <input required type="number" value={form.nominal} onChange={e => setForm({ ...form, nominal: e.target.value })} />
        </label>
        <label>
          Metode pembayaran
          <input value={form.metode_pembayaran} onChange={e => setForm({ ...form, metode_pembayaran: e.target.value })} />
        </label>
        <label>
          Penginput
          <input required value={form.penginput} onChange={e => setForm({ ...form, penginput: e.target.value })} />
        </label>
        <label>
          Catatan
          <textarea rows={2} value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} />
        </label>
        <button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Simpan transaksi'}</button>
      </form>

      <h2>Riwayat transaksi</h2>
      <table>
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Tipe</th>
            <th>Nama</th>
            <th>Kategori</th>
            <th>Nominal</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map(t => (
            <tr key={t.transaction_id}>
              <td>{t.tanggal} {t.jam}</td>
              <td><span className={`tag ${t.type}`}>{t.type === 'income' ? 'Masuk' : 'Keluar'}</span></td>
              <td>{String(t.nama_transaksi || t.nama_pengeluaran || '')}</td>
              <td>{t.kategori}</td>
              <td>{formatRupiah(t.nominal)}</td>
              <td className="row-actions">
                <button onClick={() => handleDelete(t)}>Hapus</button>
              </td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={6} className="muted">Belum ada transaksi.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

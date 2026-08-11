'use client';

import { useEffect, useState } from 'react';
import { api, EventItem } from '../../lib/api';

function formatRupiah(n: number) {
  return 'Rp' + (n || 0).toLocaleString('id-ID');
}

const emptyForm = {
  nama_event: '', game: '', tanggal_mulai: '', tanggal_selesai: '',
  jumlah_peserta: '', biaya_registrasi: '', target_pemasukan: '', budget: '', prize_pool: ''
};

export default function EventsPage() {
  const [list, setList] = useState<EventItem[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  function load() {
    api.getEvents().then(setList).catch(e => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.createEvent({
        ...form,
        jumlah_peserta: Number(form.jumlah_peserta),
        biaya_registrasi: Number(form.biaya_registrasi),
        target_pemasukan: Number(form.target_pemasukan),
        budget: Number(form.budget),
        prize_pool: Number(form.prize_pool)
      });
      setForm(emptyForm);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus event ini?')) return;
    try {
      await api.deleteEvent(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1>Event</h1>
      <p className="subtitle">Kelola event dan lihat profit/loss per event.</p>

      {error && <p className="error">{error}</p>}

      <form className="panel" onSubmit={handleSubmit}>
        <label>
          Nama event
          <input required value={form.nama_event} onChange={e => setForm({ ...form, nama_event: e.target.value })} />
        </label>
        <label>
          Game
          <input value={form.game} onChange={e => setForm({ ...form, game: e.target.value })} />
        </label>
        <label>
          Tanggal mulai
          <input type="date" value={form.tanggal_mulai} onChange={e => setForm({ ...form, tanggal_mulai: e.target.value })} />
        </label>
        <label>
          Tanggal selesai
          <input type="date" value={form.tanggal_selesai} onChange={e => setForm({ ...form, tanggal_selesai: e.target.value })} />
        </label>
        <label>
          Jumlah peserta
          <input type="number" value={form.jumlah_peserta} onChange={e => setForm({ ...form, jumlah_peserta: e.target.value })} />
        </label>
        <label>
          Biaya registrasi (Rp)
          <input type="number" value={form.biaya_registrasi} onChange={e => setForm({ ...form, biaya_registrasi: e.target.value })} />
        </label>
        <label>
          Target pemasukan (Rp)
          <input type="number" value={form.target_pemasukan} onChange={e => setForm({ ...form, target_pemasukan: e.target.value })} />
        </label>
        <label>
          Budget (Rp)
          <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} />
        </label>
        <label>
          Prize pool (Rp)
          <input type="number" value={form.prize_pool} onChange={e => setForm({ ...form, prize_pool: e.target.value })} />
        </label>
        <button type="submit" disabled={submitting}>{submitting ? 'Menyimpan...' : 'Buat event'}</button>
      </form>

      <h2>Daftar event</h2>
      <table>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Game</th>
            <th>Tanggal</th>
            <th>Budget</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {list.map(ev => (
            <tr key={ev.event_id}>
              <td>{ev.nama_event}</td>
              <td>{ev.game}</td>
              <td>{ev.tanggal_mulai} - {ev.tanggal_selesai}</td>
              <td>{formatRupiah(ev.budget)}</td>
              <td>{ev.status}</td>
              <td className="row-actions">
                <button onClick={() => handleDelete(ev.event_id)}>Hapus</button>
              </td>
            </tr>
          ))}
          {list.length === 0 && <tr><td colSpan={6} className="muted">Belum ada event.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

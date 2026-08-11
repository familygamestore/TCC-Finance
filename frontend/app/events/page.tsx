'use client';

import { useEffect, useState } from 'react';
import { api, EventItem } from '../../lib/api';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import ErrorMessage from './components/ErrorMessage';
import PageHeader from './components/PageHeader';

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
    api.getEvents()
      .then(setList)
      .catch(e => setError(e.message));
  }

  useEffect(load, []);

  async function handleSubmit(formData: typeof emptyForm) {
    setSubmitting(true);
    setError('');
    try {
      await api.createEvent({
        ...formData,
        jumlah_peserta: Number(formData.jumlah_peserta),
        biaya_registrasi: Number(formData.biaya_registrasi),
        target_pemasukan: Number(formData.target_pemasukan),
        budget: Number(formData.budget),
        prize_pool: Number(formData.prize_pool)
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
      <PageHeader />
      
      {error && <ErrorMessage message={error} />}
      
      <EventForm 
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
      
      <EventList 
        events={list}
        onDelete={handleDelete}
      />
    </div>
  );
}

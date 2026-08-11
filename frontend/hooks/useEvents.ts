'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EventItem, EventFormData, EventPayload } from '@/types/event';
import { EMPTY_EVENT_FORM } from '@/constants/eventConstants';
import { validateEventForm } from '@/utils/validators';

function toPayload(form: EventFormData): EventPayload {
  return {
    ...form,
    jumlah_peserta: Number(form.jumlah_peserta),
    biaya_registrasi: Number(form.biaya_registrasi),
    target_pemasukan: Number(form.target_pemasukan),
    budget: Number(form.budget),
    prize_pool: Number(form.prize_pool)
  };
}

export function useEvents() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState<EventFormData>(EMPTY_EVENT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    api.getEvents()
      .then(setEvents)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const submitEvent = useCallback(async (formData: EventFormData) => {
    const validationError = validateEventForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.createEvent(toPayload(formData));
      setForm(EMPTY_EVENT_FORM);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }, [load]);

  const deleteEvent = useCallback(async (id: string) => {
    if (!confirm('Hapus event ini?')) return;
    try {
      await api.deleteEvent(id);
      load();
    } catch (err: any) {
      setError(err.message);
    }
  }, [load]);

  return {
    events,
    error,
    setError,
    form,
    setForm,
    submitting,
    loading,
    submitEvent,
    deleteEvent
  };
}

'use client';

import { useEvents } from '@/hooks/useEvents';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import ErrorMessage from './components/ErrorMessage';
import PageHeader from './components/PageHeader';

export default function EventsPage() {
  const { events, error, form, setForm, submitting, submitEvent, deleteEvent } = useEvents();

  return (
    <div>
      <PageHeader />

      <ErrorMessage message={error} />

      <EventForm form={form} setForm={setForm} onSubmit={submitEvent} submitting={submitting} />

      <EventList events={events} onDelete={deleteEvent} />
    </div>
  );
}

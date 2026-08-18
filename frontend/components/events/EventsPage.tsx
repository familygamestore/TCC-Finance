'use client';
import { useEvents } from '@/hooks/useEvents';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import ErrorMessage from './components/ErrorMessage';
export default function EventsPage(){const {events,brands,error,setError,notice,form,setForm,submitting,loading,submitEvent,deleteEvent,refresh}=useEvents();return <div><div className="page-header"><div><div className="eyebrow">Operations • Universal Event Builder</div><h1>Event Hub</h1><p className="subtitle">Semua game, semua kategori, semua ukuran turnamen. Pilih cepat atau ketik manual.</p></div><div className="actions"><button className="btn secondary" onClick={()=>void refresh()} disabled={loading}>↻ {loading?'Memuat…':'Refresh'}</button></div></div><ErrorMessage message={error} onClose={()=>setError('')}/>{notice&&<div className="success-alert" role="status">✓ {notice}</div>}<EventForm form={form} setForm={setForm} onSubmit={submitEvent} submitting={submitting} brands={brands}/><EventList events={events} onDelete={deleteEvent} loading={loading}/></div>}

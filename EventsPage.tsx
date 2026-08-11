'use client';
import { useEvents } from '@/hooks/useEvents';
import EventForm from './components/EventForm';
import EventList from './components/EventList';
import ErrorMessage from './components/ErrorMessage';

export default function EventsPage(){
 const {events,error,setError,form,setForm,submitting,loading,submitEvent,deleteEvent,refresh}=useEvents();
 return <div><div className="page-header"><div><div className="eyebrow">Operations • Event Management</div><h1>Event Hub</h1><p className="subtitle">Kelola event TCC dan siapkan angka operasionalnya sejak awal.</p></div><div className="actions"><button className="btn secondary" onClick={()=>void refresh()} disabled={loading}>↻ {loading?'Memuat…':'Refresh'}</button></div></div><ErrorMessage message={error} onClose={()=>setError('')}/><EventForm form={form} setForm={setForm} onSubmit={submitEvent} submitting={submitting}/><EventList events={events} onDelete={deleteEvent} loading={loading}/></div>;
}

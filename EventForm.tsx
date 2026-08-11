'use client';
import { FormEvent } from 'react';
import { EventFormData } from '@/types/event';
import { EVENT_FORM_FIELDS } from '@/constants/eventConstants';
import FormField from './FormField';
interface Props{form:EventFormData;setForm:(form:EventFormData)=>void;onSubmit:(form:EventFormData)=>void;submitting:boolean}
export default function EventForm({form,setForm,onSubmit,submitting}:Props){function handleSubmit(e:FormEvent){e.preventDefault();onSubmit(form)}return <form className="panel" onSubmit={handleSubmit}><div className="form-title"><strong>Buat event baru</strong><span>Masukkan data dasar event untuk monitoring budget dan prize pool.</span></div>{EVENT_FORM_FIELDS.map(field=><FormField key={field.name} {...field} value={form[field.name]} onChange={(name,value)=>setForm({...form,[name]:value})}/>)}<button className="btn" type="submit" disabled={submitting}>{submitting?'Menyimpan…':'＋ Buat event'}</button></form>}

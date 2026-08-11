'use client';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { EventItem, EventFormData, EventPayload } from '@/types/event';
import { EMPTY_EVENT_FORM } from '@/constants/eventConstants';
import { validateEventForm } from '@/utils/validators';
function toPayload(form:EventFormData):EventPayload{return {...form,jumlah_peserta:Number(form.jumlah_peserta)||0,biaya_registrasi:Number(form.biaya_registrasi)||0,target_pemasukan:Number(form.target_pemasukan)||0,budget:Number(form.budget)||0,prize_pool:Number(form.prize_pool)||0}}
export function useEvents(){const [events,setEvents]=useState<EventItem[]>([]),[error,setError]=useState(''),[form,setForm]=useState<EventFormData>(EMPTY_EVENT_FORM),[submitting,setSubmitting]=useState(false),[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{setLoading(true);setError('');try{setEvents(await api.getEvents())}catch(e){setError(e instanceof Error?e.message:'Gagal memuat event')}finally{setLoading(false)}},[]);useEffect(()=>{void refresh()},[refresh]);
 const submitEvent=useCallback(async(formData:EventFormData)=>{const validationError=validateEventForm(formData);if(validationError){setError(validationError);return}setSubmitting(true);setError('');try{await api.createEvent(toPayload(formData));setForm(EMPTY_EVENT_FORM);await refresh()}catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan event')}finally{setSubmitting(false)}},[refresh]);
 const deleteEvent=useCallback(async(id:string)=>{if(!confirm('Hapus event ini?'))return;setError('');try{await api.deleteEvent(id);await refresh()}catch(e){setError(e instanceof Error?e.message:'Gagal menghapus event')}},[refresh]);
 return {events,error,setError,form,setForm,submitting,loading,submitEvent,deleteEvent,refresh};}

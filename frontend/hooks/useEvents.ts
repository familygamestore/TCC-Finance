'use client';
import { useCallback,useEffect,useState } from 'react';
import { api, Brand } from '@/lib/api';
import { EventItem,EventFormData,EventPayload } from '@/types/event';
import { EMPTY_EVENT_FORM } from '@/constants/eventConstants';

const n=(v:string)=>Number(String(v).replace(/[^0-9]/g,''))||0;
function toPayload(f:EventFormData):EventPayload{return {...f,jumlah_peserta:n(f.jumlah_peserta),biaya_registrasi:n(f.biaya_registrasi),target_pemasukan:n(f.target_pemasukan),budget:n(f.budget),prize_pool:n(f.prize_pool),sponsor_revenue:n(f.sponsor_revenue),other_income:n(f.other_income),other_expense:n(f.other_expense)}}
export function useEvents(){
 const [events,setEvents]=useState<EventItem[]>([]),[brands,setBrands]=useState<Brand[]>([]),[error,setError]=useState(''),[form,setForm]=useState<EventFormData>(EMPTY_EVENT_FORM),[submitting,setSubmitting]=useState(false),[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{setLoading(true);setError('');try{const [e,b]=await Promise.all([api.getEvents(),api.getBrands()]);setEvents(e);setBrands(b);if(!form.brand_id&&b[0])setForm(f=>({...f,brand_id:b[0].brand_id}))}catch(e){setError(e instanceof Error?e.message:'Gagal memuat event')}finally{setLoading(false)}},[]);
 useEffect(()=>{void refresh()},[refresh]);
 const submitEvent=useCallback(async(f:EventFormData)=>{if(!f.brand_id||!f.nama_event||!f.game){setError('Brand, nama event, dan game wajib diisi.');return}if(n(f.jumlah_peserta)<=0){setError('Jumlah tim/peserta harus lebih dari 0.');return}if((f.tanggal_mulai||f.tanggal_selesai)&&(!f.tanggal_mulai||!f.tanggal_selesai)){setError('Tanggal mulai dan selesai harus lengkap.');return}setSubmitting(true);setError('');try{await api.createEvent(toPayload(f) as unknown as Record<string,unknown>);setForm({...EMPTY_EVENT_FORM,brand_id:f.brand_id});await refresh()}catch(e){setError(e instanceof Error?e.message:'Gagal menyimpan event')}finally{setSubmitting(false)}},[refresh]);
 const deleteEvent=useCallback(async(id:string)=>{if(!confirm('Hapus event ini?'))return;try{await api.deleteEvent(id);await refresh()}catch(e){setError(e instanceof Error?e.message:'Gagal menghapus event')}},[refresh]);
 return {events,brands,error,setError,form,setForm,submitting,loading,submitEvent,deleteEvent,refresh};
}

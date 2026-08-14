'use client';
import { FormEvent } from 'react';
import { EventFormData } from '@/types/event';
import { GAME_SUGGESTIONS,SLOT_OPTIONS,TOURNAMENT_SYSTEMS,QUICK_MONEY } from '@/constants/eventConstants';
import MoneyInput from './MoneyInput';
import { Brand } from '@/lib/api';

export default function EventForm({form,setForm,onSubmit,submitting,brands}:{form:EventFormData;setForm:(f:EventFormData)=>void;onSubmit:(f:EventFormData)=>void;submitting:boolean;brands:Brand[]}){
 const set=(k:keyof EventFormData)=>(v:string)=>setForm({...form,[k]:v});
 const autoTarget=()=>{const teams=Number(form.jumlah_peserta)||0;const fee=Number(form.biaya_registrasi)||0;set('target_pemasukan')(String(teams*fee));};
 function submit(e:FormEvent){e.preventDefault();onSubmit(form)}
 return <form className="panel event-builder" onSubmit={submit}>
  <div className="form-title"><strong>Event Builder</strong><span>Buat event apa pun: 4–256 tim, game bebas, sistem turnamen bebas, biaya & budget cepat atau manual.</span></div>
  <label>Brand<select value={form.brand_id} onChange={e=>set('brand_id')(e.target.value)} required><option value="">Pilih brand</option>{brands.map(b=><option key={b.brand_id} value={b.brand_id}>{b.nama_brand}</option>)}</select></label>
  <label>Nama event<input value={form.nama_event} onChange={e=>set('nama_event')(e.target.value)} placeholder="Contoh: FUN MATCH MONGSTER" required/></label>
  <label>Game<input list="game-suggestions" value={form.game} onChange={e=>set('game')(e.target.value)} placeholder="Ketik nama game…" required/><datalist id="game-suggestions">{GAME_SUGGESTIONS.map(g=><option key={g} value={g}/>)}</datalist><span className="select-note">Ketik langsung untuk game yang tidak ada di daftar.</span></label>
  <label>Kategori event<input value={form.kategori_event} onChange={e=>set('kategori_event')(e.target.value)} placeholder="Tournament / Fun Match / Scrim / League / Custom" /></label>
  <label>Sistem turnamen<select value={form.sistem_turnamen} onChange={e=>set('sistem_turnamen')(e.target.value)}>{TOURNAMENT_SYSTEMS.map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Jumlah tim / peserta<select value={SLOT_OPTIONS.includes(Number(form.jumlah_peserta))?form.jumlah_peserta:'CUSTOM'} onChange={e=>set('jumlah_peserta')(e.target.value==='CUSTOM'?'':e.target.value)}>{SLOT_OPTIONS.map(x=><option key={x} value={x}>{x} Tim</option>)}<option value="CUSTOM">Isi manual</option></select></label>
  {(!SLOT_OPTIONS.includes(Number(form.jumlah_peserta)))&&<label>Jumlah custom<input type="number" min="1" value={form.jumlah_peserta} onChange={e=>set('jumlah_peserta')(e.target.value)} placeholder="Contoh 20"/></label>}
  <label>Tanggal mulai<input type="date" value={form.tanggal_mulai} onChange={e=>set('tanggal_mulai')(e.target.value)}/></label>
  <label>Tanggal selesai<input type="date" value={form.tanggal_selesai} onChange={e=>set('tanggal_selesai')(e.target.value)}/></label>
  <MoneyInput label="Biaya registrasi" value={form.biaya_registrasi} onChange={set('biaya_registrasi')} quick={QUICK_MONEY.registration}/>
  <MoneyInput label="Budget operasional" value={form.budget} onChange={set('budget')} quick={QUICK_MONEY.budget}/>
  <MoneyInput label="Prize pool" value={form.prize_pool} onChange={set('prize_pool')} quick={QUICK_MONEY.prize}/>
  <MoneyInput label="Pendapatan sponsor" value={form.sponsor_revenue} onChange={set('sponsor_revenue')} quick={[0,500000,1000000,2000000]}/>
  <MoneyInput label="Pemasukan lainnya" value={form.other_income} onChange={set('other_income')} quick={[0,100000,250000,500000]}/>
  <MoneyInput label="Pengeluaran lainnya" value={form.other_expense} onChange={set('other_expense')} quick={[0,100000,250000,500000,1000000]}/>
  <div className="money-field"><label>Target pemasukan<input inputMode="numeric" value={form.target_pemasukan?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(form.target_pemasukan)):''} onChange={e=>set('target_pemasukan')(e.target.value.replace(/[^0-9]/g,''))} placeholder="Otomatis / isi manual"/></label><div className="quick-values"><button type="button" className="quick-chip" onClick={autoTarget}>Hitung tim × registrasi</button></div></div>
  <div className="event-summary"><span>{form.jumlah_peserta||0} tim</span><span>Estimasi omzet {form.target_pemasukan?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(Number(form.target_pemasukan)): 'Rp0'}</span><span>Estimasi laba {new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format((Number(form.target_pemasukan)||0)+(Number(form.sponsor_revenue)||0)+(Number(form.other_income)||0)-(Number(form.prize_pool)||0)-(Number(form.budget)||0)-(Number(form.other_expense)||0))}</span><span>Registrasi {form.biaya_registrasi?'Rp '+Number(form.biaya_registrasi).toLocaleString('id-ID'):'Rp 0'}</span><span>Prize {form.prize_pool?'Rp '+Number(form.prize_pool).toLocaleString('id-ID'):'Rp 0'}</span><span>Budget {form.budget?'Rp '+Number(form.budget).toLocaleString('id-ID'):'Rp 0'}</span></div>
  <button className="btn" type="submit" disabled={submitting}>{submitting?'Menyimpan…':'＋ Simpan Event'}</button>
 </form>
}

'use client';
import { ChangeEvent } from 'react';
import { formatRupiah } from '@/utils/formatters';

export default function MoneyInput({label,value,onChange,required=false,placeholder='Rp 0',quick=[]}:{label:string;value:string;onChange:(value:string)=>void;required?:boolean;placeholder?:string;quick?:number[]}){
  const numeric = value.replace(/[^0-9]/g,'');
  const display = numeric ? formatRupiah(Number(numeric)) : '';
  const set=(raw:string)=>onChange(raw.replace(/[^0-9]/g,''));
  return <div className="money-field">
    <label>{label}<input inputMode="numeric" value={display} placeholder={placeholder} required={required} onChange={(e:ChangeEvent<HTMLInputElement>)=>set(e.target.value)} /></label>
    {quick.length>0&&<div className="quick-values">{quick.map(v=><button type="button" key={v} className="quick-chip" onClick={()=>onChange(String(v))}>{formatRupiah(v)}</button>)}</div>}
  </div>;
}

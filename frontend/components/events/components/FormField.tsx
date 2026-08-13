'use client';
import { ChangeEvent } from 'react';
import { EventFormData } from '@/types/event';
interface Props{name:keyof EventFormData;label:string;type:'text'|'date'|'number';value:string;required?:boolean;onChange:(name:keyof EventFormData,value:string)=>void}
export default function FormField({name,label,type,value,required,onChange}:Props){function handleChange(e:ChangeEvent<HTMLInputElement>){onChange(name,e.target.value)}return <label>{label}<input type={type} required={required} min={type==='number'?'0':undefined} value={value} onChange={handleChange}/></label>}

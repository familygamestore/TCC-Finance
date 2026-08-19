'use client';
import {useEffect,useState} from 'react';
import {api,clearSuperAdminSession,getAuthRole,getSuperAdminToken,getAuthUserName} from '@/lib/api';
import {useRouter} from 'next/navigation';

export default function ChangePasswordPage(){
 const router=useRouter(); const [current,setCurrent]=useState(''); const [next,setNext]=useState(''); const [confirm,setConfirm]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
 useEffect(()=>{if(!getSuperAdminToken() || !['ADMIN','SUPER_ADMIN'].includes(getAuthRole())) router.replace('/admin')},[router]);
 async function submit(e:React.FormEvent){e.preventDefault();setError('');if(next.length<12){setError('Password baru minimal 12 karakter.');return}if(next!==confirm){setError('Konfirmasi password tidak sama.');return}setBusy(true);try{const role=getAuthRole(); await api.changePassword(current,next);clearSuperAdminSession();alert('Password berhasil diubah. Silakan login kembali.');router.replace(role==='SUPER_ADMIN'?'/super-admin':'/admin')}catch(e){setError(e instanceof Error?e.message:'Gagal mengubah password')}finally{setBusy(false)}}
 return <div className="auth-wrap"><div className="auth-card"><div className="eyebrow">Security · First Login</div><h1>Ganti Password</h1><p className="subtitle">Akun {getAuthUserName()||getAuthRole()} wajib mengganti password sementara sebelum menggunakan sistem.</p>{error&&<div className="alert">⚠ {error}</div>}<form className="form-grid" onSubmit={submit}><label>Password saat ini<input type="password" autoComplete="current-password" value={current} onChange={e=>setCurrent(e.target.value)} required/></label><label>Password baru<input type="password" autoComplete="new-password" minLength={12} value={next} onChange={e=>setNext(e.target.value)} required/><span className="helper">Minimal 12 karakter.</span></label><label>Konfirmasi password<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label><div className="wide"><button className="btn" disabled={busy}>{busy?'Menyimpan…':'Simpan Password Baru'}</button></div></form></div></div>
}

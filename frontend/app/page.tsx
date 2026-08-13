'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAuthRole } from '@/lib/api';

export default function LandingPage(){
  const [role,setRole]=useState('');
  useEffect(()=>{setRole(getAuthRole());},[]);
  const target=role==='SUPER_ADMIN'?'/dashboard':role==='ADMIN'?'/requests':'/admin';
  return <main className="landing-page">
    <section className="landing-hero">
      <div className="landing-copy">
        <span className="landing-kicker">TCC FINANCE • COMMAND CENTER</span>
        <h1>Finance, cash & event operations dalam <em>satu workspace.</em></h1>
        <p>Kelola kas multi-brand, transaksi, pengajuan, event, approval, dan analytics dengan akses yang dikontrol per brand.</p>
        <div className="landing-actions"><Link className="btn landing-primary" href={target}>{role?'Buka Workspace':'Masuk ke Dashboard'}</Link><a className="btn secondary" href="#features">Lihat fitur</a></div>
        <div className="landing-trust"><span>✓ Multi-brand</span><span>✓ Approval workflow</span><span>✓ Role-based access</span><span>✓ Responsive</span></div>
      </div>
      <div className="landing-visual" aria-hidden="true">
        <div className="dashboard-preview"><div className="preview-top"><span className="preview-dot"/><span/><span/><b>TCC FINANCE</b></div><div className="preview-body"><div className="preview-sidebar"><i/><i/><i/><i/><i/></div><div className="preview-main"><small>NET CASH</small><strong>Rp8.500.000</strong><div className="preview-chart"><span style={{height:'35%'}}/><span style={{height:'52%'}}/><span style={{height:'44%'}}/><span style={{height:'70%'}}/><span style={{height:'61%'}}/><span style={{height:'88%'}}/><span style={{height:'76%'}}/></div><div className="preview-row"><span/><span/><span/></div></div></div></div>
      </div>
    </section>
    <section id="features" className="landing-features"><div className="section-head"><div><div className="eyebrow">Built for operations</div><h2>Semua yang penting, tanpa UI yang berantakan.</h2></div></div><div className="feature-grid">
      {[
        ['◉','Cash Control','Pantau saldo sistem, saldo aktual, income, expense dan rekonsiliasi per brand.'],
        ['✓','Approval Center','Admin mengajukan. Super Admin memeriksa, ACC, menolak atau membatalkan.'],
        ['◆','Event Finance','Kelola game apa pun, jumlah tim fleksibel, budget, registrasi dan prize pool.'],
        ['⌁','Access Control','Super Admin menentukan Admin mana yang boleh melihat brand dan fitur tertentu.'],
        ['↗','Analytics','Cash flow, income vs expense, budget usage dan performa event dalam grafik.'],
        ['▣','Responsive','Desktop, laptop, tablet, iPad, iPhone dan Android tetap rapi.']
      ].map(([icon,title,desc])=><article className="feature-card" key={title}><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{desc}</p></article>)}
    </div></section>
    <section className="landing-bottom"><div><div className="eyebrow">Secure by design</div><h2>Super Admin mengontrol akses. Admin hanya melihat data yang memang diberikan.</h2></div><Link className="btn" href={target}>{role?'Masuk sekarang':'Login'}</Link></section>
  </main>
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api, clearSuperAdminSession, getAuthRole, getAuthUserName } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

type NavItem = { href: string; label: string; icon: string; hint?: string };
const superItems: NavItem[] = [
  { href: '/', label: 'Overview', icon: '⌂', hint: 'Command center' },
  { href: '/cash', label: 'Kas & Brand', icon: '₽', hint: 'Saldo & rekonsiliasi' },
  { href: '/transactions', label: 'Transaksi', icon: '↕', hint: 'Ledger keuangan' },
  { href: '/requests', label: 'Pengajuan', icon: '✓', hint: 'Approval queue' },
  { href: '/events', label: 'Event Hub', icon: '◆', hint: 'Event & budget' },
  { href: '/super-admin', label: 'Administration', icon: '⚙', hint: 'Users & settings' },
  { href: '/access-control', label: 'Access Control', icon: '⌘', hint: 'Brand & permission' },
];
const adminItems: NavItem[] = [
  { href: '/', label: 'Overview', icon: '⌂', hint: 'Ringkasan workspace' },
  { href: '/cash', label: 'Kas & Brand', icon: '₽', hint: 'Brand yang diizinkan' },
  { href: '/transactions', label: 'Transaksi', icon: '↕', hint: 'Ledger sesuai akses' },
  { href: '/requests', label: 'Pengajuan Saya', icon: '✓', hint: 'Ajukan & pantau' },
  { href: '/events', label: 'Event', icon: '◆', hint: 'Event sesuai akses' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>('light');

  useEffect(() => {
    const sync = () => { setRole(getAuthRole()); setUserName(getAuthUserName()); };
    sync();
    const saved = localStorage.getItem('tcc_theme');
    if (saved === 'dark' || saved === 'light') setTheme(saved);
    const storedCollapsed = localStorage.getItem('tcc_sidebar_collapsed');
    if (storedCollapsed === '1') setCollapsed(true);
    window.addEventListener('tcc-auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener('tcc-auth-changed', sync); window.removeEventListener('storage', sync); };
  }, []);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('tcc_theme', theme); }, [theme]);
  useEffect(() => setOpen(false), [pathname]);

  const items = useMemo(() => role === 'SUPER_ADMIN' ? superItems : role === 'ADMIN' ? adminItems : [], [role]);
  if (!role && pathname === '/') return null;
  const initials = (userName || (role === 'SUPER_ADMIN' ? 'Super Admin' : role === 'ADMIN' ? 'Admin' : 'TCC')).split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();
  async function logout() { try { if (role) await api.logout(); } catch {} clearSuperAdminSession(); router.push('/admin'); }
  function toggleCollapsed() { setCollapsed(v => { const next = !v; localStorage.setItem('tcc_sidebar_collapsed', next ? '1' : '0'); return next; }); }

  return <>
    <button className="mobile-menu-button" type="button" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(v => !v)}><span/><span/><span/></button>
    {open && <button className="nav-backdrop" aria-label="Tutup menu" onClick={() => setOpen(false)} />}
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${open ? 'open' : ''}`}>
      <div className="sidebar-top">
        <Link href="/" className="brand" aria-label="TCC Finance"><span className="brand-mark">T</span><span className="brand-copy"><strong>TCC FINANCE</strong><span>Finance Command Center</span></span></Link>
      </div>
      {role && <div className="workspace-switcher"><span className="workspace-dot"/><span><small>WORKSPACE</small><strong>{role === 'SUPER_ADMIN' ? 'All Brands' : 'Assigned Brands'}</strong></span><span className="chevron">⌄</span></div>}
      <nav className="sidebar-nav" aria-label="Navigasi utama">
        {role && <div className="nav-section-title">Workspace</div>}
        {items.map(item => { const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href); return <Link key={item.href} href={item.href} className={`side-link ${active ? 'active' : ''}`} title={collapsed ? `${item.label} — ${item.hint}` : undefined}><span className="nav-icon">{item.icon}</span><span className="side-link-copy"><strong>{item.label}</strong><small>{item.hint}</small></span></Link>; })}
        {!role && <><div className="nav-section-title">Access</div><Link href="/admin" className={`side-link ${pathname === '/admin' ? 'active' : ''}`}><span className="nav-icon">↪</span><span className="side-link-copy"><strong>Admin</strong><small>Workspace login</small></span></Link><Link href="/super-admin" className={`side-link ${pathname === '/super-admin' ? 'active' : ''}`}><span className="nav-icon">♙</span><span className="side-link-copy"><strong>Super Admin</strong><small>Secure control room</small></span></Link></>}
      </nav>
      <div className="sidebar-bottom">
        {role ? <div className="profile-card"><div className={`account-avatar ${role === 'SUPER_ADMIN' ? 'is-super' : ''}`}>{initials}</div><div className="account-copy"><strong>{userName || 'TCC User'}</strong><span className={`role-badge ${role === 'SUPER_ADMIN' ? 'super' : 'admin'}`}>{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span></div></div> : <div className="guest-card"><strong>Local workspace</strong><span>Silakan masuk untuk membuka data.</span></div>}
        <div className="sidebar-utility-row">
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={collapsed ? 'Ganti tema' : undefined} aria-label={theme === 'dark' ? 'Aktifkan light mode' : 'Aktifkan dark mode'}><span className="theme-toggle-icon">{theme === 'dark' ? '☀' : '☾'}</span><span className="theme-copy">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span></button>
          <button className="collapse-button" type="button" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : undefined}><span className="collapse-button-icon">{collapsed ? '→' : '←'}</span><span className="collapse-button-label">Collapse</span></button>
        </div>
        {role && <button className="logout-button" type="button" onClick={() => void logout()}><span>↪</span><span>Keluar</span></button>}
      </div>
    </aside>
  </>;
}

'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuthRole, getAuthUserName, clearSuperAdminSession, api } from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';

type NavItem = { href: string; label: string; icon: string; section?: string };

const superItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: '⌂' },
  { href: '/requests', label: 'Pengajuan', icon: '✓' },
  { href: '/transactions', label: 'Transaksi', icon: '↕' },
  { href: '/events', label: 'Event Hub', icon: '◆' },
  { href: '/cash', label: 'Kas & Rekonsiliasi', icon: 'Rp' },
];

const adminItems: NavItem[] = [
  { href: '/requests', label: 'Pengajuan Saya', icon: '✓' },
  { href: '/events', label: 'Event', icon: '◆' },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState('');
  const [userName, setUserName] = useState('');
  const [open, setOpen] = useState(false);

  const sync = () => {
    setRole(getAuthRole());
    setUserName(getAuthUserName());
  };

  useEffect(() => {
    sync();
    window.addEventListener('tcc-auth-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('tcc-auth-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const items = useMemo(() => role === 'SUPER_ADMIN' ? superItems : role === 'ADMIN' ? adminItems : [], [role]);
  const initials = (userName || (role === 'SUPER_ADMIN' ? 'SA' : role === 'ADMIN' ? 'AD' : 'TC'))
    .split(/\s+/).map(x => x[0]).join('').slice(0, 2).toUpperCase();

  async function logout() {
    try { if (role) await api.logout(); } catch { /* local logout still proceeds */ }
    clearSuperAdminSession();
    window.dispatchEvent(new Event('tcc-auth-changed'));
    router.push('/admin');
  }

  return (
    <div className="nav-system">
      <button className="mobile-menu-button" type="button" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(v => !v)}>
        <span /> <span /> <span />
      </button>
      <nav className={`nav ${open ? 'open' : ''}`} aria-label="Navigasi utama">
        {role === 'SUPER_ADMIN' && <div className="nav-label">Workspace</div>}
        {items.map(item => (
          <Link key={item.href} href={item.href} className={pathname === item.href ? 'active' : ''}>
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        {role === 'SUPER_ADMIN' && <Link href="/super-admin" className={pathname === '/super-admin' ? 'active' : ''}><span className="nav-icon">⚙</span><span>Super Admin</span></Link>}
        {!role && <>
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}><span className="nav-icon">↪</span><span>Admin</span></Link>
          <Link href="/super-admin" className={pathname === '/super-admin' ? 'active' : ''}><span className="nav-icon">♙</span><span>Super Admin</span></Link>
        </>}
      </nav>
      <div className="nav-account">
        {role ? <>
          <div className="account-avatar">{initials}</div>
          <div className="account-copy"><strong>{userName || role.replace('_', ' ')}</strong><span>{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}</span></div>
          <button className="account-logout" type="button" onClick={() => void logout()} title="Keluar">↪</button>
        </> : <span className="account-guest">Local workspace</span>}
      </div>
    </div>
  );
}

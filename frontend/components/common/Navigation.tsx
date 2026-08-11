'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const items=[['/','Dashboard'],['/transactions','Transaksi'],['/events','Event']];
export default function Navigation(){const pathname=usePathname();return <nav className="nav" aria-label="Navigasi utama">{items.map(([href,label])=><Link key={href} href={href} className={pathname===href?'active':''}>{label}</Link>)}</nav>}

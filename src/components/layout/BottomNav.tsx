'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, GraduationCap, BookOpen, CalendarDays } from 'lucide-react';

const NAV = [
  { href: '/',          icon: LayoutDashboard, label: 'Inicio' },
  { href: '/tasks',     icon: CheckSquare,     label: 'Tareas' },
  { href: '/exams',     icon: GraduationCap,   label: 'Exámenes' },
  { href: '/subjects',  icon: BookOpen,        label: 'Materias' },
  { href: '/calendar',  icon: CalendarDays,    label: 'Calendario' },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 60,
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }} className="bottom-nav">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 3, padding: '8px 0',
            color: active ? 'var(--accent)' : 'var(--text-3)',
            textDecoration: 'none', fontSize: 9, fontWeight: active ? 700 : 500,
            transition: 'color 0.12s',
          }}>
            <Icon size={20} style={{ strokeWidth: active ? 2.5 : 1.8 }} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

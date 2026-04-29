'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CheckSquare, GraduationCap, BookOpen, CalendarDays, Settings, Zap, X } from 'lucide-react';

const NAV = [
  { href: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/tasks',     icon: CheckSquare,     label: 'Tareas' },
  { href: '/exams',     icon: GraduationCap,   label: 'Exámenes' },
  { href: '/subjects',  icon: BookOpen,        label: 'Materias' },
  { href: '/calendar',  icon: CalendarDays,    label: 'Calendario' },
  { href: '/settings',  icon: Settings,        label: 'Ajustes' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: Props) {
  const pathname = usePathname();

  return (
    <aside className={`sidebar-wrap${open ? ' open' : ''}`} style={{
      width: 220,
      minWidth: 220,
      background: '#111827',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Zap size={18} color="#818cf8" />
          <span style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>StudyMate</span>
        </div>
        {/* Close button — mobile only */}
        <button onClick={onClose} aria-label="Cerrar menú" style={{
          display: 'none',
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748b', lineHeight: 0, padding: 4,
        }} className="sidebar-close">
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 10px', borderRadius: 8,
              color: active ? '#f1f5f9' : '#64748b',
              background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
              fontSize: 14, fontWeight: active ? 600 : 400,
              textDecoration: 'none',
              transition: 'all 0.12s',
              position: 'relative',
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {active && (
                <div style={{ position: 'absolute', left: 0, top: '18%', height: '64%', width: 3, background: '#6366f1', borderRadius: '0 2px 2px 0' }} />
              )}
              <Icon size={16} style={{ color: active ? '#818cf8' : '#64748b', flexShrink: 0 }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 999,
          background: '#6366f1',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
        }}>M</div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Mateo González</div>
          <div style={{ fontSize: 10, color: '#475569' }}>Ingeniería · 4to año</div>
        </div>
      </div>
    </aside>
  );
}

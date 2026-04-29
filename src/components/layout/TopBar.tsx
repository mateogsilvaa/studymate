'use client';
import { useState } from 'react';
import { Search, Plus, Bell, Sun, Moon, Menu, ChevronDown } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useData } from '@/lib/store';
import QuickAddModal from '@/components/ui/QuickAddModal';
import NotificationsDropdown from '@/components/ui/NotificationsDropdown';

interface Props {
  onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: Props) {
  const { theme, toggle } = useTheme();
  const { unread }        = useData();
  const [addOpen,   setAddOpen]   = useState(false);
  const [bellOpen,  setBellOpen]  = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <>
      <header style={{
        height: 56,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 20px',
        position: 'sticky', top: 0, zIndex: 40,
        flexShrink: 0,
      }}>
        {/* Hamburger — mobile */}
        <button onClick={onMenuClick} aria-label="Abrir menú" style={{
          display: 'none',
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-2)', lineHeight: 0, padding: 4,
          flexShrink: 0,
        }} className="hamburger">
          <Menu size={20} />
        </button>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 380, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: 11, color: 'var(--text-3)', pointerEvents: 'none' }} />
          <input
            type="search"
            placeholder="Buscar tareas, exámenes, materias…"
            aria-label="Búsqueda global"
            style={{
              width: '100%', height: 34, paddingLeft: 33, paddingRight: 12,
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 13, color: 'var(--text-1)', outline: 'none',
            }}
          />
        </div>

        <div style={{ flex: 1 }} />

        {/* + Añadir */}
        <button
          onClick={() => setAddOpen(true)}
          aria-label="Añadir"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '0 14px', height: 34,
            background: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontSize: 13, fontWeight: 600, flexShrink: 0,
            transition: 'opacity 0.12s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={14} />
          <span>Añadir</span>
        </button>

        {/* Bell */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => { setBellOpen(o => !o); setAvatarOpen(false); }}
            aria-label="Notificaciones"
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'var(--bg-base)', border: '1px solid var(--border)',
              cursor: 'pointer', lineHeight: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-2)', position: 'relative',
            }}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                width: 7, height: 7, borderRadius: 999,
                background: 'var(--urgent)',
                border: '1.5px solid var(--bg-surface)',
              }} />
            )}
          </button>
          {bellOpen && <NotificationsDropdown onClose={() => setBellOpen(false)} />}
        </div>

        {/* Avatar / theme */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => { setAvatarOpen(o => !o); setBellOpen(false); }}
            aria-label="Perfil"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 999,
              background: '#6366f1',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 13,
            }}>M</div>
            <ChevronDown size={12} style={{ color: 'var(--text-3)' }} />
          </button>
          {avatarOpen && (
            <div className="anim-scale-up" style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 180, background: 'var(--bg-surface)',
              border: '1px solid var(--border)', borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              overflow: 'hidden', zIndex: 100,
            }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-1)' }}>Mateo González</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>mateogonsilva@gmail.com</div>
              </div>
              <button onClick={() => { toggle(); setAvatarOpen(false); }} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '10px 14px',
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: 'var(--text-1)', textAlign: 'left',
                transition: 'background 0.12s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-base)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                Modo {theme === 'dark' ? 'claro' : 'oscuro'}
              </button>
            </div>
          )}
        </div>
      </header>

      <QuickAddModal open={addOpen} onClose={() => setAddOpen(false)} />

      <style>{`
        @media (max-width: 767px) {
          .hamburger { display: flex !important; }
          .sidebar-close { display: flex !important; }
        }
      `}</style>
    </>
  );
}

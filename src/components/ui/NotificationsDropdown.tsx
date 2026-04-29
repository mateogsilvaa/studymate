'use client';
import { useEffect, useRef } from 'react';
import { Bell, AlertCircle, GraduationCap, Clock, Info, CheckCheck } from 'lucide-react';
import { useData } from '@/lib/store';
import type { Notification } from '@/lib/types';

const ICONS = { deadline: AlertCircle, exam: GraduationCap, reminder: Clock, system: Info };
const COLORS = { deadline: 'var(--urgent)', exam: 'var(--warning)', reminder: 'var(--accent)', system: 'var(--text-3)' };

interface Props { onClose: () => void }

export default function NotificationsDropdown({ onClose }: Props) {
  const { subjects, notifications, markAllRead } = useData();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    setTimeout(() => document.addEventListener('mousedown', handler), 10);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const sorted = [...notifications]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div ref={ref} className="anim-scale-up" style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 340, maxHeight: 420,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      overflow: 'hidden',
      zIndex: 100,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bell size={14} style={{ color: 'var(--text-2)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Notificaciones</span>
          {unread > 0 && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: 'var(--urgent)', color: '#fff' }}>
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500,
          }}>
            <CheckCheck size={12} />
            Marcar leídas
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
            Sin notificaciones
          </div>
        ) : sorted.map((n: Notification) => {
          const Icon = ICONS[n.type];
          const color = COLORS[n.type];
          const subj = n.subjectId ? subjects.find(s => s.id === n.subjectId) : null;
          return (
            <div key={n.id} style={{
              display: 'flex', gap: 10, padding: '10px 16px',
              borderBottom: '1px solid var(--border)',
              background: n.read ? 'transparent' : 'var(--accent-dim)',
              transition: 'background 0.12s',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 1,
              }}>
                <Icon size={14} style={{ color }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: n.read ? 500 : 700, color: 'var(--text-1)', lineHeight: 1.3 }}>
                  {n.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.4 }}>
                  {n.body}
                </div>
                {subj && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: 999, background: subj.color }} />
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{subj.name}</span>
                  </div>
                )}
              </div>
              {!n.read && (
                <div style={{ width: 7, height: 7, borderRadius: 999, background: 'var(--accent)', marginTop: 6, flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

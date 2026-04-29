'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useData } from '@/lib/store';
import Modal from '@/components/ui/Modal';
import EventForm from './EventForm';
import type { CalendarEvent } from '@/lib/types';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

const EVENT_COLORS: Record<string, string> = {
  class:     '#6366f1',
  tutoring:  '#10b981',
  reminder:  '#f59e0b',
  personal:  '#8b5cf6',
  other:     '#64748b',
};

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isoDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function CalendarView() {
  const { events, subjects, deleteEvent } = useData();
  const today = new Date();

  const [view,        setView]        = useState<'month' | 'week'>('month');
  const [cursor,      setCursor]      = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [formOpen,    setFormOpen]    = useState(false);
  const [editTarget,  setEditTarget]  = useState<CalendarEvent | null>(null);
  const [defaultDate, setDefaultDate] = useState('');

  /* ── Month helpers ─────────────────────────────────── */
  const year  = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstDay   = new Date(year, month, 1);
  const startDow   = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  /* ── Week helpers ──────────────────────────────────── */
  const weekStart = new Date(cursor);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // last Sunday
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d; });

  /* ── Navigation ────────────────────────────────────── */
  const prev = () => {
    if (view === 'month') setCursor(new Date(year, month - 1, 1));
    else { const d = new Date(cursor); d.setDate(d.getDate() - 7); setCursor(d); }
  };
  const next = () => {
    if (view === 'month') setCursor(new Date(year, month + 1, 1));
    else { const d = new Date(cursor); d.setDate(d.getDate() + 7); setCursor(d); }
  };
  const goToday = () => setCursor(view === 'month' ? new Date(today.getFullYear(), today.getMonth(), 1) : today);

  /* ── Event lookup ──────────────────────────────────── */
  function eventsForDay(d: Date) {
    return events.filter(ev => {
      const evDate = new Date(ev.startAt);
      return sameDay(evDate, d);
    });
  }

  /* ── Actions ───────────────────────────────────────── */
  function openCreate(date?: Date) {
    setEditTarget(null);
    setDefaultDate(date ? isoDate(date) : '');
    setFormOpen(true);
  }

  function openEdit(ev: CalendarEvent, e: React.MouseEvent) {
    e.stopPropagation();
    setEditTarget(ev);
    setDefaultDate('');
    setFormOpen(true);
  }

  /* ── Month view: day cell ───────────────────────────── */
  const DayCell = ({ d }: { d: Date | null }) => {
    if (!d) return <div style={{ background: 'var(--bg-base)', borderRadius: 8, minHeight: 80 }} />;
    const isToday = sameDay(d, today);
    const dayEvs  = eventsForDay(d);
    return (
      <div
        onClick={() => openCreate(d)}
        style={{
          background: isToday ? 'var(--accent-dim)' : 'var(--bg-surface)',
          border: `1px solid ${isToday ? 'var(--accent)44' : 'var(--border)'}`,
          borderRadius: 8, padding: '6px 8px', minHeight: 80, cursor: 'pointer',
          transition: 'background 0.12s',
        }}
        onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'var(--bg-base)'; }}
        onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = 'var(--bg-surface)'; }}
      >
        <div style={{
          fontSize: 12, fontWeight: isToday ? 700 : 500,
          color: isToday ? 'var(--accent)' : 'var(--text-2)', marginBottom: 4,
        }}>{d.getDate()}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {dayEvs.slice(0, 3).map(ev => {
            const subj = subjects.find(s => s.id === ev.subjectId);
            const color = subj?.color ?? EVENT_COLORS[ev.eventType] ?? '#64748b';
            return (
              <div key={ev.id} onClick={e => openEdit(ev, e)} style={{
                fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                background: color + '22', color, whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer',
              }}>{ev.title}</div>
            );
          })}
          {dayEvs.length > 3 && (
            <div style={{ fontSize: 9, color: 'var(--text-3)' }}>+{dayEvs.length - 3} más</div>
          )}
        </div>
      </div>
    );
  };

  /* ── Header title ───────────────────────────────────── */
  const headerTitle = view === 'month'
    ? `${MONTHS_ES[month]} ${year}`
    : `${MONTHS_ES[weekStart.getMonth()]} ${weekStart.getDate()} – ${MONTHS_ES[weekDays[6].getMonth()]} ${weekDays[6].getDate()}, ${weekDays[6].getFullYear()}`;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)', flex: 1 }}>Calendario</h1>

        <button onClick={goToday} style={{
          padding: '0 14px', height: 32, background: 'var(--bg-surface)',
          border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, color: 'var(--text-2)', cursor: 'pointer',
        }}>Hoy</button>

        <div style={{ display: 'flex', gap: 1 }}>
          {(['month','week'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '0 13px', height: 32,
              background: view === v ? 'var(--accent-dim)' : 'var(--bg-surface)',
              border: `1px solid ${view === v ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: v === 'month' ? '7px 0 0 7px' : '0 7px 7px 0',
              fontSize: 12, fontWeight: view === v ? 600 : 400,
              color: view === v ? 'var(--accent)' : 'var(--text-2)', cursor: 'pointer',
            }}>{v === 'month' ? 'Mes' : 'Semana'}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={prev} style={{ width: 32, height: 32, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', minWidth: 160, textAlign: 'center' }}>{headerTitle}</span>
          <button onClick={next} style={{ width: 32, height: 32, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)' }}>
            <ChevronRight size={15} />
          </button>
        </div>

        <button onClick={() => openCreate()} style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: 32,
          background: 'var(--accent)', border: 'none', borderRadius: 7, cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: '#fff',
        }}><Plus size={13} /> Evento</button>
      </div>

      {/* Month view */}
      {view === 'month' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
            {DAYS_ES.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-3)', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {cells.map((d, i) => <DayCell key={i} d={d} />)}
          </div>
        </div>
      )}

      {/* Week view */}
      {view === 'week' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 8 }}>
            {weekDays.map((d, i) => {
              const isToday = sameDay(d, today);
              const dayEvs  = eventsForDay(d);
              return (
                <div key={i} onClick={() => openCreate(d)} style={{ cursor: 'pointer' }}>
                  <div style={{ textAlign: 'center', marginBottom: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{DAYS_ES[d.getDay()]}</div>
                    <div style={{
                      width: 28, height: 28, borderRadius: 999, margin: '2px auto 0',
                      background: isToday ? 'var(--accent)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: isToday ? '#fff' : 'var(--text-2)',
                    }}>{d.getDate()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minHeight: 200 }}>
                    {dayEvs.map(ev => {
                      const subj  = subjects.find(s => s.id === ev.subjectId);
                      const color = subj?.color ?? EVENT_COLORS[ev.eventType] ?? '#64748b';
                      return (
                        <div key={ev.id} onClick={e => openEdit(ev, e)} style={{
                          padding: '6px 8px', borderRadius: 6,
                          background: color + '18', borderLeft: `3px solid ${color}`,
                          cursor: 'pointer',
                        }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color, marginBottom: 1 }}>{ev.title}</div>
                          {ev.subjectId && <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{subj?.name}</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event form modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Editar evento' : 'Nuevo evento'}>
        {editTarget ? (
          <div>
            <EventForm initial={editTarget} onDone={() => setFormOpen(false)} />
            <div style={{ padding: '0 20px 18px' }}>
              <button onClick={async () => { await deleteEvent(editTarget.id); setFormOpen(false); }} style={{
                width: '100%', height: 36, background: 'var(--urgent-dim)',
                border: '1px solid var(--urgent)44', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: 'var(--urgent)',
              }}>Eliminar evento</button>
            </div>
          </div>
        ) : (
          <EventForm defaultDate={defaultDate} onDone={() => setFormOpen(false)} />
        )}
      </Modal>
    </>
  );
}

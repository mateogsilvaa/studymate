'use client';
import { useData } from '@/lib/store';
import { getDaysUntil } from '@/lib/data';

const DAYS_ES = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];

function getWeek(): Date[] {
  const today = new Date();
  const dow = today.getDay(); // 0=Sun
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toISO(d: Date): string {
  return d.toISOString().split('T')[0];
}

export default function WeekStrip() {
  const { subjects, tasks, exams } = useData();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toISO(today);
  const week = getWeek();

  const dotsForDay = (dateStr: string) => {
    const dots: { color: string }[] = [];
    exams.filter(e => e.date === dateStr && e.status !== 'done').forEach(e => {
      const subj = subjects.find(s => s.id === e.subjectId);
      dots.push({ color: subj?.color ?? '#ef4444' });
    });
    tasks.filter(t => t.dueDate === dateStr && t.status !== 'completed').slice(0, 3).forEach(t => {
      const subj = subjects.find(s => s.id === t.subjectId);
      dots.push({ color: subj?.color ?? '#6366f1' });
    });
    return dots.slice(0, 4);
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Semana</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '12px 10px', gap: 4 }}>
        {week.map(day => {
          const dateStr = toISO(day);
          const isToday = dateStr === todayStr;
          const isPast  = day < today;
          const dots    = dotsForDay(dateStr);

          return (
            <div key={dateStr} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
              padding: '8px 4px',
              borderRadius: 8,
              background: isToday ? 'var(--accent-dim)' : 'transparent',
              border: isToday ? '1px solid var(--accent)44' : '1px solid transparent',
              opacity: isPast && !isToday ? 0.45 : 1,
            }}>
              {/* Day name */}
              <span style={{ fontSize: 10, fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--text-3)', textTransform: 'uppercase' }}>
                {DAYS_ES[day.getDay()]}
              </span>
              {/* Day number */}
              <div style={{
                width: 26, height: 26, borderRadius: 999,
                background: isToday ? 'var(--accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? '#fff' : 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                  {day.getDate()}
                </span>
              </div>
              {/* Event dots */}
              <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', minHeight: 10 }}>
                {dots.map((dot, i) => (
                  <div key={i} style={{ width: 5, height: 5, borderRadius: 999, background: dot.color }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

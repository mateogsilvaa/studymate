'use client';
import { useData } from '@/lib/store';
import { getDaysUntil, relativeDate, getUrgency, urgencyColor } from '@/lib/data';
import { CheckCircle2, Circle, Plus } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  essay: 'Ensayo', practice: 'Práctica', reading: 'Lectura',
  project: 'Proyecto', homework: 'Tarea', presentation: 'Presentación',
};

export default function WeeklyDeadlines() {
  const { subjects, tasks, toggleTask } = useData();

  const week = tasks
    .filter(t => {
      const d = getDaysUntil(t.dueDate);
      return t.status !== 'completed' && d >= -1 && d <= 7;
    })
    .sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate));

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: 12, overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Entregas esta semana</h2>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{week.length} pendiente{week.length !== 1 ? 's' : ''}</span>
      </div>

      {week.length === 0 ? (
        <div style={{ padding: '32px 18px', textAlign: 'center' }}>
          <CheckCircle2 size={28} style={{ color: 'var(--success)', margin: '0 auto 8px', display: 'block' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Estás al día esta semana</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 14 }}>Sin entregas pendientes en los próximos 7 días</p>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 14px', borderRadius: 8,
            background: 'var(--accent-dim)', border: '1px solid var(--accent)33',
            color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Plus size={13} />
            Añadir tarea
          </button>
        </div>
      ) : (
        <div>
          {week.map((task, i) => {
            const subj    = subjects.find(s => s.id === task.subjectId);
            const urgency = getUrgency(task.dueDate, task.status);
            const uColor  = urgencyColor(urgency);
            const rel     = relativeDate(task.dueDate);
            const done    = task.status === 'completed';

            return (
              <div
                key={task.id}
                className="anim-fade-up"
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '11px 18px',
                  borderBottom: i < week.length - 1 ? '1px solid var(--border)' : 'none',
                  borderLeft: `4px solid ${done ? 'transparent' : uColor}`,
                  transition: 'background 0.12s',
                  animationDelay: `${i * 25}ms`,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-base)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={done ? 'Marcar pendiente' : 'Marcar completada'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0, padding: 0, flexShrink: 0 }}
                >
                  {done
                    ? <CheckCircle2 size={18} style={{ color: 'var(--success)' }} />
                    : <Circle size={18} style={{ color: uColor }} />
                  }
                </button>

                {/* Subject dot */}
                <div style={{ width: 8, height: 8, borderRadius: 999, background: subj?.color ?? '#64748b', flexShrink: 0 }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: done ? 'var(--text-3)' : 'var(--text-1)',
                    textDecoration: done ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                    {subj?.name} · {TYPE_LABELS[task.type] ?? task.type}
                  </div>
                </div>

                {/* Relative date */}
                <span style={{ fontSize: 12, fontWeight: 700, color: uColor, flexShrink: 0 }}>
                  {rel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

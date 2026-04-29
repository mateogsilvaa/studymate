'use client';
import { useData } from '@/lib/store';
import { getDaysUntil, relativeDate } from '@/lib/data';

const DAYS_ES = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

function todayLabel(): string {
  const now = new Date();
  return `Hoy, ${DAYS_ES[now.getDay()]} ${now.getDate()} de ${MONTHS_ES[now.getMonth()]}`;
}

export default function ContextualSummary() {
  const { subjects, tasks, exams } = useData();

  const active = tasks.filter(t => t.status !== 'completed');
  const thisWeek = active.filter(t => {
    const d = getDaysUntil(t.dueDate);
    return d >= -1 && d <= 7;
  }).sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate));

  const overdue = active.filter(t => getDaysUntil(t.dueDate) < 0);
  const dueToday = active.filter(t => getDaysUntil(t.dueDate) === 0);
  const upcoming = active.filter(t => getDaysUntil(t.dueDate) > 0 && getDaysUntil(t.dueDate) <= 7);

  const nextExam = exams
    .filter(e => e.status !== 'done' && getDaysUntil(e.date) >= 0)
    .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))[0];

  const mostUrgent = thisWeek[0];
  const mostUrgentSubj = mostUrgent ? subjects.find(s => s.id === mostUrgent.subjectId) : null;
  const nextExamSubj  = nextExam  ? subjects.find(s => s.id === nextExam.subjectId)  : null;

  // Build the natural language message
  const parts: string[] = [];

  if (overdue.length > 0) {
    parts.push(`Tienes **${overdue.length} tarea${overdue.length > 1 ? 's' : ''} vencida${overdue.length > 1 ? 's' : ''}**.`);
  }

  if (dueToday.length > 0) {
    parts.push(`**${dueToday.length} entrega${dueToday.length > 1 ? 's' : ''} vence${dueToday.length > 1 ? 'n' : ''} hoy**.`);
  } else if (upcoming.length > 0) {
    parts.push(`Tienes **${upcoming.length} entrega${upcoming.length > 1 ? 's' : ''}** esta semana.`);
  } else if (overdue.length === 0) {
    parts.push('Esta semana estás **al día**.');
  }

  if (mostUrgent && getDaysUntil(mostUrgent.dueDate) >= 0) {
    const rel = relativeDate(mostUrgent.dueDate);
    parts.push(`La más urgente: **${mostUrgent.title}**, ${rel.toLowerCase()}.`);
  }

  if (nextExam) {
    const d = getDaysUntil(nextExam.date);
    const dStr = d === 0 ? 'hoy' : d === 1 ? 'mañana' : `en ${d} días`;
    parts.push(`Examen de **${nextExamSubj?.name ?? 'una materia'}** ${dStr}.`);
  }

  const message = parts.join(' ');

  // Detect urgency level for visual indicator
  const isUrgent = overdue.length > 0 || dueToday.length > 0;

  return (
    <div className="anim-fade-up" style={{
      background: 'var(--bg-surface)',
      border: `1px solid ${isUrgent ? 'var(--urgent)33' : 'var(--border)'}`,
      borderRadius: 12,
      padding: '18px 22px',
      display: 'flex', alignItems: 'flex-start', gap: 16,
    }}>
      {/* Urgency indicator */}
      {isUrgent && (
        <div style={{
          width: 4, borderRadius: 2, alignSelf: 'stretch',
          background: 'var(--urgent)', flexShrink: 0,
        }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
          {todayLabel()}
        </div>
        <p style={{ fontSize: 15, color: 'var(--text-1)', lineHeight: 1.6 }}>
          {/* Render markdown-ish bold */}
          {message.split(/\*\*(.+?)\*\*/g).map((chunk, i) =>
            i % 2 === 1
              ? <strong key={i} style={{ fontWeight: 700, color: isUrgent ? 'var(--urgent)' : 'var(--text-1)' }}>{chunk}</strong>
              : <span key={i}>{chunk}</span>
          )}
        </p>
      </div>
    </div>
  );
}

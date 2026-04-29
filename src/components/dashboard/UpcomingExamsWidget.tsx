'use client';
import { useData } from '@/lib/store';
import { getDaysUntil } from '@/lib/data';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function UpcomingExamsWidget() {
  const { subjects, exams } = useData();

  const upcoming = exams
    .filter(e => e.status !== 'done' && getDaysUntil(e.date) >= 0)
    .sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))
    .slice(0, 3);

  if (upcoming.length === 0) return null;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Exámenes próximos</h2>
        <Link href="/exams" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--accent)', fontWeight: 500 }}>
          Ver todos <ArrowRight size={11} />
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${upcoming.length}, 1fr)`, gap: 14 }}>
        {upcoming.map((exam, i) => {
          const subj  = subjects.find(s => s.id === exam.subjectId);
          const days  = getDaysUntil(exam.date);
          const done  = exam.checklistItems.filter(c => c.done).length;
          const total = exam.checklistItems.length;
          const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

          const countColor = days <= 2 ? 'var(--urgent)'
                           : days <= 5 ? 'var(--warning)'
                           : 'var(--text-1)';

          return (
            <div key={exam.id} className="anim-fade-up" style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${days <= 2 ? 'var(--urgent)33' : 'var(--border)'}`,
              borderRadius: 12, padding: '18px 20px',
              animationDelay: `${i * 40}ms`,
              borderTop: `3px solid ${subj?.color ?? 'var(--border)'}`,
            }}>
              {/* Countdown */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <span style={{ fontSize: 40, fontWeight: 900, lineHeight: 1, color: countColor, fontVariantNumeric: 'tabular-nums' }}>
                  {days}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 500 }}>
                  {days === 1 ? 'día' : 'días'}
                </span>
              </div>

              {/* Title */}
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3, lineHeight: 1.3 }}>
                {exam.title}
              </div>

              {/* Subject */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12 }}>
                <div style={{ width: 7, height: 7, borderRadius: 999, background: subj?.color ?? '#64748b', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{subj?.name} · {exam.weight}%</span>
              </div>

              {/* Preparation progress */}
              {total > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Preparación</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--urgent)',
                      borderRadius: 999, transition: 'width 0.4s ease',
                    }} />
                  </div>
                </>
              )}
              {total === 0 && (
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Sin checklist de preparación</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useData } from '@/lib/store';
import { getDaysUntil, shortDate } from '@/lib/data';
import Modal from '@/components/ui/Modal';
import ExamForm from '@/components/exams/ExamForm';
import { GraduationCap, BookOpen, ChevronDown, CheckCircle2, Circle, Plus, Trash2, Pencil } from 'lucide-react';

const STATUS_LABELS = { upcoming:'Próximo', studying:'Estudiando', ready:'Listo', done:'Completado' };
const STATUS_COLORS = { upcoming:'var(--warning)', studying:'var(--accent)', ready:'var(--success)', done:'var(--text-3)' };

export default function ExamsPage() {
  const { subjects, exams, toggleChecklistItem, deleteExam } = useData();
  const [expanded,   setExpanded]   = useState<string | null>(exams[0]?.id ?? null);
  const [formOpen,   setFormOpen]   = useState(false);
  const [editExam,   setEditExam]   = useState<string | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const editTarget = editExam ? exams.find(e => e.id === editExam) : undefined;

  const sorted = [...exams].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1;
    if (b.status === 'done' && a.status !== 'done') return -1;
    return getDaysUntil(a.date) - getDaysUntil(b.date);
  });

  return (
    <AppShell>
      <div style={{ maxWidth: 820 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>Exámenes</h1>
          <button onClick={() => { setEditExam(null); setFormOpen(true); }} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: 34,
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
          }}><Plus size={14} /> Nuevo</button>
        </div>

        {sorted.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <GraduationCap size={36} style={{ color: 'var(--text-3)', margin: '0 auto 10px', display: 'block' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Sin exámenes registrados</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Añade tu primer examen para empezar a prepararte</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map((exam, i) => {
            const subj  = subjects.find(s => s.id === exam.subjectId);
            const days  = getDaysUntil(exam.date);
            const done  = exam.checklistItems.filter(c => c.done).length;
            const total = exam.checklistItems.length;
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
            const isOpen = expanded === exam.id;

            const countColor = exam.status === 'done' ? 'var(--text-3)'
                             : days <= 2 ? 'var(--urgent)'
                             : days <= 5 ? 'var(--warning)'
                             : 'var(--text-1)';

            return (
              <div key={exam.id} className="anim-fade-up" style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderTop: `3px solid ${subj?.color ?? 'var(--border)'}`,
                borderRadius: 12, overflow: 'hidden',
                animationDelay: `${i * 40}ms`, opacity: exam.status === 'done' ? 0.65 : 1,
              }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-base)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {/* Countdown */}
                  <div style={{ textAlign: 'center', minWidth: 56, flexShrink: 0, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : exam.id)}>
                    {exam.status !== 'done' ? (
                      <>
                        <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1, color: countColor, fontVariantNumeric: 'tabular-nums' }}>
                          {days === 0 ? '!' : days < 0 ? '✗' : days}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>
                          {days === 0 ? 'hoy' : days < 0 ? 'vencido' : days === 1 ? 'día' : 'días'}
                        </div>
                      </>
                    ) : (
                      <CheckCircle2 size={28} style={{ color: 'var(--success)' }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : exam.id)}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', marginBottom: 3 }}>{exam.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {subj?.name} · {shortDate(exam.date)} · Peso {exam.weight}%
                    </div>
                  </div>

                  {/* Status + progress */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: STATUS_COLORS[exam.status], marginBottom: 4 }}>
                      {STATUS_LABELS[exam.status]}
                    </div>
                    {total > 0 && <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{pct}% listo</div>}
                  </div>

                  {/* Edit + delete */}
                  <button onClick={() => { setEditExam(exam.id); setFormOpen(true); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', lineHeight: 0,
                    transition: 'color 0.12s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => setDelConfirm(exam.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', lineHeight: 0,
                    transition: 'color 0.12s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--urgent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                    <Trash2 size={13} />
                  </button>

                  <ChevronDown onClick={() => setExpanded(isOpen ? null : exam.id)} size={14} style={{ color: 'var(--text-3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s', flexShrink: 0, cursor: 'pointer' }} />
                </div>

                {/* Expanded */}
                {isOpen && (
                  <div className="anim-fade-in" style={{
                    borderTop: '1px solid var(--border)', padding: '18px 20px',
                    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
                  }}>
                    {/* Topics */}
                    <div>
                      <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Temario</h4>
                      {exam.topics.length === 0
                        ? <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin temas añadidos</p>
                        : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {exam.topics.map((topic, ti) => (
                              <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BookOpen size={12} style={{ color: subj?.color ?? 'var(--accent)', flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: 'var(--text-1)' }}>{topic}</span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>

                    {/* Checklist */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Preparación</h4>
                        {total > 0 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{done}/{total}</span>}
                      </div>
                      {total > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--urgent)', borderRadius: 999, transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      )}
                      {exam.checklistItems.length === 0
                        ? <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin checklist</p>
                        : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                            {exam.checklistItems.map(item => (
                              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={() => toggleChecklistItem(exam.id, item.id)}>
                                {item.done
                                  ? <CheckCircle2 size={14} style={{ color: 'var(--success)', flexShrink: 0 }} />
                                  : <Circle size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                                }
                                <span style={{ fontSize: 12, color: item.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: item.done ? 'line-through' : 'none' }}>
                                  {item.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Editar examen' : 'Nuevo examen'}>
        <ExamForm key={editExam ?? 'new'} initial={editTarget} onDone={() => setFormOpen(false)} />
      </Modal>

      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="Eliminar examen" width={360}>
        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>¿Eliminar este examen? Esta acción no se puede deshacer.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDelConfirm(null)} style={{ padding: '0 16px', height: 36, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>Cancelar</button>
            <button onClick={async () => { if (delConfirm) { await deleteExam(delConfirm); setDelConfirm(null); } }} style={{ padding: '0 20px', height: 36, background: 'var(--urgent)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600 }}>Eliminar</button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

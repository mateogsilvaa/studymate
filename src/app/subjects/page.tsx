'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useData } from '@/lib/store';
import { getDaysUntil, relativeDate, shortDate } from '@/lib/data';
import Modal from '@/components/ui/Modal';
import SubjectForm from '@/components/subjects/SubjectForm';
import { User, Clock, BookOpen, Plus, Pencil, Trash2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function SubjectsPage() {
  const { subjects, tasks, exams, deleteSubject } = useData();
  const [formOpen, setFormOpen]   = useState(false);
  const [editSubj, setEditSubj]   = useState<string | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const editTarget = editSubj ? subjects.find(s => s.id === editSubj) : undefined;

  return (
    <AppShell>
      <div style={{ maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>Materias</h1>
          <button onClick={() => { setEditSubj(null); setFormOpen(true); }} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: 34,
            background: 'var(--accent)', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
          }}>
            <Plus size={14} /> Nueva materia
          </button>
        </div>

        {subjects.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <BookOpen size={36} style={{ color: 'var(--text-3)', margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', marginBottom: 4 }}>Sin materias registradas</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Añade tu primera materia para empezar</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {subjects.map((subj) => {
            const subjTasks  = tasks.filter(t => t.subjectId === subj.id);
            const pending    = subjTasks.filter(t => t.status !== 'completed').length;
            const subjExams  = exams.filter(e => e.subjectId === subj.id);
            const nextExam   = subjExams.filter(e => e.status !== 'done').sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))[0];
            const nextTask   = subjTasks.filter(t => t.status !== 'completed').sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate))[0];

            return (
              <div key={subj.id} className="anim-fade-up" style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderTop: `4px solid ${subj.color}`, borderRadius: 12, overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
              }}>
                <div style={{ padding: '16px 16px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', lineHeight: 1.3 }}>{subj.name}</h2>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => { setEditSubj(subj.id); setFormOpen(true); }} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', lineHeight: 0, borderRadius: 4,
                        transition: 'color 0.12s, background 0.12s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-1)'; e.currentTarget.style.background = 'var(--bg-base)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setDelConfirm(subj.id)} style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)', lineHeight: 0, borderRadius: 4,
                        transition: 'color 0.12s, background 0.12s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--urgent)'; e.currentTarget.style.background = 'var(--urgent-dim)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                    {subj.professor && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{subj.professor}</span>
                      </div>
                    )}
                    {subj.schedule && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{subj.schedule}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <BookOpen size={11} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{subj.credits} créditos</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    {[
                      { label: 'Pendientes', val: pending, color: subj.color },
                      { label: 'Exámenes', val: subjExams.length, color: 'var(--warning)' },
                    ].map(({ label, val, color }) => (
                      <div key={label}>
                        <div style={{ fontSize: 20, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Progreso</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: subj.color }}>{subj.progress}%</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${subj.progress}%`, background: subj.color, borderRadius: 999, transition: 'width 0.5s' }} />
                    </div>
                  </div>

                  {(nextTask || nextExam) && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {nextTask && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          Entrega: <span style={{ fontWeight: 600, color: getDaysUntil(nextTask.dueDate) <= 1 ? 'var(--urgent)' : 'var(--text-2)' }}>{relativeDate(nextTask.dueDate)}</span>
                        </div>
                      )}
                      {nextExam && (
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          Examen: <span style={{ fontWeight: 600, color: getDaysUntil(nextExam.date) <= 3 ? 'var(--urgent)' : 'var(--warning)' }}>{shortDate(nextExam.date)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Link href={`/subjects/${subj.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 16px', borderTop: '1px solid var(--border)',
                  color: 'var(--text-3)', fontSize: 11, fontWeight: 600, textDecoration: 'none',
                  transition: 'background 0.12s, color 0.12s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-base)'; e.currentTarget.style.color = 'var(--text-1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}>
                  Ver detalle <ChevronRight size={11} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create/Edit modal */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Editar materia' : 'Nueva materia'}>
        <SubjectForm key={editSubj ?? 'new'} initial={editTarget} onDone={() => setFormOpen(false)} />
      </Modal>

      {/* Delete confirm modal */}
      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="Eliminar materia" width={380}>
        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16, lineHeight: 1.5 }}>
            Esta acción eliminará la materia y <strong>todas sus tareas, exámenes y temas</strong>. No se puede deshacer.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDelConfirm(null)} style={{
              padding: '0 16px', height: 36, background: 'var(--bg-base)',
              border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)',
            }}>Cancelar</button>
            <button onClick={async () => { if (delConfirm) { await deleteSubject(delConfirm); setDelConfirm(null); } }} style={{
              padding: '0 20px', height: 36, background: 'var(--urgent)', border: 'none',
              borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600,
            }}>Eliminar</button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

'use client';
import { use, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useData } from '@/lib/store';
import { getDaysUntil, relativeDate, shortDate } from '@/lib/data';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/tasks/TaskForm';
import ExamForm from '@/components/exams/ExamForm';
import { User, Clock, BookOpen, CheckCircle2, Circle, Plus, Trash2, ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import type { Topic } from '@/lib/types';

export default function SubjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { subjects, tasks, exams, topics, addTopic, updateTopic, deleteTopic, toggleTopic, toggleTask, toggleChecklistItem } = useData();

  const subj      = subjects.find(s => s.id === id);
  const subjTasks = tasks.filter(t => t.subjectId === id);
  const subjExams = exams.filter(e => e.subjectId === id);
  const subjTopics = topics.filter(t => t.subjectId === id).sort((a, b) => a.position - b.position);

  const pending  = subjTasks.filter(t => t.status !== 'completed');
  const done     = subjTasks.filter(t => t.status === 'completed');
  const nextTask = [...pending].sort((a, b) => getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate))[0];
  const nextExam = subjExams.filter(e => e.status !== 'done').sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date))[0];

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [examFormOpen, setExamFormOpen] = useState(false);
  const [newTopic, setNewTopic]         = useState('');
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  if (!subj) {
    return (
      <AppShell>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-3)', fontSize: 14 }}>Materia no encontrada.</p>
          <Link href="/subjects" style={{ color: 'var(--accent)', fontSize: 13, display: 'inline-block', marginTop: 12 }}>← Volver a materias</Link>
        </div>
      </AppShell>
    );
  }

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    addTopic(id, newTopic.trim());
    setNewTopic('');
  };

  return (
    <AppShell>
      <div style={{ maxWidth: 900 }}>
        {/* Back */}
        <Link href="/subjects" style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--text-3)',
          fontSize: 12, marginBottom: 16, transition: 'color 0.12s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
          <ArrowLeft size={12} /> Materias
        </Link>

        {/* Header */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderTop: `4px solid ${subj.color}`, borderRadius: 12, padding: '20px 22px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-1)' }}>{subj.name}</h1>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setTaskFormOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 32,
                background: 'var(--accent-dim)', border: '1px solid var(--accent)33',
                borderRadius: 7, fontSize: 12, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer',
              }}><Plus size={12} /> Tarea</button>
              <button onClick={() => setExamFormOpen(true)} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '0 12px', height: 32,
                background: 'var(--warning-dim)', border: '1px solid var(--warning)33',
                borderRadius: 7, fontSize: 12, fontWeight: 600, color: 'var(--warning)', cursor: 'pointer',
              }}><Plus size={12} /> Examen</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
            {subj.professor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={12} style={{ color: 'var(--text-3)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{subj.professor}</span>
              </div>
            )}
            {subj.schedule && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={12} style={{ color: 'var(--text-3)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{subj.schedule}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={12} style={{ color: 'var(--text-3)' }} />
              <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{subj.credits} créditos</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 14 }}>
            {[
              { label: 'Pendientes', val: pending.length, color: subj.color },
              { label: 'Completadas', val: done.length, color: 'var(--success)' },
              { label: 'Exámenes', val: subjExams.length, color: 'var(--warning)' },
              { label: 'Temas', val: subjTopics.length, color: 'var(--text-2)' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div style={{ fontSize: 24, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 11, color: 'var(--text-2)' }}>Progreso del curso</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: subj.color }}>{subj.progress}%</span>
            </div>
            <div style={{ height: 7, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${subj.progress}%`, background: subj.color, borderRadius: 999, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Topics */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Temario ({subjTopics.length})</h3>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{subjTopics.filter(t => t.completed).length}/{subjTopics.length}</span>
            </div>
            {subjTopics.length === 0 && <p style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-3)' }}>Sin temas añadidos</p>}
            <div>
              {subjTopics.map((topic: Topic) => (
                <div key={topic.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 16px', borderBottom: '1px solid var(--border)',
                }}>
                  <button onClick={() => toggleTopic(topic.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0, padding: 0, flexShrink: 0,
                  }}>
                    {topic.completed
                      ? <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                      : <Circle size={15} style={{ color: 'var(--text-3)' }} />
                    }
                  </button>
                  <span style={{ flex: 1, fontSize: 12, color: topic.completed ? 'var(--text-3)' : 'var(--text-1)', textDecoration: topic.completed ? 'line-through' : 'none' }}>
                    {topic.title}
                  </span>
                  <button onClick={() => deleteTopic(topic.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-3)',
                    opacity: 0, transition: 'opacity 0.12s', lineHeight: 0,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = 'var(--urgent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = 'var(--text-3)'; }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTopic} style={{ padding: '10px 16px', display: 'flex', gap: 8 }}>
              <input value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Añadir tema…"
                style={{
                  flex: 1, height: 32, padding: '0 10px',
                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                  borderRadius: 7, fontSize: 12, color: 'var(--text-1)', outline: 'none',
                }} />
              <button type="submit" style={{
                width: 32, height: 32, background: 'var(--accent-dim)', border: '1px solid var(--accent)33',
                borderRadius: 7, cursor: 'pointer', color: 'var(--accent)', lineHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><Plus size={13} /></button>
            </form>
          </div>

          {/* Next events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Próxima entrega</div>
              {nextTask ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{nextTask.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: getDaysUntil(nextTask.dueDate) <= 1 ? 'var(--urgent)' : 'var(--warning)' }}>
                    {relativeDate(nextTask.dueDate)}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin entregas pendientes</p>
              )}
            </div>
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Próximo examen</div>
              {nextExam ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)', marginBottom: 3 }}>{nextExam.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: getDaysUntil(nextExam.date) <= 3 ? 'var(--urgent)' : 'var(--warning)' }}>
                    {getDaysUntil(nextExam.date) === 0 ? 'Hoy' : `${getDaysUntil(nextExam.date)} días`} · {shortDate(nextExam.date)}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Sin exámenes próximos</p>
              )}
            </div>
          </div>
        </div>

        {/* Task list */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginTop: 16 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Tareas ({subjTasks.length})</h3>
          </div>
          {subjTasks.length === 0 ? (
            <p style={{ padding: 16, fontSize: 12, color: 'var(--text-3)' }}>Sin tareas en esta materia</p>
          ) : (
            <div>
              {subjTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                  <button onClick={() => toggleTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0, padding: 0, flexShrink: 0 }}>
                    {t.status === 'completed'
                      ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />
                      : <Circle size={14} style={{ color: 'var(--text-3)' }} />}
                  </button>
                  <span style={{ flex: 1, fontSize: 12, color: t.status === 'completed' ? 'var(--text-3)' : 'var(--text-1)', textDecoration: t.status === 'completed' ? 'line-through' : 'none' }}>
                    {t.title}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{shortDate(t.dueDate)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exams list */}
        {subjExams.length > 0 && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginTop: 16 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)' }}>Exámenes ({subjExams.length})</h3>
            </div>
            {subjExams.map(exam => {
              const days   = getDaysUntil(exam.date);
              const isOpen = expandedExam === exam.id;
              return (
                <div key={exam.id}>
                  <div onClick={() => setExpandedExam(isOpen ? null : exam.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: exam.status === 'done' ? 'var(--success)' : days <= 3 ? 'var(--urgent)' : 'var(--text-2)', minWidth: 36, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                      {exam.status === 'done' ? '✓' : days < 0 ? '✗' : days}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{exam.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{shortDate(exam.date)} · {exam.weight}%</div>
                    </div>
                    <ChevronDown size={13} style={{ color: 'var(--text-3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
                  </div>
                  {isOpen && exam.checklistItems.length > 0 && (
                    <div style={{ padding: '10px 16px 14px', borderBottom: '1px solid var(--border)', paddingLeft: 64 }}>
                      {exam.checklistItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '3px 0' }}
                          onClick={() => toggleChecklistItem(exam.id, item.id)}>
                          {item.done ? <CheckCircle2 size={13} style={{ color: 'var(--success)' }} /> : <Circle size={13} style={{ color: 'var(--text-3)' }} />}
                          <span style={{ fontSize: 12, color: item.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={taskFormOpen} onClose={() => setTaskFormOpen(false)} title="Nueva tarea">
        <TaskForm defaultSubjectId={id} onDone={() => setTaskFormOpen(false)} />
      </Modal>
      <Modal open={examFormOpen} onClose={() => setExamFormOpen(false)} title="Nuevo examen">
        <ExamForm defaultSubjectId={id} onDone={() => setExamFormOpen(false)} />
      </Modal>
    </AppShell>
  );
}

'use client';
import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useData } from '@/lib/store';
import { getDaysUntil, relativeDate, getUrgency, urgencyColor } from '@/lib/data';
import type { TaskStatus, Priority } from '@/lib/types';
import Modal from '@/components/ui/Modal';
import TaskForm from '@/components/tasks/TaskForm';
import { CheckCircle2, Circle, ChevronDown, AlertCircle, Plus, Trash2, Pencil } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  essay:'Ensayo', practice:'Práctica', reading:'Lectura',
  project:'Proyecto', homework:'Tarea', presentation:'Presentación',
};
const STATUS_LABELS: Record<TaskStatus, string> = {
  pending:'Pendiente', in_progress:'En progreso', completed:'Completada', overdue:'Vencida',
};

export default function TasksPage() {
  const { subjects, tasks, toggleTask, deleteTask } = useData();
  const [fSubject,  setFSubject]  = useState('all');
  const [fPriority, setFPriority] = useState('all');
  const [fStatus,   setFStatus]   = useState('all');
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [formOpen,  setFormOpen]  = useState(false);
  const [editTask,  setEditTask]  = useState<string | null>(null);
  const [delConfirm, setDelConfirm] = useState<string | null>(null);

  const editTarget = editTask ? tasks.find(t => t.id === editTask) : undefined;

  const filtered = tasks.filter(t => {
    if (fSubject  !== 'all' && t.subjectId !== fSubject)  return false;
    if (fPriority !== 'all' && t.priority  !== fPriority) return false;
    if (fStatus   !== 'all' && t.status    !== fStatus)   return false;
    return true;
  }).sort((a, b) => {
    if (a.status === 'completed' && b.status !== 'completed') return 1;
    if (b.status === 'completed' && a.status !== 'completed') return -1;
    return getDaysUntil(a.dueDate) - getDaysUntil(b.dueDate);
  });

  const selectStyle = (active: boolean) => ({
    height: 32, padding: '0 10px',
    background: active ? 'var(--accent-dim)' : 'var(--bg-surface)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 7, fontSize: 12,
    color: active ? 'var(--accent)' : 'var(--text-2)',
    cursor: 'pointer', outline: 'none',
  } as const);

  return (
    <AppShell>
      <div style={{ maxWidth: 860 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-1)' }}>Tareas</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setEditTask(null); setFormOpen(true); }} style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '0 14px', height: 34,
              background: 'var(--accent)', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#fff',
            }}>
              <Plus size={14} /> Nueva
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <select value={fSubject} onChange={e => setFSubject(e.target.value)} style={selectStyle(fSubject !== 'all')}>
            <option value="all">Todas las materias</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={fPriority} onChange={e => setFPriority(e.target.value)} style={selectStyle(fPriority !== 'all')}>
            <option value="all">Toda prioridad</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
          <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={selectStyle(fStatus !== 'all')}>
            <option value="all">Todo estado</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="overdue">Vencida</option>
            <option value="completed">Completada</option>
          </select>
          {(fSubject !== 'all' || fPriority !== 'all' || fStatus !== 'all') && (
            <button onClick={() => { setFSubject('all'); setFPriority('all'); setFStatus('all'); }}
              style={{ height: 32, padding: '0 12px', background: 'none', border: '1px solid var(--border)', borderRadius: 7, fontSize: 12, color: 'var(--text-3)', cursor: 'pointer' }}>
              Limpiar
            </button>
          )}
        </div>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--text-3)', margin: '0 auto 10px', display: 'block' }} />
              <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Sin tareas con esos filtros</p>
            </div>
          )}

          {filtered.map((task, i) => {
            const subj    = subjects.find(s => s.id === task.subjectId);
            const urgency = getUrgency(task.dueDate, task.status);
            const uColor  = urgencyColor(urgency);
            const isOpen  = expanded === task.id;
            const done    = task.status === 'completed';
            const subtasksDone = task.subtasks.filter(st => st.done).length;

            return (
              <div key={task.id} className="anim-fade-up" style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${done ? 'transparent' : uColor}`,
                borderRadius: 10, overflow: 'hidden',
                animationDelay: `${i * 20}ms`,
              }}>
                {/* Main row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-base)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  {/* Checkbox */}
                  <button onClick={() => toggleTask(task.id)} aria-label={done ? 'Marcar pendiente' : 'Marcar completada'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0, padding: 0, flexShrink: 0 }}>
                    {done
                      ? <CheckCircle2 size={17} style={{ color: 'var(--success)' }} />
                      : urgency === 'overdue'
                      ? <AlertCircle size={17} style={{ color: 'var(--urgent)' }} />
                      : <Circle size={17} style={{ color: uColor }} />
                    }
                  </button>

                  {/* Subject dot */}
                  <div style={{ width: 8, height: 8, borderRadius: 999, background: subj?.color ?? '#64748b', flexShrink: 0 }} />

                  {/* Title + meta — clickable to expand */}
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : task.id)}>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: done ? 'var(--text-3)' : 'var(--text-1)',
                      textDecoration: done ? 'line-through' : 'none',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                      {subj?.name} · {TYPE_LABELS[task.type] ?? task.type}
                      {task.subtasks.length > 0 && ` · ${subtasksDone}/${task.subtasks.length}`}
                    </div>
                  </div>

                  {/* Priority pill */}
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, flexShrink: 0,
                    background: task.priority === 'high' ? 'var(--urgent-dim)' : task.priority === 'medium' ? 'var(--warning-dim)' : 'var(--success-dim)',
                    color: task.priority === 'high' ? 'var(--urgent)' : task.priority === 'medium' ? 'var(--warning)' : 'var(--success)',
                  }}>
                    {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  </span>

                  {/* Date */}
                  <span style={{ fontSize: 12, fontWeight: 700, color: done ? 'var(--text-3)' : uColor, flexShrink: 0, minWidth: 70, textAlign: 'right' }}>
                    {done ? STATUS_LABELS[task.status] : relativeDate(task.dueDate)}
                  </span>

                  {/* Edit + delete */}
                  <button onClick={() => { setEditTask(task.id); setFormOpen(true); }} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'var(--text-3)', lineHeight: 0, borderRadius: 4,
                    transition: 'color 0.12s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-1)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setDelConfirm(task.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'var(--text-3)', lineHeight: 0, borderRadius: 4,
                    transition: 'color 0.12s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--urgent)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
                    <Trash2 size={12} />
                  </button>

                  <ChevronDown onClick={() => setExpanded(isOpen ? null : task.id)} size={13} style={{ color: 'var(--text-3)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s', flexShrink: 0, cursor: 'pointer' }} />
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="anim-fade-in" style={{ borderTop: '1px solid var(--border)', padding: '12px 16px 14px', paddingLeft: 56 }}>
                    {task.note && (
                      <p style={{ fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic', marginBottom: 10 }}>{task.note}</p>
                    )}
                    {task.subtasks.length > 0 && (
                      <>
                        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 7 }}>Subtareas</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                          {task.subtasks.map(st => (
                            <div key={st.id} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              {st.done ? <CheckCircle2 size={13} style={{ color: 'var(--success)', flexShrink: 0 }} /> : <Circle size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
                              <span style={{ fontSize: 12, color: st.done ? 'var(--text-3)' : 'var(--text-1)', textDecoration: st.done ? 'line-through' : 'none' }}>{st.title}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editTarget ? 'Editar tarea' : 'Nueva tarea'}>
        <TaskForm key={editTask ?? 'new'} initial={editTarget} onDone={() => setFormOpen(false)} />
      </Modal>

      <Modal open={!!delConfirm} onClose={() => setDelConfirm(null)} title="Eliminar tarea" width={360}>
        <div style={{ padding: '18px 20px' }}>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>¿Eliminar esta tarea? Esta acción no se puede deshacer.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button onClick={() => setDelConfirm(null)} style={{ padding: '0 16px', height: 36, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)' }}>Cancelar</button>
            <button onClick={async () => { if (delConfirm) { await deleteTask(delConfirm); setDelConfirm(null); } }} style={{ padding: '0 20px', height: 36, background: 'var(--urgent)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600 }}>Eliminar</button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

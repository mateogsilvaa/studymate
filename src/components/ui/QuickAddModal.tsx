'use client';
import { useEffect, useRef, useState } from 'react';
import { X, CheckSquare, GraduationCap, Bell, Calendar } from 'lucide-react';
import { useData } from '@/lib/store';
import type { Priority, Task } from '@/lib/types';

const TYPES = [
  { key: 'task',     label: 'Nueva tarea',       icon: CheckSquare,   color: '#6366f1' },
  { key: 'exam',     label: 'Nuevo examen',       icon: GraduationCap, color: '#ef4444' },
  { key: 'reminder', label: 'Recordatorio',       icon: Bell,          color: '#f59e0b' },
  { key: 'event',    label: 'Evento académico',   icon: Calendar,      color: '#8b5cf6' },
] as const;

type TypeKey = (typeof TYPES)[number]['key'];

interface Props { open: boolean; onClose: () => void }

export default function QuickAddModal({ open, onClose }: Props) {
  const { subjects, addTask, addExam, addReminder } = useData();
  const [step, setStep]     = useState<'pick' | 'form' | 'done'>('pick');
  const [type, setType]     = useState<TypeKey>('task');
  const [title, setTitle]   = useState('');
  const [subjectId, setSubjectId] = useState(() => subjects[0]?.id ?? '');
  const [date, setDate]     = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setStep('pick'); setTitle(''); setDate(''); }
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const current = TYPES.find(t => t.key === type)!;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    if (type === 'task') {
      addTask({ title: title.trim(), subjectId, dueDate: date, priority, type: 'homework' as Task['type'] });
    } else if (type === 'exam') {
      addExam({ title: title.trim(), subjectId, date, weight: 20 });
    } else {
      addReminder({ title: title.trim(), date, subjectId });
    }
    setStep('done');
    setTimeout(() => { onClose(); }, 1200);
  };

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.50)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(3px)',
      }}
      role="dialog" aria-modal="true"
    >
      <div className="anim-scale-up" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        width: '100%', maxWidth: 460,
        margin: 16,
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)' }}>
            {step === 'pick' ? 'Añadir' : step === 'done' ? '¡Guardado!' : current.label}
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', lineHeight: 0, padding: 2 }} aria-label="Cerrar">
            <X size={17} />
          </button>
        </div>

        {/* Step: pick type */}
        {step === 'pick' && (
          <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {TYPES.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => { setType(key); setStep('form'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 14px',
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: 10, cursor: 'pointer',
                  fontSize: 13, fontWeight: 500, color: 'var(--text-1)',
                  transition: 'border-color 0.12s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = color; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <Icon size={16} style={{ color, flexShrink: 0 }} />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Step: form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Título *
              </label>
              <input
                autoFocus required
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder={`Título ${type === 'task' ? 'de la tarea' : type === 'exam' ? 'del examen' : ''}…`}
                style={{
                  width: '100%', height: 38, padding: '0 12px',
                  background: 'var(--bg-base)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 14, color: 'var(--text-1)', outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {(type === 'task' || type === 'exam' || type === 'reminder') && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                    Materia
                  </label>
                  <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{
                    width: '100%', height: 36, padding: '0 10px',
                    background: 'var(--bg-base)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13, color: 'var(--text-1)', outline: 'none', cursor: 'pointer',
                  }}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  Fecha *
                </label>
                <input
                  type="date" required
                  value={date} onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%', height: 36, padding: '0 10px',
                    background: 'var(--bg-base)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13, color: 'var(--text-1)', outline: 'none',
                  }}
                />
              </div>
            </div>

            {type === 'task' && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Prioridad
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {([['high', 'Alta', 'var(--urgent)'], ['medium', 'Media', 'var(--warning)'], ['low', 'Baja', 'var(--success)']] as const).map(([val, label, color]) => (
                    <label key={val} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '5px 12px',
                      border: `1px solid ${priority === val ? color : 'var(--border)'}`,
                      borderRadius: 7, cursor: 'pointer', fontSize: 12,
                      background: priority === val ? color + '18' : 'transparent',
                      color: priority === val ? color : 'var(--text-2)',
                      transition: 'all 0.12s',
                    }}>
                      <input type="radio" name="prio" value={val} checked={priority === val} onChange={() => setPriority(val)} style={{ display: 'none' }} />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 2 }}>
              <button type="button" onClick={() => setStep('pick')} style={{
                padding: '0 16px', height: 36,
                background: 'var(--bg-base)', border: '1px solid var(--border)',
                borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)',
              }}>
                Atrás
              </button>
              <button type="submit" style={{
                padding: '0 20px', height: 36,
                background: current.color, border: 'none',
                borderRadius: 8, cursor: 'pointer', color: '#fff',
                fontSize: 13, fontWeight: 600,
              }}>
                Guardar
              </button>
            </div>
          </form>
        )}

        {/* Step: done */}
        {step === 'done' && (
          <div style={{ padding: '30px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>✓</div>
            <p style={{ fontSize: 14, color: 'var(--text-2)' }}>"{title}" guardado</p>
          </div>
        )}
      </div>
    </div>
  );
}

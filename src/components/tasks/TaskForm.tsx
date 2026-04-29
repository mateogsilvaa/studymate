'use client';
import { useState } from 'react';
import { useData } from '@/lib/store';
import type { Task, Priority } from '@/lib/types';

interface Props {
  initial?: Task;
  defaultSubjectId?: string;
  onDone: () => void;
}

const TYPES: { key: Task['type']; label: string }[] = [
  { key: 'homework',     label: 'Tarea' },
  { key: 'essay',        label: 'Ensayo' },
  { key: 'practice',     label: 'Práctica' },
  { key: 'reading',      label: 'Lectura' },
  { key: 'project',      label: 'Proyecto' },
  { key: 'presentation', label: 'Presentación' },
];

export default function TaskForm({ initial, defaultSubjectId, onDone }: Props) {
  const { subjects, addTask, updateTask } = useData();
  const [title,     setTitle]     = useState(initial?.title     ?? '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? defaultSubjectId ?? (subjects[0]?.id ?? ''));
  const [dueDate,   setDueDate]   = useState(initial?.dueDate   ?? '');
  const [priority,  setPriority]  = useState<Priority>(initial?.priority ?? 'medium');
  const [type,      setType]      = useState<Task['type']>(initial?.type ?? 'homework');
  const [note,      setNote]      = useState(initial?.note      ?? '');
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;
    setSaving(true);
    if (initial) {
      await updateTask(initial.id, { title: title.trim(), subjectId, dueDate, priority, type, note });
    } else {
      await addTask({ title: title.trim(), subjectId, dueDate, priority, type, note });
    }
    setSaving(false);
    onDone();
  };

  const label = (text: string) => (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 5 }}>
      {text}
    </label>
  );

  const inputStyle = {
    width: '100%', height: 36, padding: '0 11px',
    background: 'var(--bg-base)', border: '1px solid var(--border)',
    borderRadius: 8, fontSize: 13, color: 'var(--text-1)', outline: 'none',
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        {label('Título *')}
        <input autoFocus required value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Título de la tarea…" style={inputStyle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          {label('Materia')}
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          {label('Fecha límite *')}
          <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          {label('Tipo')}
          <select value={type} onChange={e => setType(e.target.value as Task['type'])} style={{ ...inputStyle, cursor: 'pointer' }}>
            {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div>
          {label('Prioridad')}
          <div style={{ display: 'flex', gap: 6 }}>
            {([['high','Alta','var(--urgent)'],['medium','Media','var(--warning)'],['low','Baja','var(--success)']] as const).map(([val, lbl, color]) => (
              <button key={val} type="button" onClick={() => setPriority(val)} style={{
                flex: 1, height: 36, fontSize: 12, fontWeight: 500,
                background: priority === val ? color + '18' : 'var(--bg-base)',
                border: `1px solid ${priority === val ? color : 'var(--border)'}`,
                borderRadius: 7, cursor: 'pointer', color: priority === val ? color : 'var(--text-2)',
                transition: 'all 0.12s',
              }}>{lbl}</button>
            ))}
          </div>
        </div>
      </div>

      <div>
        {label('Nota (opcional)')}
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Detalles adicionales…"
          rows={2} style={{
            ...inputStyle, height: 'auto', padding: '8px 11px',
            resize: 'vertical', lineHeight: 1.5,
          }} />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 2 }}>
        <button type="button" onClick={onDone} style={{
          padding: '0 16px', height: 36, background: 'var(--bg-base)',
          border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)',
        }}>Cancelar</button>
        <button type="submit" disabled={saving} style={{
          padding: '0 20px', height: 36, background: 'var(--accent)', border: 'none',
          borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1,
        }}>{saving ? 'Guardando…' : initial ? 'Guardar' : 'Crear tarea'}</button>
      </div>
    </form>
  );
}

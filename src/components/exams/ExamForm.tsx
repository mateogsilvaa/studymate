'use client';
import { useState } from 'react';
import { useData } from '@/lib/store';
import type { Exam } from '@/lib/types';

interface Props {
  initial?: Exam;
  defaultSubjectId?: string;
  onDone: () => void;
}

export default function ExamForm({ initial, defaultSubjectId, onDone }: Props) {
  const { subjects, addExam, updateExam } = useData();
  const [title,     setTitle]     = useState(initial?.title  ?? '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId ?? defaultSubjectId ?? (subjects[0]?.id ?? ''));
  const [date,      setDate]      = useState(initial?.date   ?? '');
  const [weight,    setWeight]    = useState(initial?.weight ?? 20);
  const [status,    setStatus]    = useState<Exam['status']>(initial?.status ?? 'upcoming');
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    setSaving(true);
    if (initial) {
      await updateExam(initial.id, { title: title.trim(), date, weight, status });
    } else {
      await addExam({ title: title.trim(), subjectId, date, weight });
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

  const STATUS_OPTS: { key: Exam['status']; label: string }[] = [
    { key: 'upcoming',  label: 'Próximo' },
    { key: 'studying',  label: 'Estudiando' },
    { key: 'ready',     label: 'Listo' },
    { key: 'done',      label: 'Completado' },
  ];

  return (
    <form onSubmit={handleSubmit} style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div>
        {label('Título *')}
        <input autoFocus required value={title} onChange={e => setTitle(e.target.value)}
          placeholder="ej. Parcial 2 — Integrales" style={inputStyle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          {label('Materia')}
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}
            disabled={!!initial}>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          {label('Fecha *')}
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
        <div>
          {label('Peso %')}
          <input type="number" min={0} max={100} value={weight} onChange={e => setWeight(Number(e.target.value))} style={inputStyle} />
        </div>
        {initial && (
          <div>
            {label('Estado')}
            <select value={status} onChange={e => setStatus(e.target.value as Exam['status'])} style={{ ...inputStyle, cursor: 'pointer' }}>
              {STATUS_OPTS.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 2 }}>
        <button type="button" onClick={onDone} style={{
          padding: '0 16px', height: 36, background: 'var(--bg-base)',
          border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)',
        }}>Cancelar</button>
        <button type="submit" disabled={saving} style={{
          padding: '0 20px', height: 36, background: 'var(--accent)', border: 'none',
          borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600, opacity: saving ? 0.7 : 1,
        }}>{saving ? 'Guardando…' : initial ? 'Guardar' : 'Crear examen'}</button>
      </div>
    </form>
  );
}

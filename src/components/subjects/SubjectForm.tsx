'use client';
import { useState } from 'react';
import { useData } from '@/lib/store';
import type { Subject } from '@/lib/types';

const COLORS = ['#6366f1','#ef4444','#10b981','#f59e0b','#8b5cf6','#3b82f6','#ec4899','#14b8a6'];

interface Props {
  initial?: Subject;
  onDone: () => void;
}

export default function SubjectForm({ initial, onDone }: Props) {
  const { addSubject, updateSubject } = useData();
  const [name,      setName]      = useState(initial?.name      ?? '');
  const [color,     setColor]     = useState(initial?.color     ?? COLORS[0]);
  const [professor, setProfessor] = useState(initial?.professor ?? '');
  const [schedule,  setSchedule]  = useState(initial?.schedule  ?? '');
  const [credits,   setCredits]   = useState(initial?.credits   ?? 3);
  const [notes,     setNotes]     = useState(initial?.notes     ?? '');
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const payload = { name: name.trim(), color, professor, schedule, credits, notes };
    if (initial) {
      await updateSubject(initial.id, payload);
    } else {
      await addSubject(payload);
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
        {label('Nombre *')}
        <input autoFocus required value={name} onChange={e => setName(e.target.value)}
          placeholder="ej. Cálculo II" style={inputStyle} />
      </div>

      <div>
        {label('Color')}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)} style={{
              width: 28, height: 28, borderRadius: 999, background: c, border: 'none',
              cursor: 'pointer', outline: color === c ? `3px solid ${c}` : 'none',
              outlineOffset: 2, transition: 'outline 0.12s',
            }} aria-label={c} />
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          {label('Profesor')}
          <input value={professor} onChange={e => setProfessor(e.target.value)}
            placeholder="Dr. Ramírez" style={inputStyle} />
        </div>
        <div>
          {label('Horario')}
          <input value={schedule} onChange={e => setSchedule(e.target.value)}
            placeholder="L-M-V 8:00" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 12 }}>
        <div>
          {label('Créditos')}
          <input type="number" min={0} max={12} value={credits} onChange={e => setCredits(Number(e.target.value))} style={inputStyle} />
        </div>
        <div>
          {label('Notas')}
          <input value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Aula 204, material en Drive…" style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 2 }}>
        <button type="button" onClick={onDone} style={{
          padding: '0 16px', height: 36,
          background: 'var(--bg-base)', border: '1px solid var(--border)',
          borderRadius: 8, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)',
        }}>Cancelar</button>
        <button type="submit" disabled={saving} style={{
          padding: '0 20px', height: 36, background: color, border: 'none',
          borderRadius: 8, cursor: 'pointer', color: '#fff', fontSize: 13, fontWeight: 600,
          opacity: saving ? 0.7 : 1,
        }}>{saving ? 'Guardando…' : initial ? 'Guardar' : 'Crear materia'}</button>
      </div>
    </form>
  );
}

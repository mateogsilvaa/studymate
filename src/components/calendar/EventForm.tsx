'use client';
import { useState } from 'react';
import { useData } from '@/lib/store';
import type { CalendarEvent, EventType } from '@/lib/types';

interface Props {
  initial?: CalendarEvent;
  defaultDate?: string;
  onDone: () => void;
}

const EVENT_TYPES: { key: EventType; label: string }[] = [
  { key: 'class',     label: 'Clase' },
  { key: 'tutoring',  label: 'Tutoría' },
  { key: 'reminder',  label: 'Recordatorio' },
  { key: 'personal',  label: 'Personal' },
  { key: 'other',     label: 'Otro' },
];

export default function EventForm({ initial, defaultDate, onDone }: Props) {
  const { subjects, addEvent, updateEvent } = useData();
  const [title,     setTitle]     = useState(initial?.title       ?? '');
  const [subjectId, setSubjectId] = useState(initial?.subjectId   ?? '');
  const [eventType, setEventType] = useState<EventType>(initial?.eventType ?? 'reminder');
  const [startAt,   setStartAt]   = useState(initial?.startAt     ?? defaultDate ?? '');
  const [allDay,    setAllDay]    = useState(initial?.allDay      ?? true);
  const [desc,      setDesc]      = useState(initial?.description ?? '');
  const [saving,    setSaving]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startAt) return;
    setSaving(true);
    const payload: Omit<CalendarEvent, 'id'> = {
      title: title.trim(),
      subjectId: subjectId || undefined,
      eventType, startAt, allDay,
      description: desc || undefined,
    };
    if (initial) {
      await updateEvent(initial.id, payload);
    } else {
      await addEvent(payload);
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
          placeholder="ej. Clase de Cálculo" style={inputStyle} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          {label('Tipo')}
          <select value={eventType} onChange={e => setEventType(e.target.value as EventType)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div>
          {label('Materia (opcional)')}
          <select value={subjectId} onChange={e => setSubjectId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Sin materia</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
        <div>
          {label('Fecha *')}
          <input type={allDay ? 'date' : 'datetime-local'} required value={startAt}
            onChange={e => setStartAt(e.target.value)} style={inputStyle} />
        </div>
        <div style={{ paddingBottom: 1 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, color: 'var(--text-2)', whiteSpace: 'nowrap', height: 36 }}>
            <input type="checkbox" checked={allDay} onChange={e => setAllDay(e.target.checked)} />
            Todo el día
          </label>
        </div>
      </div>

      <div>
        {label('Descripción (opcional)')}
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          placeholder="Detalles del evento…" rows={2} style={{
            ...inputStyle, height: 'auto', padding: '8px 11px', resize: 'vertical', lineHeight: 1.5,
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
        }}>{saving ? 'Guardando…' : initial ? 'Guardar' : 'Crear evento'}</button>
      </div>
    </form>
  );
}

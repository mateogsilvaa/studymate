import { supabase } from '@/lib/supabase/client';
import type { CalendarEvent } from '@/lib/types';

type DbEvent = {
  id: string; user_id: string | null; subject_id: string | null;
  title: string; description: string | null; event_type: string;
  start_at: string; end_at: string | null; all_day: boolean;
  created_at: string; updated_at: string;
};

function toApp(row: DbEvent): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id ?? undefined,
    description: row.description ?? undefined,
    eventType: row.event_type as CalendarEvent['eventType'],
    startAt: row.start_at,
    endAt: row.end_at ?? undefined,
    allDay: row.all_day,
  };
}

export async function fetchEventsFromDb(): Promise<CalendarEvent[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('calendar_events').select('*').order('start_at');
  return (data ?? []).map(toApp);
}

export async function createEventInDb(input: Omit<CalendarEvent, 'id'>): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('calendar_events').insert({
    title: input.title,
    subject_id: input.subjectId || null,
    description: input.description || null,
    event_type: input.eventType,
    start_at: input.startAt,
    end_at: input.endAt || null,
    all_day: input.allDay,
  }).select('id').single();
  return data?.id ?? null;
}

export async function updateEventInDb(id: string, input: Partial<Omit<CalendarEvent, 'id'>>): Promise<void> {
  if (!supabase) return;
  await supabase.from('calendar_events').update({
    ...(input.title       !== undefined && { title: input.title }),
    ...(input.subjectId   !== undefined && { subject_id: input.subjectId || null }),
    ...(input.description !== undefined && { description: input.description || null }),
    ...(input.eventType   !== undefined && { event_type: input.eventType }),
    ...(input.startAt     !== undefined && { start_at: input.startAt }),
    ...(input.endAt       !== undefined && { end_at: input.endAt || null }),
    ...(input.allDay      !== undefined && { all_day: input.allDay }),
  }).eq('id', id);
}

export async function deleteEventInDb(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('calendar_events').delete().eq('id', id);
}

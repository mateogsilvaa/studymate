import { supabase } from '@/lib/supabase/client';
import type { Subject } from '@/lib/types';

type DbSubject = {
  id: string; user_id: string | null; name: string; color: string;
  professor: string | null; schedule: string | null; notes: string | null;
  credits: number; created_at: string; updated_at: string;
};

function toApp(row: DbSubject): Omit<Subject, 'progress'> {
  return {
    id: row.id, name: row.name, color: row.color,
    professor: row.professor ?? '', schedule: row.schedule ?? '',
    notes: row.notes ?? '', credits: row.credits,
  };
}

export async function fetchSubjectsFromDb(): Promise<Omit<Subject, 'progress'>[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('subjects').select('*').order('created_at');
  return (data ?? []).map(toApp);
}

export async function createSubjectInDb(input: Omit<Subject, 'id' | 'progress'>): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('subjects').insert({
    name: input.name, color: input.color,
    professor: input.professor || null,
    schedule: input.schedule || null,
    notes: input.notes || null,
    credits: input.credits,
  }).select('id').single();
  return data?.id ?? null;
}

export async function updateSubjectInDb(id: string, input: Partial<Omit<Subject, 'id' | 'progress'>>): Promise<void> {
  if (!supabase) return;
  await supabase.from('subjects').update({
    ...(input.name      !== undefined && { name: input.name }),
    ...(input.color     !== undefined && { color: input.color }),
    ...(input.professor !== undefined && { professor: input.professor || null }),
    ...(input.schedule  !== undefined && { schedule: input.schedule || null }),
    ...(input.notes     !== undefined && { notes: input.notes || null }),
    ...(input.credits   !== undefined && { credits: input.credits }),
  }).eq('id', id);
}

export async function deleteSubjectInDb(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('subjects').delete().eq('id', id);
}

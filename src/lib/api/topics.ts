import { supabase } from '@/lib/supabase/client';
import type { Topic } from '@/lib/types';

type DbTopic = {
  id: string; subject_id: string; title: string; description: string | null;
  position: number; completed: boolean; completed_at: string | null;
  created_at: string; updated_at: string;
};

function toApp(row: DbTopic): Topic {
  return {
    id: row.id,
    subjectId: row.subject_id,
    title: row.title,
    description: row.description ?? undefined,
    position: row.position,
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
  };
}

export async function fetchTopicsFromDb(): Promise<Topic[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('subject_topics').select('*').order('position');
  return (data ?? []).map(toApp);
}

export async function createTopicInDb(input: {
  subjectId: string; title: string; description?: string; position: number;
}): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('subject_topics').insert({
    subject_id: input.subjectId,
    title: input.title,
    description: input.description || null,
    position: input.position,
    completed: false,
  }).select('id').single();
  return data?.id ?? null;
}

export async function updateTopicInDb(id: string, updates: {
  title?: string; description?: string; completed?: boolean; completedAt?: string | null;
}): Promise<void> {
  if (!supabase) return;
  await supabase.from('subject_topics').update({
    ...(updates.title       !== undefined && { title: updates.title }),
    ...(updates.description !== undefined && { description: updates.description || null }),
    ...(updates.completed   !== undefined && { completed: updates.completed }),
    ...(updates.completedAt !== undefined && { completed_at: updates.completedAt }),
  }).eq('id', id);
}

export async function deleteTopicInDb(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('subject_topics').delete().eq('id', id);
}

import { supabase } from '@/lib/supabase/client';
import type { Exam } from '@/lib/types';

type DbExam = {
  id: string; user_id: string | null; subject_id: string | null;
  title: string; description: string | null; exam_date: string;
  weight: number; status: string; created_at: string; updated_at: string;
};

function toApp(row: DbExam): Exam {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id ?? '',
    date: row.exam_date,
    weight: row.weight ?? 0,
    status: row.status as Exam['status'],
    topics: [],
    checklistItems: [],
  };
}

export async function fetchExamsFromDb(): Promise<Exam[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('exams').select('*').order('exam_date');
  return (data ?? []).map(toApp);
}

export async function createExamInDb(input: {
  title: string; subjectId: string; date: string; weight: number; description?: string;
}): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('exams').insert({
    title: input.title,
    subject_id: input.subjectId || null,
    exam_date: input.date,
    weight: input.weight,
    description: input.description || null,
    status: 'upcoming',
  }).select('id').single();
  return data?.id ?? null;
}

export async function updateExamInDb(id: string, updates: {
  title?: string; date?: string; weight?: number; status?: Exam['status'];
  description?: string; subjectId?: string;
}): Promise<void> {
  if (!supabase) return;
  await supabase.from('exams').update({
    ...(updates.title       !== undefined && { title: updates.title }),
    ...(updates.date        !== undefined && { exam_date: updates.date }),
    ...(updates.weight      !== undefined && { weight: updates.weight }),
    ...(updates.status      !== undefined && { status: updates.status }),
    ...(updates.description !== undefined && { description: updates.description || null }),
    ...(updates.subjectId   !== undefined && { subject_id: updates.subjectId || null }),
  }).eq('id', id);
}

export async function deleteExamInDb(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('exams').delete().eq('id', id);
}

import { supabase } from '@/lib/supabase/client';
import type { Task } from '@/lib/types';

type DbTask = {
  id: string; user_id: string | null; subject_id: string | null;
  title: string; description: string | null; due_date: string;
  priority: string; status: string; type: string;
  created_at: string; updated_at: string;
};

function toApp(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    subjectId: row.subject_id ?? '',
    dueDate: row.due_date,
    priority: row.priority as Task['priority'],
    status: row.status as Task['status'],
    type: row.type as Task['type'],
    subtasks: [],
    note: row.description ?? undefined,
  };
}

export async function fetchTasksFromDb(): Promise<Task[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('tasks').select('*').order('due_date');
  return (data ?? []).map(toApp);
}

export async function createTaskInDb(input: {
  title: string; subjectId: string; dueDate: string;
  priority: Task['priority']; type: Task['type']; note?: string;
}): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.from('tasks').insert({
    title: input.title,
    subject_id: input.subjectId || null,
    due_date: input.dueDate,
    priority: input.priority,
    type: input.type,
    description: input.note || null,
    status: 'pending',
  }).select('id').single();
  return data?.id ?? null;
}

export async function updateTaskInDb(id: string, updates: {
  title?: string; dueDate?: string; priority?: Task['priority'];
  status?: Task['status']; type?: Task['type']; note?: string;
  subjectId?: string;
}): Promise<void> {
  if (!supabase) return;
  await supabase.from('tasks').update({
    ...(updates.title     !== undefined && { title: updates.title }),
    ...(updates.dueDate   !== undefined && { due_date: updates.dueDate }),
    ...(updates.priority  !== undefined && { priority: updates.priority }),
    ...(updates.status    !== undefined && { status: updates.status }),
    ...(updates.type      !== undefined && { type: updates.type }),
    ...(updates.note      !== undefined && { description: updates.note || null }),
    ...(updates.subjectId !== undefined && { subject_id: updates.subjectId || null }),
  }).eq('id', id);
}

export async function deleteTaskInDb(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('tasks').delete().eq('id', id);
}

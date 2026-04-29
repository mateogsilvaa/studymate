'use client';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { hasSupabase } from '@/lib/supabase/client';
import { subjects as mockSubjects, initialTasks, initialExams, initialNotifications } from './data';
import { fetchSubjectsFromDb, createSubjectInDb, updateSubjectInDb, deleteSubjectInDb } from './api/subjects';
import { fetchTasksFromDb, createTaskInDb, updateTaskInDb, deleteTaskInDb } from './api/tasks';
import { fetchExamsFromDb, createExamInDb, updateExamInDb, deleteExamInDb } from './api/exams';
import { fetchEventsFromDb, createEventInDb, updateEventInDb, deleteEventInDb } from './api/events';
import { fetchTopicsFromDb, createTopicInDb, updateTopicInDb, deleteTopicInDb } from './api/topics';
import type { Subject, Task, Exam, CalendarEvent, Topic, Notification, Priority } from './types';

/* ─── Context shape ─────────────────────────────────────── */
interface StoreCtx {
  subjects: Subject[];
  tasks: Task[];
  exams: Exam[];
  events: CalendarEvent[];
  topics: Topic[];
  notifications: Notification[];
  unread: number;
  loading: boolean;

  // Subject CRUD
  addSubject: (s: Omit<Subject, 'id' | 'progress'>) => Promise<void>;
  updateSubject: (id: string, s: Partial<Omit<Subject, 'id' | 'progress'>>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // Task CRUD
  addTask: (t: { title: string; subjectId: string; dueDate: string; priority: Priority; type: Task['type']; note?: string }) => Promise<void>;
  updateTask: (id: string, t: { title?: string; dueDate?: string; priority?: Priority; type?: Task['type']; note?: string; subjectId?: string }) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (id: string) => void;

  // Exam CRUD
  addExam: (e: { title: string; subjectId: string; date: string; weight: number; description?: string }) => Promise<void>;
  updateExam: (id: string, e: { title?: string; date?: string; weight?: number; status?: Exam['status']; description?: string }) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  toggleChecklistItem: (examId: string, itemId: string) => void;

  // Topic CRUD
  addTopic: (subjectId: string, title: string) => Promise<void>;
  updateTopic: (id: string, updates: { title?: string; description?: string }) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;
  toggleTopic: (id: string) => void;

  // Calendar event CRUD
  addEvent: (e: Omit<CalendarEvent, 'id'>) => Promise<void>;
  updateEvent: (id: string, e: Partial<Omit<CalendarEvent, 'id'>>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;

  // Notifications
  addReminder: (r: { title: string; date: string; subjectId?: string }) => void;
  markAllRead: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

/* ─── Helper: compute subject progress from topics ───────── */
function computeProgress(topics: Topic[], subjectId: string): number {
  const st = topics.filter(t => t.subjectId === subjectId);
  if (st.length === 0) return 0;
  return Math.round((st.filter(t => t.completed).length / st.length) * 100);
}

function withProgress(subjects: Omit<Subject, 'progress'>[], topics: Topic[]): Subject[] {
  return subjects.map(s => ({ ...s, progress: computeProgress(topics, s.id) }));
}

/* ─── Provider ───────────────────────────────────────────── */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [rawSubjects, setRawSubjects] = useState<Omit<Subject, 'progress'>[]>(mockSubjects);
  const [tasks,    setTasks]    = useState<Task[]>(initialTasks);
  const [exams,    setExams]    = useState<Exam[]>(initialExams);
  const [events,   setEvents]   = useState<CalendarEvent[]>([]);
  const [topics,   setTopics]   = useState<Topic[]>([]);
  const [notifs,   setNotifs]   = useState<Notification[]>(initialNotifications);
  const [loading,  setLoading]  = useState(false);

  /* Load from Supabase on mount */
  useEffect(() => {
    if (!hasSupabase) return;
    setLoading(true);
    Promise.all([
      fetchSubjectsFromDb(),
      fetchTasksFromDb(),
      fetchExamsFromDb(),
      fetchEventsFromDb(),
      fetchTopicsFromDb(),
    ]).then(([s, t, e, ev, top]) => {
      if (s.length  > 0) setRawSubjects(s);
      if (t.length  > 0) setTasks(t);
      if (e.length  > 0) setExams(e);
      if (ev.length > 0) setEvents(ev);
      setTopics(top);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  /* ── Subject CRUD ─────────────────────────────────────── */
  const addSubject = useCallback(async (input: Omit<Subject, 'id' | 'progress'>) => {
    const tempId = `s-${Date.now()}`;
    setRawSubjects(prev => [...prev, { ...input, id: tempId }]);
    if (hasSupabase) {
      const realId = await createSubjectInDb(input);
      if (realId) setRawSubjects(prev => prev.map(s => s.id === tempId ? { ...s, id: realId } : s));
    }
  }, []);

  const updateSubject = useCallback(async (id: string, input: Partial<Omit<Subject, 'id' | 'progress'>>) => {
    setRawSubjects(prev => prev.map(s => s.id === id ? { ...s, ...input } : s));
    await updateSubjectInDb(id, input);
  }, []);

  const deleteSubject = useCallback(async (id: string) => {
    setRawSubjects(prev => prev.filter(s => s.id !== id));
    setTasks(prev => prev.filter(t => t.subjectId !== id));
    setExams(prev => prev.filter(e => e.subjectId !== id));
    setTopics(prev => prev.filter(t => t.subjectId !== id));
    await deleteSubjectInDb(id);
  }, []);

  /* ── Task CRUD ────────────────────────────────────────── */
  const addTask = useCallback(async (input: Parameters<StoreCtx['addTask']>[0]) => {
    const tempId = `t-${Date.now()}`;
    const newTask: Task = { ...input, id: tempId, status: 'pending', subtasks: [] };
    setTasks(prev => [newTask, ...prev]);
    setNotifs(prev => [{
      id: `n-${Date.now()}`, type: 'deadline', title: 'Nueva tarea añadida',
      body: `"${input.title}" vence el ${input.dueDate}`,
      date: new Date().toISOString().split('T')[0], read: false, subjectId: input.subjectId,
    }, ...prev]);
    if (hasSupabase) {
      const realId = await createTaskInDb(input);
      if (realId) setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: realId } : t));
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Parameters<StoreCtx['updateTask']>[1]) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        ...(updates.title     !== undefined && { title: updates.title }),
        ...(updates.dueDate   !== undefined && { dueDate: updates.dueDate }),
        ...(updates.priority  !== undefined && { priority: updates.priority }),
        ...(updates.type      !== undefined && { type: updates.type }),
        ...(updates.note      !== undefined && { note: updates.note }),
        ...(updates.subjectId !== undefined && { subjectId: updates.subjectId }),
      };
    }));
    await updateTaskInDb(id, updates);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    await deleteTaskInDb(id);
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const next = t.status === 'completed' ? 'pending' : 'completed';
      updateTaskInDb(id, { status: next }).catch(console.error);
      return { ...t, status: next };
    }));
  }, []);

  /* ── Exam CRUD ────────────────────────────────────────── */
  const addExam = useCallback(async (input: Parameters<StoreCtx['addExam']>[0]) => {
    const tempId = `e-${Date.now()}`;
    const newExam: Exam = { ...input, id: tempId, status: 'upcoming', topics: [], checklistItems: [] };
    setExams(prev => [newExam, ...prev]);
    if (hasSupabase) {
      const realId = await createExamInDb(input);
      if (realId) setExams(prev => prev.map(e => e.id === tempId ? { ...e, id: realId } : e));
    }
  }, []);

  const updateExam = useCallback(async (id: string, updates: Parameters<StoreCtx['updateExam']>[1]) => {
    setExams(prev => prev.map(e => {
      if (e.id !== id) return e;
      return {
        ...e,
        ...(updates.title       !== undefined && { title: updates.title }),
        ...(updates.date        !== undefined && { date: updates.date }),
        ...(updates.weight      !== undefined && { weight: updates.weight }),
        ...(updates.status      !== undefined && { status: updates.status }),
      };
    }));
    await updateExamInDb(id, updates);
  }, []);

  const deleteExam = useCallback(async (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    await deleteExamInDb(id);
  }, []);

  const toggleChecklistItem = useCallback((examId: string, itemId: string) => {
    setExams(prev => prev.map(e => {
      if (e.id !== examId) return e;
      return { ...e, checklistItems: e.checklistItems.map(c => c.id === itemId ? { ...c, done: !c.done } : c) };
    }));
  }, []);

  /* ── Topic CRUD ───────────────────────────────────────── */
  const addTopic = useCallback(async (subjectId: string, title: string) => {
    const position = topics.filter(t => t.subjectId === subjectId).length;
    const tempId = `top-${Date.now()}`;
    const newTopic: Topic = { id: tempId, subjectId, title, position, completed: false };
    setTopics(prev => [...prev, newTopic]);
    if (hasSupabase) {
      const realId = await createTopicInDb({ subjectId, title, position });
      if (realId) setTopics(prev => prev.map(t => t.id === tempId ? { ...t, id: realId } : t));
    }
  }, [topics]);

  const updateTopic = useCallback(async (id: string, updates: Parameters<StoreCtx['updateTopic']>[1]) => {
    setTopics(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    await updateTopicInDb(id, updates);
  }, []);

  const deleteTopic = useCallback(async (id: string) => {
    setTopics(prev => prev.filter(t => t.id !== id));
    await deleteTopicInDb(id);
  }, []);

  const toggleTopic = useCallback((id: string) => {
    setTopics(prev => prev.map(t => {
      if (t.id !== id) return t;
      const completed = !t.completed;
      const completedAt = completed ? new Date().toISOString() : undefined;
      updateTopicInDb(id, { completed, completedAt: completedAt ?? null }).catch(console.error);
      return { ...t, completed, completedAt };
    }));
  }, []);

  /* ── Calendar Event CRUD ──────────────────────────────── */
  const addEvent = useCallback(async (input: Omit<CalendarEvent, 'id'>) => {
    const tempId = `ev-${Date.now()}`;
    setEvents(prev => [...prev, { ...input, id: tempId }]);
    if (hasSupabase) {
      const realId = await createEventInDb(input);
      if (realId) setEvents(prev => prev.map(e => e.id === tempId ? { ...e, id: realId } : e));
    }
  }, []);

  const updateEvent = useCallback(async (id: string, input: Partial<Omit<CalendarEvent, 'id'>>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...input } : e));
    await updateEventInDb(id, input);
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    await deleteEventInDb(id);
  }, []);

  /* ── Notifications ────────────────────────────────────── */
  const addReminder = useCallback((r: { title: string; date: string; subjectId?: string }) => {
    setNotifs(prev => [{
      id: `n-${Date.now()}`, type: 'reminder', title: r.title,
      body: `Recordatorio para el ${r.date}`,
      date: new Date().toISOString().split('T')[0], read: false, subjectId: r.subjectId,
    }, ...prev]);
  }, []);

  const markAllRead = useCallback(() => setNotifs(prev => prev.map(n => ({ ...n, read: true }))), []);

  const subjects = withProgress(rawSubjects, topics);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <Ctx.Provider value={{
      subjects, tasks, exams, events, topics, notifications: notifs, unread, loading,
      addSubject, updateSubject, deleteSubject,
      addTask, updateTask, deleteTask, toggleTask,
      addExam, updateExam, deleteExam, toggleChecklistItem,
      addTopic, updateTopic, deleteTopic, toggleTopic,
      addEvent, updateEvent, deleteEvent,
      addReminder, markAllRead,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useData(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
}

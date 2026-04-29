export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
export type ExamStatus = 'upcoming' | 'studying' | 'ready' | 'done';
export type UrgencyLevel = 'overdue' | 'urgent' | 'soon' | 'normal';
export type EventType = 'class' | 'tutoring' | 'reminder' | 'personal' | 'other';

export interface Subject {
  id: string;
  name: string;
  color: string;
  professor: string;
  schedule: string;
  notes?: string;
  credits: number;
  progress: number; // computed from topics: completed/total %
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description?: string;
  position: number;
  completed: boolean;
  completedAt?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  subjectId?: string;
  description?: string;
  eventType: EventType;
  startAt: string; // ISO date string (date or datetime)
  endAt?: string;
  allDay: boolean;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  type: 'essay' | 'practice' | 'reading' | 'project' | 'homework' | 'presentation';
  subtasks: Subtask[];
  note?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string;
  weight: number;
  topics: string[];
  status: ExamStatus;
  checklistItems: ChecklistItem[];
}

export interface Notification {
  id: string;
  type: 'deadline' | 'exam' | 'reminder' | 'system';
  title: string;
  body: string;
  date: string;
  read: boolean;
  subjectId?: string;
}

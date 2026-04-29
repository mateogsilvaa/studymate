import type { Subject, Task, Exam, Notification, UrgencyLevel } from './types';

/* ─── Subjects ────────────────────────────────────────────── */
export const subjects: Subject[] = [
  { id: 's1', name: 'Cálculo II',       color: '#6366f1', professor: 'Dr. Ramírez',  schedule: 'L-M-V 8:00',  credits: 4, progress: 62 },
  { id: 's2', name: 'Física Mecánica',  color: '#ef4444', professor: 'Dra. Morales', schedule: 'M-J 10:00',   credits: 4, progress: 45 },
  { id: 's3', name: 'Programación OO',  color: '#10b981', professor: 'Ing. Torres',  schedule: 'L-M-V 12:00', credits: 3, progress: 78 },
  { id: 's4', name: 'Estadística',      color: '#f59e0b', professor: 'Dr. López',    schedule: 'M-J 14:00',   credits: 3, progress: 55 },
  { id: 's5', name: 'Inglés Técnico',   color: '#8b5cf6', professor: 'Prof. Smith',  schedule: 'V 16:00',     credits: 2, progress: 90 },
];

/* ─── Helpers ─────────────────────────────────────────────── */
const today = new Date();
today.setHours(0, 0, 0, 0);

export const d = (n: number): string => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split('T')[0];
};

export function getDaysUntil(dateStr: string): number {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.round((target.getTime() - t.getTime()) / 86400000);
}

export function getUrgency(dateStr: string, status?: string): UrgencyLevel {
  if (status === 'completed') return 'normal';
  const days = getDaysUntil(dateStr);
  if (days < 0) return 'overdue';
  if (days === 0) return 'urgent';
  if (days <= 3) return 'soon';
  return 'normal';
}

export function urgencyColor(level: UrgencyLevel): string {
  return level === 'overdue' || level === 'urgent' ? 'var(--urgent)'
       : level === 'soon'                          ? 'var(--warning)'
       : 'var(--text-3)';
}

export function urgencyBg(level: UrgencyLevel): string {
  return level === 'overdue' || level === 'urgent' ? 'var(--urgent-dim)'
       : level === 'soon'                          ? 'var(--warning-dim)'
       : 'transparent';
}

export function relativeDate(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days < -1) return `Vencida hace ${Math.abs(days)}d`;
  if (days === -1) return 'Vencida ayer';
  if (days === 0)  return 'Hoy';
  if (days === 1)  return 'Mañana';
  if (days <= 6)   return `En ${days} días`;
  if (days <= 13)  return `En ${days} días`;
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export function shortDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

/* ─── Tasks ──────────────────────────────────────────────── */
export const initialTasks: Task[] = [
  {
    id: 't1', title: 'Ensayo sobre integrales dobles', subjectId: 's1',
    dueDate: d(1), priority: 'high', status: 'in_progress', type: 'essay',
    subtasks: [
      { id: 'st1', title: 'Investigar bibliografía', done: true },
      { id: 'st2', title: 'Redactar introducción', done: true },
      { id: 'st3', title: 'Desarrollar ejemplos', done: false },
      { id: 'st4', title: 'Conclusiones y revisión', done: false },
    ],
    note: 'Mín. 5 páginas, formato APA. Entregar en aula virtual.',
  },
  {
    id: 't2', title: 'Práctica de laboratorio N°4', subjectId: 's2',
    dueDate: d(2), priority: 'high', status: 'pending', type: 'practice',
    subtasks: [
      { id: 'st5', title: 'Recolectar datos del experimento', done: false },
      { id: 'st6', title: 'Analizar resultados y calcular error', done: false },
    ],
  },
  {
    id: 't3', title: 'Lectura: cap. 7 distribuciones', subjectId: 's4',
    dueDate: d(3), priority: 'medium', status: 'pending', type: 'reading',
    subtasks: [],
    note: 'Páginas 180–210, tomar apuntes para el quiz.',
  },
  {
    id: 't4', title: 'Presentación oral — Technical Vocabulary', subjectId: 's5',
    dueDate: d(5), priority: 'medium', status: 'pending', type: 'presentation',
    subtasks: [
      { id: 'st7', title: 'Preparar slides (máx. 10)', done: false },
      { id: 'st8', title: 'Practicar discurso 5 min', done: false },
    ],
  },
  {
    id: 't5', title: 'Proyecto final — Sistema de Biblioteca', subjectId: 's3',
    dueDate: d(7), priority: 'high', status: 'in_progress', type: 'project',
    subtasks: [
      { id: 'st9',  title: 'Diagrama de clases', done: true },
      { id: 'st10', title: 'Módulo de usuarios', done: true },
      { id: 'st11', title: 'Módulo de préstamos', done: false },
      { id: 'st12', title: 'Interfaz gráfica', done: false },
      { id: 'st13', title: 'Documentación', done: false },
    ],
  },
  {
    id: 't6', title: 'Tarea 3 — Series de Taylor', subjectId: 's1',
    dueDate: d(10), priority: 'medium', status: 'pending', type: 'homework',
    subtasks: [],
  },
  {
    id: 't7', title: 'Ejercicios regresión lineal', subjectId: 's4',
    dueDate: d(14), priority: 'low', status: 'pending', type: 'homework',
    subtasks: [],
  },
  {
    id: 't8', title: 'Resumen capítulos 1–3', subjectId: 's5',
    dueDate: d(-3), priority: 'low', status: 'completed', type: 'reading',
    subtasks: [],
  },
  {
    id: 't9', title: 'Implementar lista enlazada', subjectId: 's3',
    dueDate: d(-5), priority: 'medium', status: 'completed', type: 'homework',
    subtasks: [],
  },
  {
    id: 't10', title: 'Informe de práctica N°3', subjectId: 's2',
    dueDate: d(-2), priority: 'high', status: 'overdue', type: 'practice',
    subtasks: [],
    note: 'Pendiente de entrega. Hablar con la profesora.',
  },
  {
    id: 't11', title: 'Ejercicios de movimiento circular', subjectId: 's2',
    dueDate: d(8), priority: 'medium', status: 'pending', type: 'homework',
    subtasks: [],
  },
  {
    id: 't12', title: 'Tarea 4 — Coordenadas polares', subjectId: 's1',
    dueDate: d(16), priority: 'low', status: 'pending', type: 'homework',
    subtasks: [],
  },
];

/* ─── Exams ──────────────────────────────────────────────── */
export const initialExams: Exam[] = [
  {
    id: 'e1', title: 'Quiz de Estadística', subjectId: 's4',
    date: d(4), weight: 15, status: 'upcoming',
    topics: ['Distribución normal', 'Distribución binomial', 'Intervalos de confianza'],
    checklistItems: [
      { id: 'c1', title: 'Leer capítulo 7', done: false },
      { id: 'c2', title: 'Hacer ejercicios de práctica', done: false },
    ],
  },
  {
    id: 'e2', title: 'Parcial 2 — Integrales Múltiples', subjectId: 's1',
    date: d(6), weight: 30, status: 'studying',
    topics: ['Integrales dobles', 'Integrales triples', 'Cambio de variables', 'Coordenadas polares'],
    checklistItems: [
      { id: 'c3', title: 'Repasar integrales dobles (cap. 5)', done: true },
      { id: 'c4', title: 'Hacer ejercicios pág. 230–250', done: true },
      { id: 'c5', title: 'Repasar integrales triples', done: false },
      { id: 'c6', title: 'Práctica con cambio de variables', done: false },
      { id: 'c7', title: 'Resolver examen anterior', done: false },
    ],
  },
  {
    id: 'e3', title: 'Examen de Laboratorio N°2', subjectId: 's2',
    date: d(9), weight: 20, status: 'upcoming',
    topics: ['Leyes de Newton', 'Movimiento circular', 'Trabajo y energía'],
    checklistItems: [
      { id: 'c8', title: 'Repasar informe anterior', done: false },
      { id: 'c9', title: 'Estudiar teoría movimiento circular', done: false },
      { id: 'c10', title: 'Calcular incertidumbres', done: false },
    ],
  },
];

/* ─── Notifications ─────────────────────────────────────── */
export const initialNotifications: Notification[] = [
  { id: 'n1', type: 'deadline', title: 'Entrega mañana', body: 'Ensayo de integrales dobles vence mañana a las 23:59.', date: d(0), read: false, subjectId: 's1' },
  { id: 'n2', type: 'exam',     title: 'Examen en 6 días', body: 'Parcial 2 de Cálculo II. Empieza a prepararte.', date: d(0), read: false, subjectId: 's1' },
  { id: 'n3', type: 'deadline', title: 'Tarea vencida', body: 'El informe de práctica N°3 de Física venció hace 2 días.', date: d(-1), read: false, subjectId: 's2' },
  { id: 'n4', type: 'exam',     title: 'Quiz próximo', body: 'Quiz de Estadística en 4 días. ¿Empezaste a estudiar?', date: d(-1), read: true,  subjectId: 's4' },
  { id: 'n5', type: 'system',   title: 'Semana cargada', body: 'Esta semana tienes 3 entregas y 2 exámenes.', date: d(-2), read: true },
];

export function getSubjectById(id: string): Subject | undefined {
  return subjects.find(s => s.id === id);
}

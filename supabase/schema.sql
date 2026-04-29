-- ============================================================
--  STUDYMATE — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ─── updated_at trigger ─────────────────────────────────────
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ─── subjects ───────────────────────────────────────────────
create table if not exists subjects (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references auth.users(id) on delete cascade,
  name        text        not null,
  color       text        not null default '#6366f1',
  professor   text,
  schedule    text,
  notes       text,
  credits     integer     default 0,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists subjects_user_id_idx on subjects(user_id);

create trigger subjects_updated_at
  before update on subjects
  for each row execute procedure handle_updated_at();

-- ─── subject_topics ─────────────────────────────────────────
create table if not exists subject_topics (
  id           uuid        primary key default uuid_generate_v4(),
  subject_id   uuid        references subjects(id) on delete cascade not null,
  title        text        not null,
  description  text,
  position     integer     default 0 not null,
  completed    boolean     default false not null,
  completed_at timestamptz,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null
);

create index if not exists topics_subject_id_idx on subject_topics(subject_id);

create trigger topics_updated_at
  before update on subject_topics
  for each row execute procedure handle_updated_at();

-- ─── tasks ──────────────────────────────────────────────────
create table if not exists tasks (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references auth.users(id) on delete cascade,
  subject_id  uuid        references subjects(id) on delete set null,
  title       text        not null,
  description text,
  due_date    date        not null,
  priority    text        default 'medium' check (priority in ('high','medium','low')),
  status      text        default 'pending' check (status in ('pending','in_progress','completed','overdue')),
  type        text        default 'homework' check (type in ('essay','practice','reading','project','homework','presentation','other')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists tasks_user_id_idx    on tasks(user_id);
create index if not exists tasks_subject_id_idx on tasks(subject_id);
create index if not exists tasks_due_date_idx   on tasks(due_date);
create index if not exists tasks_status_idx     on tasks(status);

create trigger tasks_updated_at
  before update on tasks
  for each row execute procedure handle_updated_at();

-- ─── exams ──────────────────────────────────────────────────
create table if not exists exams (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references auth.users(id) on delete cascade,
  subject_id  uuid        references subjects(id) on delete set null,
  title       text        not null,
  description text,
  exam_date   date        not null,
  weight      numeric(5,2) default 0,
  status      text        default 'upcoming' check (status in ('upcoming','studying','ready','done')),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists exams_user_id_idx    on exams(user_id);
create index if not exists exams_subject_id_idx on exams(subject_id);
create index if not exists exams_exam_date_idx  on exams(exam_date);

create trigger exams_updated_at
  before update on exams
  for each row execute procedure handle_updated_at();

-- ─── calendar_events ────────────────────────────────────────
create table if not exists calendar_events (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        references auth.users(id) on delete cascade,
  subject_id  uuid        references subjects(id) on delete set null,
  title       text        not null,
  description text,
  event_type  text        default 'other' check (event_type in ('class','tutoring','reminder','personal','other')),
  start_at    timestamptz not null,
  end_at      timestamptz,
  all_day     boolean     default true,
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

create index if not exists events_user_id_idx on calendar_events(user_id);
create index if not exists events_start_at_idx on calendar_events(start_at);

create trigger events_updated_at
  before update on calendar_events
  for each row execute procedure handle_updated_at();

-- ─── profiles (prepared for auth) ───────────────────────────
create table if not exists profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  full_name  text,
  avatar_url text,
  degree     text,
  year       integer,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure handle_updated_at();

-- ─── Row Level Security (prepared, permissive until auth) ───

-- subjects
alter table subjects enable row level security;
create policy "Allow all for now" on subjects for all using (true) with check (true);

-- subject_topics
alter table subject_topics enable row level security;
create policy "Allow all for now" on subject_topics for all using (true) with check (true);

-- tasks
alter table tasks enable row level security;
create policy "Allow all for now" on tasks for all using (true) with check (true);

-- exams
alter table exams enable row level security;
create policy "Allow all for now" on exams for all using (true) with check (true);

-- calendar_events
alter table calendar_events enable row level security;
create policy "Allow all for now" on calendar_events for all using (true) with check (true);

-- profiles
alter table profiles enable row level security;
create policy "Allow all for now" on profiles for all using (true) with check (true);

-- ─── Seed data (optional — remove before production) ────────
-- Uncomment to insert sample data for testing:
/*
insert into subjects (name, color, professor, schedule, credits) values
  ('Cálculo II',      '#6366f1', 'Dr. Ramírez',  'L-M-V 8:00',  4),
  ('Física Mecánica', '#ef4444', 'Dra. Morales', 'M-J 10:00',   4),
  ('Programación OO', '#10b981', 'Ing. Torres',  'L-M-V 12:00', 3),
  ('Estadística',     '#f59e0b', 'Dr. López',    'M-J 14:00',   3),
  ('Inglés Técnico',  '#8b5cf6', 'Prof. Smith',  'V 16:00',     2);
*/

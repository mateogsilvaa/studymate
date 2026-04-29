# StudyMate

Planificador académico — tareas, exámenes, materias y calendario en un solo lugar.

Built with: **Next.js 16 · TypeScript · Tailwind CSS v4 · Supabase**

---

## Quick start

```bash
# 1. Clone & install
git clone https://github.com/your-username/studymate.git
cd studymate
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Run database schema
# Go to: Supabase Dashboard → SQL Editor → paste contents of supabase/schema.sql

# 4. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Without Supabase**: the app works fully offline with mock data. You can skip step 2-3 to explore locally.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase Dashboard → Project Settings → API → `anon` public key |

---

## Database setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. That's it — RLS policies, indexes, and triggers are all included

### Tables

| Table | Description |
|---|---|
| `subjects` | Academic subjects with color, professor, schedule |
| `subject_topics` | Completable topics/syllabus items per subject |
| `tasks` | Assignments with due date, priority, type, status |
| `exams` | Exams with date, weight, status |
| `calendar_events` | Custom events (class, tutoring, reminder, etc.) |
| `profiles` | User profile (name, degree, year) |

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel          # follow prompts
# Set env vars when asked, or add them in Vercel Dashboard → Settings → Environment Variables
```

### Option B — GitHub + Vercel Dashboard

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/studymate.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. Click **Deploy**

---

## PWA — Install on iPhone

1. Open the deployed URL in **Safari**
2. Tap the **Share** button → **Add to Home Screen**
3. The app installs as a standalone PWA with offline support

---

## Features

- **Dashboard** — contextual natural-language summary, week deadlines, exam countdown
- **Tasks** — full CRUD with filters (subject, priority, status), urgency left border
- **Exams** — countdown cards, checklist preparation tracking, status management
- **Subjects** — card grid with progress bar (from topics), detail page with topics
- **Subject detail** — completable syllabus topics, tasks and exams list
- **Calendar** — month view + week view, create/edit events per day
- **Settings** — light/dark theme, notification toggles
- **Mobile** — bottom nav, PWA, safe-area support, responsive

---

## Tech stack

- **Next.js 16** with App Router
- **TypeScript** strict mode
- **Tailwind CSS v4** (`@import "tailwindcss"`)
- **Supabase** (`@supabase/supabase-js`) for Postgres + auth-ready RLS
- **Lucide React** for icons
- CSS custom properties (`var(--*)`) for theming — no Tailwind dynamic classes
- Optimistic UI — mutations update state immediately, sync to DB in background

---

## Project structure

```
src/
  app/              # Next.js App Router pages
    calendar/       # Calendar with month + week view
    exams/          # Exams list with CRUD
    subjects/       # Subjects grid + [id] detail
    tasks/          # Tasks list with CRUD
    settings/       # Theme + notifications
  components/
    calendar/       # CalendarView, EventForm
    dashboard/      # ContextualSummary, WeeklyDeadlines, etc.
    exams/          # ExamForm
    layout/         # AppShell, Sidebar, TopBar, BottomNav
    subjects/       # SubjectForm
    tasks/          # TaskForm
    ui/             # Modal, Spinner, Badge, NotificationsDropdown
  lib/
    api/            # Supabase CRUD functions (subjects, tasks, exams, events, topics)
    supabase/       # Supabase browser client
    data.ts         # Mock data + date helpers
    store.tsx       # React Context with full CRUD state
    theme.tsx       # Dark/light theme provider
    types.ts        # TypeScript interfaces
supabase/
  schema.sql        # Complete DB schema with RLS, indexes, triggers
```

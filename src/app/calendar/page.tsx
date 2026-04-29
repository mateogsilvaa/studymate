import AppShell from '@/components/layout/AppShell';
import CalendarView from '@/components/calendar/CalendarView';

export default function CalendarPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1040 }}>
        <CalendarView />
      </div>
    </AppShell>
  );
}

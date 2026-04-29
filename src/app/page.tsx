import AppShell from '@/components/layout/AppShell';
import ContextualSummary from '@/components/dashboard/ContextualSummary';
import WeeklyDeadlines from '@/components/dashboard/WeeklyDeadlines';
import WeekStrip from '@/components/dashboard/WeekStrip';
import UpcomingExamsWidget from '@/components/dashboard/UpcomingExamsWidget';

export default function Dashboard() {
  return (
    <AppShell>
      <div style={{ maxWidth: 1040, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top: contextual summary in natural language */}
        <ContextualSummary />

        {/* Center: deadlines list + week strip */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
          <WeeklyDeadlines />
          <WeekStrip />
        </div>

        {/* Bottom: exams countdown */}
        <UpcomingExamsWidget />
      </div>
    </AppShell>
  );
}

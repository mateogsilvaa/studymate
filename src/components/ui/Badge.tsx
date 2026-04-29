import type { UrgencyLevel } from '@/lib/types';

interface Props {
  level: UrgencyLevel;
  label: string;
  size?: 'xs' | 'sm';
}

const cfg: Record<UrgencyLevel, { color: string; bg: string }> = {
  overdue: { color: 'var(--urgent)',  bg: 'var(--urgent-dim)' },
  urgent:  { color: 'var(--urgent)',  bg: 'var(--urgent-dim)' },
  soon:    { color: 'var(--warning)', bg: 'var(--warning-dim)' },
  normal:  { color: 'var(--text-3)',  bg: 'transparent' },
};

export default function Badge({ level, label, size = 'sm' }: Props) {
  const { color, bg } = cfg[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: size === 'xs' ? '1px 6px' : '2px 8px',
      borderRadius: 5,
      fontSize: size === 'xs' ? 10 : 11,
      fontWeight: 600,
      color,
      background: bg,
      border: `1px solid ${color}33`,
      whiteSpace: 'nowrap',
      lineHeight: 1.6,
    }}>
      {label}
    </span>
  );
}

import { Chip, type ChipProps } from '@mui/material';

/** Exported so other views (e.g. Analytics charts) can reuse the exact same status→color mapping as this badge, instead of inventing a second palette. */
// eslint-disable-next-line react-refresh/only-export-components -- shared constant, deliberately co-located with the component that owns this mapping
export const STATUS_COLOR_MAP: Record<string, ChipProps['color']> = {
  pending: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'error',
  no_show: 'default',
  active: 'success',
  inactive: 'default',
  suspended: 'error',
  draft: 'default',
  issued: 'info',
  paid: 'success',
  void: 'error',
  succeeded: 'success',
  failed: 'error',
  refunded: 'warning',
  in_progress: 'info',
  requested: 'warning',
};

export interface StatusBadgeProps {
  status: string;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const color = STATUS_COLOR_MAP[status] ?? 'default';
  const text = label ?? status.replace(/_/g, ' ');
  return (
    <Chip
      size="small"
      color={color}
      label={text.charAt(0).toUpperCase() + text.slice(1)}
      sx={{ textTransform: 'capitalize', fontWeight: 600 }}
    />
  );
}

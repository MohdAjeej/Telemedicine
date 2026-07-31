import { alpha, Avatar, Card, CardContent, Stack, Typography, useTheme } from '@mui/material';
import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  trend?: { value: string; direction: 'up' | 'down' };
}

export function StatCard({ label, value, icon, color = 'primary', trend }: StatCardProps) {
  const theme = useTheme();
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {trend && (
              <Typography
                variant="caption"
                color={trend.direction === 'up' ? 'success.main' : 'error.main'}
              >
                {trend.direction === 'up' ? '▲' : '▼'} {trend.value}
              </Typography>
            )}
          </Stack>
          {icon && (
            <Avatar
              sx={{
                bgcolor: alpha(theme.palette[color].main, 0.12),
                color: `${color}.main`,
                width: 48,
                height: 48,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

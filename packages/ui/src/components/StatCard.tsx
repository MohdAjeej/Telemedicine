import { Avatar, Card, CardContent, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  trend?: { value: string; direction: 'up' | 'down' };
}

export function StatCard({ label, value, icon, color = 'primary', trend }: StatCardProps) {
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
            <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

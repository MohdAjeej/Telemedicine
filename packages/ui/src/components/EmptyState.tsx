import { Box, Button, Stack, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack alignItems="center" justifyContent="center" spacing={1.5} sx={{ py: 8, px: 2 }}>
      <Box sx={{ color: 'text.disabled', fontSize: 48 }}>
        {icon ?? <InboxOutlinedIcon fontSize="inherit" />}
      </Box>
      <Typography variant="h6" fontWeight={600}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={360}>
          {description}
        </Typography>
      )}
      {action && (
        <Button variant="contained" onClick={action.onClick} sx={{ mt: 1 }}>
          {action.label}
        </Button>
      )}
    </Stack>
  );
}

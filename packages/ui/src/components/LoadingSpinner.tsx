import { Box, CircularProgress, Stack, Typography } from '@mui/material';

export interface LoadingSpinnerProps {
  label?: string;
  fullHeight?: boolean;
}

export function LoadingSpinner({ label, fullHeight = false }: LoadingSpinnerProps) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1.5}
      sx={{ py: 6, minHeight: fullHeight ? '60vh' : undefined }}
    >
      <CircularProgress size={32} />
      {label && (
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      )}
    </Stack>
  );
}

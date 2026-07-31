import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: '100vh' }}>
      <Typography variant="h2" fontWeight={700}>
        404
      </Typography>
      <Typography color="text.secondary">This page does not exist.</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go home
      </Button>
    </Stack>
  );
}

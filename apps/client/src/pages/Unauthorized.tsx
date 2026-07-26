import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ minHeight: '100vh' }}>
      <Typography variant="h2" fontWeight={700}>
        403
      </Typography>
      <Typography color="text.secondary">
        You do not have permission to view this page.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go home
      </Button>
    </Stack>
  );
}

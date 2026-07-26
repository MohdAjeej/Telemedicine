import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={3} alignItems="center">
          <Typography variant="h5" fontWeight={700} color="primary.main">
            Telemedicine Platform
          </Typography>
          <Paper variant="outlined" sx={{ p: 4, width: '100%' }}>
            <Outlet />
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}

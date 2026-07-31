import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardActionArea, Link, Stack, Typography, alpha } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';

const OPTIONS = [
  {
    to: '/register-admin',
    icon: <LocalHospitalRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Register as Admin',
    description: 'Register your hospital and manage doctors, health officers, and patients.',
    accent: 'primary' as const,
  },
  {
    to: '/register/patient',
    icon: <PersonAddAltRoundedIcon sx={{ fontSize: 28 }} />,
    title: 'Register as Patient',
    description: 'Book appointments, join video consultations, and track your health records.',
    accent: 'secondary' as const,
  },
];

export default function RegisterChoicePage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          How would you like to get started?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Every hospital starts with an Admin account. Every patient starts with their own.
        </Typography>
      </Box>

      <Stack spacing={2}>
        {OPTIONS.map((option) => (
          <Card
            key={option.to}
            variant="outlined"
            sx={{
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
            }}
          >
            <CardActionArea component={RouterLink} to={option.to} sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    flexShrink: 0,
                    borderRadius: 2.5,
                    bgcolor: (theme) => alpha(theme.palette[option.accent].main, 0.12),
                    color: `${option.accent}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {option.icon}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
                <ArrowForwardRoundedIcon sx={{ color: 'text.secondary', flexShrink: 0 }} />
              </Stack>
            </CardActionArea>
          </Card>
        ))}
      </Stack>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          Sign in
        </Link>
      </Typography>
    </Stack>
  );
}

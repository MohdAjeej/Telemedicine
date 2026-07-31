import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-16px); }
`;

const HIGHLIGHTS = [
  { icon: <ManageAccountsOutlinedIcon fontSize="small" />, label: 'Manage hospitals, staff, and patients' },
  { icon: <AssessmentOutlinedIcon fontSize="small" />, label: 'Operational analytics and reports' },
  { icon: <ShieldOutlinedIcon fontSize="small" />, label: 'Full audit trail of every action' },
];

export default function AuthLayout() {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Branding panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '44%',
          minWidth: 420,
          maxWidth: 560,
          p: 6,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(160deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: '#fff',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -80,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: alpha('#fff', 0.06),
            animation: `${float} 8s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            right: -80,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: alpha(theme.palette.secondary.main, 0.25),
            animation: `${float} 10s ease-in-out infinite`,
            animationDelay: '1s',
          }}
        />

        <Stack direction="row" alignItems="center" spacing={1} sx={{ position: 'relative' }}>
          <LocalHospitalRoundedIcon sx={{ fontSize: 30 }} />
          <Typography variant="h6" fontWeight={700}>
            Telemedicine Admin
          </Typography>
        </Stack>

        <Stack spacing={3} sx={{ position: 'relative' }}>
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: '2.25rem', lineHeight: 1.2 }}>
            Run your hospital&apos;s operations from one console.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 380 }}>
            Manage doctors, health officers, patients, appointments, and platform settings in one
            secure place.
          </Typography>
          <Stack spacing={1.5}>
            {HIGHLIGHTS.map((item) => (
              <Stack key={item.label} direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: alpha('#fff', 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="body2" fontWeight={600}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 3, sm: 6 },
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Stack spacing={3}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'flex', md: 'none' } }}>
              <LocalHospitalRoundedIcon color="primary" sx={{ fontSize: 26 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                Telemedicine Admin
              </Typography>
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: `0 24px 60px -30px ${alpha(theme.palette.primary.main, 0.35)}`,
              }}
            >
              <Outlet />
            </Paper>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

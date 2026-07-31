import { Link as RouterLink, Outlet } from 'react-router-dom';
import { Box, Container, Link, Paper, Stack, Typography, alpha, keyframes, useTheme } from '@mui/material';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-16px); }
`;

const HIGHLIGHTS = [
  { icon: <VideoCameraFrontOutlinedIcon fontSize="small" />, label: 'Secure video consultations' },
  { icon: <EventAvailableOutlinedIcon fontSize="small" />, label: 'Real-time appointment scheduling' },
  { icon: <ShieldOutlinedIcon fontSize="small" />, label: 'Role-based access for every team' },
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
            Telemedicine Platform
          </Typography>
        </Stack>

        <Stack spacing={3} sx={{ position: 'relative' }}>
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: '2.25rem', lineHeight: 1.2 }}>
            Healthcare that fits your patients&apos; lives.
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 380 }}>
            Hospitals, doctors, and patients run consultations, records, and scheduling on one
            secure platform.
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

        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            display: 'inline-flex',
            p: 2,
            bgcolor: alpha('#fff', 0.08),
            border: '1px solid',
            borderColor: alpha('#fff', 0.15),
            borderRadius: 3,
            alignItems: 'center',
            gap: 2,
            backdropFilter: 'blur(6px)',
          }}
        >
          <Stack direction="row" spacing={-1}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: theme.palette.primary.dark,
                  bgcolor: alpha('#fff', 0.22),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {String.fromCharCode(65 + i)}
              </Box>
            ))}
          </Stack>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              1,200+ healthcare professionals
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              trust this platform daily
            </Typography>
          </Box>
        </Paper>
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
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: 'flex', md: 'none' } }}>
                <LocalHospitalRoundedIcon color="primary" sx={{ fontSize: 26 }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  Telemedicine Platform
                </Typography>
              </Stack>
              <Link
                component={RouterLink}
                to="/"
                underline="none"
                color="text.secondary"
                variant="body2"
                fontWeight={600}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  ml: 'auto',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <ArrowBackRoundedIcon fontSize="small" />
                Back to home
              </Link>
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

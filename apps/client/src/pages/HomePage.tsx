import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
  keyframes,
} from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import SpeedIcon from '@mui/icons-material/Speed';
import LockIcon from '@mui/icons-material/Lock';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

// Animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Get started', href: '#get-started' },
];

const FEATURES = [
  {
    icon: <VideoCameraFrontOutlinedIcon />,
    title: '99%+ Connection Success',
    description: 'HD video consultations with multi-server TURN configuration. Works through any firewall.',
    accent: 'primary' as const,
    stat: '99%',
    statLabel: 'Success Rate',
  },
  {
    icon: <SpeedIcon />,
    title: 'Real-Time Everything',
    description: 'Instant notifications, live scheduling, and WebSocket-powered updates across all devices.',
    accent: 'secondary' as const,
    stat: '<50ms',
    statLabel: 'Response Time',
  },
  {
    icon: <MonitorHeartOutlinedIcon />,
    title: 'Complete Health Records',
    description: 'Vitals, prescriptions, lab reports, and consultation notes - all in one secure place.',
    accent: 'primary' as const,
    stat: '100%',
    statLabel: 'Digital Records',
  },
  {
    icon: <LockIcon />,
    title: 'Enterprise Security',
    description: 'JWT authentication, role-based access control, and encrypted data transmission.',
    accent: 'secondary' as const,
    stat: 'AES-256',
    statLabel: 'Encryption',
  },
];

const TRUST_INDICATORS = [
  { icon: <ShieldOutlinedIcon />, label: 'HIPAA Compliant Ready' },
  { icon: <CloudDoneIcon />, label: '99.9% Uptime' },
  { icon: <AssignmentTurnedInIcon />, label: 'SOC 2 Type II' },
  { icon: <LockIcon />, label: 'End-to-End Encrypted' },
];

const STEPS = [
  {
    title: 'Create your account',
    description: 'Register your hospital as an Admin, or register yourself as a Patient — both take under a minute.',
  },
  {
    title: 'Set up your care team',
    description: 'Admins add doctors and health officers; patients choose their hospital from a live directory.',
  },
  {
    title: 'Start consulting',
    description: 'Book appointments and move straight into secure video or in-person visits.',
  },
];

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <Chip
      label={children}
      size="small"
      sx={{
        bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
        color: 'primary.main',
        fontWeight: 700,
        letterSpacing: 0.6,
        fontSize: '0.7rem',
        textTransform: 'uppercase',
        px: 0.5,
      }}
    />
  );
}

function CallControl({ icon, tone = 'light' }: { icon: ReactNode; tone?: 'light' | 'danger' }) {
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: tone === 'danger' ? 'secondary.main' : alpha('#ffffff', 0.16),
        color: '#ffffff',
        '& svg': { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
  );
}

function ConsultationMockup() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        display: { xs: 'none', md: 'block' },
        height: 520,
      }}
    >
      {/* Ambient color blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: -40,
          right: -20,
          width: 260,
          height: 260,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.18)}, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -30,
          left: -10,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.14)}, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Main Laptop - Doctor's View */}
      <Box sx={{ position: 'absolute', top: 20, left: 0, right: 60, zIndex: 2 }}>
        <Box
          sx={{
            borderRadius: '18px',
            bgcolor: '#1e293b',
            p: '12px',
            boxShadow: `0 40px 80px -30px ${alpha(theme.palette.primary.main, 0.5)}`,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              borderRadius: '10px',
              overflow: 'hidden',
              aspectRatio: '16 / 10',
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            }}
          >
            {/* Doctor's face illustration */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}
            >
              {/* Doctor Avatar - Larger with professional look */}
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  bgcolor: alpha('#fff', 0.15),
                  border: '3px solid',
                  borderColor: alpha('#fff', 0.3),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  mb: 2,
                }}
              >
                {/* Doctor illustration - head */}
                <Box
                  sx={{
                    width: 60,
                    height: 75,
                    bgcolor: alpha('#fef3c7', 0.9),
                    borderRadius: '50% 50% 45% 45%',
                    position: 'relative',
                  }}
                >
                  {/* Eyes */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '35%',
                      left: '25%',
                      width: 8,
                      height: 8,
                      bgcolor: '#1e293b',
                      borderRadius: '50%',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '35%',
                      right: '25%',
                      width: 8,
                      height: 8,
                      bgcolor: '#1e293b',
                      borderRadius: '50%',
                    }}
                  />
                  {/* Smile */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: '25%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 20,
                      height: 10,
                      borderBottom: '2px solid #1e293b',
                      borderRadius: '0 0 20px 20px',
                    }}
                  />
                  {/* Glasses */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '32%',
                      left: '15%',
                      right: '15%',
                      height: 18,
                      border: '2px solid',
                      borderColor: alpha('#1e293b', 0.3),
                      borderRadius: '4px',
                    }}
                  />
                </Box>
                {/* Stethoscope indicator */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 30,
                    height: 30,
                    bgcolor: alpha('#fff', 0.2),
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocalHospitalRoundedIcon sx={{ fontSize: 16, color: '#fff' }} />
                </Box>
              </Box>

              {/* Doctor name with professional badge */}
              <Paper
                sx={{
                  px: 2,
                  py: 0.75,
                  bgcolor: alpha('#000', 0.3),
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha('#fff', 0.2),
                }}
              >
                <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MedicalServicesOutlinedIcon sx={{ fontSize: 16 }} />
                  Dr. Sarah Chen • Cardiology
                </Typography>
              </Paper>
            </Box>

            {/* Patient PIP (Picture-in-Picture) */}
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 72,
                height: 54,
                borderRadius: 2,
                bgcolor: alpha('#000', 0.4),
                border: '2px solid',
                borderColor: alpha('#fff', 0.3),
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Patient silhouette */}
              <Box
                sx={{
                  width: 28,
                  height: 35,
                  bgcolor: alpha('#fef3c7', 0.7),
                  borderRadius: '50% 50% 45% 45%',
                  position: 'relative',
                }}
              >
                {/* Simple face */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '40%',
                    left: '30%',
                    width: 4,
                    height: 4,
                    bgcolor: '#1e293b',
                    borderRadius: '50%',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '40%',
                    right: '30%',
                    width: 4,
                    height: 4,
                    bgcolor: '#1e293b',
                    borderRadius: '50%',
                  }}
                />
              </Box>
            </Box>

            {/* Live indicator */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                px: 1.5,
                py: 0.75,
                bgcolor: alpha('#000', 0.4),
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                border: '1px solid',
                borderColor: alpha('#fff', 0.2),
              }}
            >
              <FiberManualRecordIcon
                sx={{
                  fontSize: 10,
                  color: '#ef4444',
                  animation: `${pulse} 2s ease-in-out infinite`,
                }}
              />
              <Typography variant="caption" sx={{ color: alpha('#fff', 0.95), fontWeight: 700, letterSpacing: 0.5, fontSize: 11 }}>
                LIVE • 12:34
              </Typography>
            </Stack>

            {/* Call controls */}
            <Stack
              direction="row"
              spacing={1.5}
              justifyContent="center"
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 0,
                right: 0,
              }}
            >
              <CallControl icon={<MicRoundedIcon />} />
              <CallControl icon={<VideocamRoundedIcon />} />
              <CallControl icon={<CallEndRoundedIcon />} tone="danger" />
            </Stack>
          </Box>
        </Box>
        {/* Laptop base */}
        <Box
          sx={{
            height: 12,
            mx: '10%',
            bgcolor: '#334155',
            borderRadius: '0 0 8px 8px',
            boxShadow: `0 4px 12px ${alpha('#000', 0.2)}`,
          }}
        />
      </Box>

      {/* Mobile Phone - Patient's View */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 160,
          zIndex: 3,
          animation: `${float} 6s ease-in-out infinite`,
        }}
      >
        <Box
          sx={{
            bgcolor: '#1e293b',
            borderRadius: '32px',
            p: '10px',
            boxShadow: `0 30px 60px -20px ${alpha(theme.palette.primary.main, 0.6)}`,
          }}
        >
          <Box
            sx={{
              bgcolor: '#fff',
              borderRadius: '24px',
              overflow: 'hidden',
              aspectRatio: '9 / 19',
            }}
          >
            {/* Status bar */}
            <Box
              sx={{
                height: 28,
                bgcolor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 4,
                  bgcolor: alpha(theme.palette.text.primary, 0.1),
                  borderRadius: 2,
                }}
              />
            </Box>

            {/* Patient consultation screen */}
            <Box
              sx={{
                flex: 1,
                background: `linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)`,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {/* Patient avatar */}
              <Box sx={{ mt: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha('#fff', 0.2),
                    border: '3px solid',
                    borderColor: alpha('#fff', 0.4),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                  }}
                >
                  {/* Patient illustration */}
                  <Box
                    sx={{
                      width: 45,
                      height: 56,
                      bgcolor: alpha('#fef3c7', 0.9),
                      borderRadius: '50% 50% 45% 45%',
                      position: 'relative',
                    }}
                  >
                    {/* Eyes */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '35%',
                        left: '28%',
                        width: 6,
                        height: 6,
                        bgcolor: '#1e293b',
                        borderRadius: '50%',
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '35%',
                        right: '28%',
                        width: 6,
                        height: 6,
                        bgcolor: '#1e293b',
                        borderRadius: '50%',
                      }}
                    />
                    {/* Smile */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: '25%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 16,
                        height: 8,
                        borderBottom: '2px solid #1e293b',
                        borderRadius: '0 0 16px 16px',
                      }}
                    />
                  </Box>
                </Box>
                <Paper
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: alpha('#000', 0.2),
                    backdropFilter: 'blur(10px)',
                    borderRadius: 1.5,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#fff', fontWeight: 700, fontSize: 10 }}>
                    John Smith • Patient
                  </Typography>
                </Paper>
              </Box>

              {/* Appointment confirmed indicator */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  bgcolor: alpha('#fff', 0.95),
                  borderRadius: 2,
                  width: '100%',
                  mb: 2,
                }}
              >
                <Stack spacing={0.5} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.success.main, 0.15),
                      color: 'success.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: 10, textAlign: 'center' }}>
                    Consultation Active
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>
                    Connected to doctor
                  </Typography>
                </Stack>
              </Paper>
            </Box>

            {/* Navigation bar */}
            <Box
              sx={{
                height: 24,
                bgcolor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 4,
                  bgcolor: alpha(theme.palette.text.primary, 0.2),
                  borderRadius: 2,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Floating trust badge - Enhanced */}
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          top: 0,
          left: -16,
          px: 2,
          py: 1.25,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          zIndex: 4,
          animation: `${float} 5s ease-in-out infinite`,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: alpha(theme.palette.success.main, 0.15),
            color: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ShieldOutlinedIcon fontSize="small" />
        </Box>
        <Box>
          <Typography variant="caption" fontWeight={700} display="block" sx={{ lineHeight: 1.3 }}>
            99%+ Success Rate
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
            Encrypted & Secure
          </Typography>
        </Box>
      </Paper>

      {/* Floating vitals card - Enhanced */}
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          bottom: 140,
          left: -32,
          width: 180,
          p: 2,
          borderRadius: 3,
          zIndex: 4,
          animation: `${float} 7s ease-in-out infinite`,
          animationDelay: '0.5s',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: 'error.main',
              display: 'flex',
            }}
          >
            <MonitorHeartOutlinedIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              72 bpm
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>
              Heart Rate • Normal
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function HomePage() {
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default', overflowX: 'hidden' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar,
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 1.75 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocalHospitalRoundedIcon color="primary" sx={{ fontSize: 30 }} />
              <Typography variant="h6" fontWeight={700}>
                Telemedicine Platform
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={4}>
              <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    underline="none"
                    color="text.secondary"
                    variant="body2"
                    fontWeight={600}
                    sx={{ '&:hover': { color: 'primary.main' } }}
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Button component={RouterLink} to="/login" variant="text" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                  Sign in
                </Button>
                <Button component={RouterLink} to="/register" variant="contained">
                  Get started
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Hero */}
      <Box
        sx={{
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.background.default, 1)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)}, transparent 70%)`,
            animation: `${float} 6s ease-in-out infinite`,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)}, transparent 70%)`,
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '1s',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative' }}>
          <Grid container spacing={6} alignItems="center" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 10, md: 14 } }}>
            <Grid item xs={12} md={6}>
              <Stack
                spacing={4}
                sx={{
                  animation: `${slideInUp} 0.8s ease-out`,
                }}
              >
                <Stack spacing={2}>
                  <SectionEyebrow>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <FiberManualRecordIcon sx={{ fontSize: 8, animation: `${pulse} 2s ease-in-out infinite` }} />
                      <span>Live Now</span>
                    </Stack>
                  </SectionEyebrow>
                  <Typography
                    variant="h1"
                    fontWeight={900}
                    sx={{
                      fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                      lineHeight: 1.1,
                      letterSpacing: '-0.03em',
                      background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.primary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Healthcare Meets Patients Anywhere
                  </Typography>
                  <Typography variant="h5" color="text.secondary" fontWeight={400} sx={{ maxWidth: 540, lineHeight: 1.6 }}>
                    Enterprise telemedicine platform with <Box component="span" sx={{ color: 'primary.main', fontWeight: 700 }}>99%+ video success</Box>, complete EMR, and role-based workflows. Built for modern healthcare.
                  </Typography>
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    component={RouterLink}
                    to="/register-admin"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      py: 1.75,
                      px: 4,
                      fontSize: '1.1rem',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                      '&:hover': {
                        boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.45)}`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="outlined"
                    size="large"
                    sx={{
                      py: 1.75,
                      px: 4,
                      fontSize: '1.1rem',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>

                {/* Trust indicators */}
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap sx={{ pt: 2 }}>
                  {['14-day free trial', 'No credit card', 'Setup in 5 min'].map((point) => (
                    <Stack key={point} direction="row" spacing={1} alignItems="center">
                      <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {point}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                {/* Social proof */}
                <Paper
                  elevation={0}
                  sx={{
                    display: 'inline-flex',
                    p: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 2,
                    alignItems: 'center',
                    gap: 2,
                    mt: 1,
                  }}
                >
                  <Stack direction="row" spacing={-1}>
                    {[1, 2, 3, 4].map((i) => (
                      <Avatar
                        key={i}
                        sx={{
                          width: 36,
                          height: 36,
                          border: '2px solid',
                          borderColor: 'background.paper',
                          bgcolor: alpha(theme.palette.primary.main, 0.2),
                        }}
                      >
                        {String.fromCharCode(65 + i)}
                      </Avatar>
                    ))}
                  </Stack>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>
                      1,200+ Healthcare Professionals
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Trust our platform for daily consultations
                    </Typography>
                  </Box>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  animation: `${scaleIn} 0.8s ease-out`,
                  animationDelay: '0.2s',
                  animationFillMode: 'backwards',
                }}
              >
                <ConsultationMockup />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Get started */}
      <Box id="get-started" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <SectionEyebrow>Get started</SectionEyebrow>
            <Typography variant="h3" component="h2" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Choose how you&apos;d like to get started
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 520 }}>
              Every hospital starts with an Admin account. Every patient starts with their own.
            </Typography>
          </Stack>

          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={5}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                <CardActionArea component={RouterLink} to="/register-admin" sx={{ height: '100%', p: 1 }}>
                  <CardContent>
                    <Stack spacing={2.5} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: 'primary.main',
                          display: 'flex',
                        }}
                      >
                        <LocalHospitalRoundedIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Register as Admin
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Register your hospital and manage doctors, health officers, and patients.
                        </Typography>
                      </Box>
                      <Stack spacing={1}>
                        {[
                          'Hospital & Admin account created together',
                          'Add doctors and health officers',
                          'Full analytics & audit dashboard',
                        ].map((point) => (
                          <Stack key={point} direction="row" spacing={1} alignItems="center">
                            <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                            <Typography variant="body2">{point}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <Button variant="contained" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1 }}>
                        Get started
                      </Button>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={5}>
              <Card
                variant="outlined"
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                }}
              >
                <CardActionArea component={RouterLink} to="/register/patient" sx={{ height: '100%', p: 1 }}>
                  <CardContent>
                    <Stack spacing={2.5} alignItems="flex-start">
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          bgcolor: alpha(theme.palette.secondary.main, 0.14),
                          color: 'secondary.main',
                          display: 'flex',
                        }}
                      >
                        <PersonOutlineRoundedIcon sx={{ fontSize: 32 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight={700}>
                          Register as Patient
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Book appointments, join video consultations, and track your health records.
                        </Typography>
                      </Box>
                      <Stack spacing={1}>
                        {[
                          'Pick your hospital & book instantly',
                          'Video or in-person visits',
                          'Track vitals, prescriptions & records',
                        ].map((point) => (
                          <Stack key={point} direction="row" spacing={1} alignItems="center">
                            <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                            <Typography variant="body2">{point}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <Button variant="contained" color="secondary" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1 }}>
                        Get started
                      </Button>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="lg" id="features" sx={{ py: { xs: 10, md: 14 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 8 }}>
          <SectionEyebrow>Platform Features</SectionEyebrow>
          <Typography
            variant="h2"
            fontWeight={800}
            sx={{
              fontSize: { xs: '2rem', md: '3rem' },
              maxWidth: 700,
            }}
          >
            Enterprise-grade features that scale with your practice
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400} sx={{ maxWidth: 600 }}>
            Everything you need to deliver world-class remote healthcare
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {FEATURES.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={feature.title}>
              <Card
                elevation={0}
                sx={{
                  height: '100%',
                  p: 3,
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  animation: `${slideInUp} 0.6s ease-out`,
                  animationDelay: `${index * 0.1}s`,
                  animationFillMode: 'backwards',
                  '&:hover': {
                    borderColor: `${feature.accent}.main`,
                    transform: 'translateY(-8px)',
                    boxShadow: `0 12px 40px ${alpha(theme.palette[feature.accent].main, 0.15)}`,
                  },
                }}
              >
                <Stack spacing={2.5} height="100%">
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette[feature.accent].main, 0.1),
                        color: `${feature.accent}.main`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 28,
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box textAlign="right">
                      <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{ color: `${feature.accent}.main`, lineHeight: 1 }}
                      >
                        {feature.stat}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {feature.statLabel}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Trust indicators strip */}
        <Paper
          elevation={0}
          sx={{
            mt: 8,
            p: 4,
            borderRadius: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Grid container spacing={3} alignItems="center">
            {TRUST_INDICATORS.map((indicator) => (
              <Grid item xs={6} sm={3} key={indicator.label}>
                <Stack spacing={1} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {indicator.icon}
                  </Box>
                  <Typography variant="body2" fontWeight={700}>
                    {indicator.label}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>

      {/* How it works */}
      <Box id="how-it-works" sx={{ bgcolor: 'background.paper', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Stack spacing={1} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <SectionEyebrow>How it works</SectionEyebrow>
            <Typography variant="h3" component="h2" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Three steps to your first consultation
            </Typography>
          </Stack>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                top: 20,
                left: '16.6%',
                right: '16.6%',
                height: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.18),
              }}
            />
            <Grid container spacing={4} sx={{ position: 'relative' }}>
              {STEPS.map((step, index) => (
                <Grid item xs={12} md={4} key={step.title}>
                  <Stack spacing={1.5}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        boxShadow: `0 0 0 6px ${theme.palette.background.paper}`,
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {step.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* CTA banner */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 6,
            p: { xs: 4, md: 7 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: '#fff',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: alpha(theme.palette.secondary.main, 0.25),
            }}
          />
          <Stack spacing={2.5} alignItems={{ xs: 'flex-start', md: 'center' }} textAlign={{ xs: 'left', md: 'center' }} sx={{ position: 'relative' }}>
            <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Ready to bring your hospital online?
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85, maxWidth: 520 }}>
              Set up your care team in minutes and start holding secure consultations today.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <Button
                component={RouterLink}
                to="/register-admin"
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Register your hospital
              </Button>
              <Button
                component={RouterLink}
                to="/register/patient"
                variant="outlined"
                size="large"
                sx={{
                  color: '#fff',
                  borderColor: alpha('#fff', 0.5),
                  '&:hover': { borderColor: '#fff', bgcolor: alpha('#fff', 0.08) },
                }}
              >
                I&apos;m a patient
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>

      {/* Footer */}
      <Container maxWidth="lg">
        <Divider />
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 4 }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <LocalHospitalRoundedIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              &copy; {new Date().getFullYear()} Telemedicine Platform
            </Typography>
          </Stack>
          <Stack direction="row" spacing={3} alignItems="center">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                variant="body2"
                color="text.secondary"
                underline="none"
                sx={{ display: { xs: 'none', sm: 'inline' }, '&:hover': { color: 'primary.main' } }}
              >
                {link.label}
              </Link>
            ))}
            <Link component={RouterLink} to="/login" variant="body2" fontWeight={600}>
              Sign in to your account
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Avatar, Box, Button, Link, Stack, Typography, alpha } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { loginSchema, type LoginInput } from '@telemedicine/validation';
import { ROLE_DASHBOARD_PATH } from '@telemedicine/constants';
import { FormTextField } from '@telemedicine/ui';
import { useLoginMutation, useRequestAdminHandoffMutation } from '../authApi';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials } from '../authSlice';

const ADMIN_CONSOLE_URL = import.meta.env.VITE_ADMIN_CONSOLE_URL ?? 'http://localhost:5184';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [requestAdminHandoff, { isLoading: isHandingOff }] = useRequestAdminHandoffMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Admins sign in here too — this is the one login page for every role. The Admin
  // Console is a separate deployed app with its own session, so instead of storing
  // this token locally (it has no admin routes to use it in) or making the admin
  // type their password again there, we exchange it for a one-time ticket the
  // console redeems for its own real session — one password entry, total.
  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    try {
      const { user, accessToken } = await login(values).unwrap();

      if (user.role === 'admin') {
        const { ticket } = await requestAdminHandoff(accessToken).unwrap();
        const url = new URL('/handoff', ADMIN_CONSOLE_URL);
        url.searchParams.set('ticket', ticket);
        window.location.href = url.toString();
        return;
      }

      dispatch(setCredentials({ user, accessToken }));
      navigate(ROLE_DASHBOARD_PATH[user.role]);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to sign in';
      setFormError(message);
    }
  };

  return (
    <Stack component="form" spacing={3} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={1.5} alignItems="flex-start">
        <Avatar
          sx={{
            width: 48,
            height: 48,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
          }}
        >
          <LockRoundedIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to continue to your dashboard.
          </Typography>
        </Box>
      </Stack>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Stack spacing={2.5}>
        <FormTextField name="email" control={control} label="Email" type="email" autoFocus />
        <FormTextField name="password" control={control} label="Password" type="password" />
      </Stack>
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoggingIn || isHandingOff}
        endIcon={<ArrowForwardRoundedIcon />}
      >
        {isHandingOff ? 'Taking you to the Admin Console…' : 'Sign in'}
      </Button>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/register" fontWeight={600}>
          Register
        </Link>
      </Typography>
    </Stack>
  );
}

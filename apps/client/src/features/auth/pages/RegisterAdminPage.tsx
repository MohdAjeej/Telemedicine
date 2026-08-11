import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Avatar, Box, Button, Link, Stack, Typography, alpha } from '@mui/material';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { registerAdminSchema, type RegisterAdminInput } from '@telemedicine/validation';
import { FormTextField } from '@telemedicine/ui';
import { useRegisterAdminMutation } from '../authApi';

const ADMIN_CONSOLE_URL = import.meta.env.VITE_ADMIN_CONSOLE_URL ?? 'http://localhost:5184';

export default function RegisterAdminPage() {
  const [registerAdmin, { isLoading }] = useRegisterAdminMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

  const { control, handleSubmit } = useForm<RegisterAdminInput>({
    resolver: zodResolver(registerAdminSchema),
    defaultValues: { hospitalName: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterAdminInput) => {
    setFormError(null);
    try {
      // The admin console is a separate deployed app with its own session —
      // registering here does not sign you into it, so we don't store this
      // response's tokens locally. The admin signs in again at the console.
      await registerAdmin(values).unwrap();
      setRegistered(true);
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to register hospital';
      setFormError(message);
    }
  };

  if (registered) {
    return (
      <Stack spacing={3}>
        <Stack spacing={1.5} alignItems="flex-start">
          <Avatar sx={{ width: 48, height: 48, bgcolor: (theme) => alpha(theme.palette.success.main, 0.12), color: 'success.main' }}>
            <CheckCircleRoundedIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Hospital created
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your hospital and admin account are ready. Manage them from the Admin Console.
            </Typography>
          </Box>
        </Stack>
        <Button
          variant="contained"
          size="large"
          href={ADMIN_CONSOLE_URL}
          endIcon={<ArrowForwardRoundedIcon />}
        >
          Go to Admin Console
        </Button>
      </Stack>
    );
  }

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
          <LocalHospitalRoundedIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Register your hospital
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This creates your hospital and an Admin account to manage it. One admin manages
            exactly one hospital.
          </Typography>
        </Box>
      </Stack>
      {formError && <Alert severity="error">{formError}</Alert>}
      <FormTextField name="hospitalName" control={control} label="Hospital name" autoFocus />
      <FormTextField name="email" control={control} label="Email" type="email" />
      <FormTextField name="password" control={control} label="Password" type="password" />
      <FormTextField
        name="confirmPassword"
        control={control}
        label="Confirm password"
        type="password"
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        endIcon={<ArrowForwardRoundedIcon />}
      >
        Register hospital
      </Button>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          Sign in
        </Link>
      </Typography>
    </Stack>
  );
}

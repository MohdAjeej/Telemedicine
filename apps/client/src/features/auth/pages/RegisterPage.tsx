import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Link,
  MenuItem,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import { registerSchema, type RegisterInput } from '@telemedicine/validation';
import { FormTextField } from '@telemedicine/ui';
import { Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
import { useRegisterMutation } from '../authApi';

const ROLE_OPTIONS: Array<{ value: RegisterInput['role']; label: string }> = [
  { value: 'patient', label: 'Patient' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'health_officer', label: 'Health Officer' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'patient',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    try {
      await registerUser(values).unwrap();
      navigate('/login', { state: { justRegistered: true } });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to register';
      setFormError(message);
    }
  };

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={700}>
        Create your account
      </Typography>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormTextField name="firstName" control={control} label="First name" />
        <FormTextField name="lastName" control={control} label="Last name" />
      </Stack>
      <FormTextField name="email" control={control} label="Email" type="email" />
      <FormTextField name="phone" control={control} label="Phone (optional)" />
      <Controller
        name="role"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="I am a"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          >
            {ROLE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
      <FormTextField name="password" control={control} label="Password" type="password" />
      <FormTextField
        name="confirmPassword"
        control={control}
        label="Confirm password"
        type="password"
      />
      <Button type="submit" variant="contained" size="large" disabled={isLoading}>
        Create account
      </Button>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login">
          Sign in
        </Link>
      </Typography>
    </Stack>
  );
}

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@telemedicine/validation';
import { FormTextField } from '@telemedicine/ui';
import { useForgotPasswordMutation } from '../authApi';

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);

  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword(values).unwrap();
    setSent(true);
  };

  if (sent) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5" fontWeight={700}>
          Check your email
        </Typography>
        <Alert severity="success">
          If that email is registered, a password reset link is on its way.
        </Alert>
        <Link component={RouterLink} to="/login">
          Back to sign in
        </Link>
      </Stack>
    );
  }

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={700}>
        Forgot password
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Enter your account email and we&apos;ll send you a reset link.
      </Typography>
      <FormTextField name="email" control={control} label="Email" type="email" autoFocus />
      <Button type="submit" variant="contained" size="large" disabled={isLoading}>
        Send reset link
      </Button>
      <Link component={RouterLink} to="/login" variant="body2">
        Back to sign in
      </Link>
    </Stack>
  );
}

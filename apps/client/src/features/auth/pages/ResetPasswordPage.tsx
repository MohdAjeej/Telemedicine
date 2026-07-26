import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { resetPasswordSchema, type ResetPasswordInput } from '@telemedicine/validation';
import { FormTextField } from '@telemedicine/ui';
import { useResetPasswordMutation } from '../authApi';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    if (!token) return;
    setFormError(null);
    try {
      await resetPassword({ token, password: values.password }).unwrap();
      navigate('/login', { state: { passwordReset: true } });
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ??
        'Unable to reset password. The link may have expired.';
      setFormError(message);
    }
  };

  return (
    <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h5" fontWeight={700}>
        Choose a new password
      </Typography>
      {formError && <Alert severity="error">{formError}</Alert>}
      <FormTextField name="password" control={control} label="New password" type="password" />
      <FormTextField
        name="confirmPassword"
        control={control}
        label="Confirm new password"
        type="password"
      />
      <Button type="submit" variant="contained" size="large" disabled={isLoading}>
        Reset password
      </Button>
    </Stack>
  );
}

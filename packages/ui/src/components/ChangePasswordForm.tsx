import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Alert, Button, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';

export interface ChangePasswordFormProps {
  onSubmit: (values: { currentPassword: string; newPassword: string }) => Promise<unknown>;
}

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const submit = async (values: ChangePasswordValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onSubmit({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      reset();
      setSaved(true);
    } catch (err) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ?? 'Failed to change password';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(submit)} sx={{ maxWidth: 480 }}>
        <Typography variant="h6" fontWeight={600}>
          Change Password
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <Controller
          name="currentPassword"
          control={control}
          rules={{ required: 'Current password is required' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Current password"
              type="password"
              fullWidth
              error={!!errors.currentPassword}
              helperText={errors.currentPassword?.message}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={control}
          rules={{
            required: 'New password is required',
            minLength: { value: 8, message: 'Must be at least 8 characters' },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="New password"
              type="password"
              fullWidth
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: 'Please confirm your new password',
            validate: (value) => value === watch('newPassword') || 'Passwords do not match',
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Confirm new password"
              type="password"
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          )}
        />
        <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
          {isSubmitting ? 'Updating...' : 'Update password'}
        </Button>
      </Stack>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Password updated
        </Alert>
      </Snackbar>
    </Paper>
  );
}

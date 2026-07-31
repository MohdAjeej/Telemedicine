import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Avatar, Box, Button, Stack, Typography, alpha } from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { loginSchema, type LoginInput } from '@telemedicine/validation';
import { FormTextField } from '@telemedicine/ui';
import { useLoginMutation } from '../authApi';
import { useAppDispatch } from '../../../app/hooks';
import { setCredentials, logout } from '../authSlice';

const WRONG_ROLE_MESSAGE = 'This console is for hospital administrators only.';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [formError, setFormError] = useState<string | null>(
    (location.state as { reason?: string } | null)?.reason === 'wrong-role'
      ? WRONG_ROLE_MESSAGE
      : null,
  );

  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginInput) => {
    setFormError(null);
    try {
      const { user, accessToken } = await login(values).unwrap();

      if (user.role !== 'admin') {
        dispatch(logout());
        setFormError(WRONG_ROLE_MESSAGE);
        return;
      }

      dispatch(setCredentials({ user, accessToken }));
      navigate('/');
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
            Admin Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in with your hospital administrator account.
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
        disabled={isLoading}
        endIcon={<ArrowForwardRoundedIcon />}
      >
        Sign in
      </Button>
    </Stack>
  );
}

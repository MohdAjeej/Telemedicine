import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Avatar, Box, Button, Link, MenuItem, Stack, TextField, Typography, alpha } from '@mui/material';
import PersonAddAltRoundedIcon from '@mui/icons-material/PersonAddAltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { registerSchema, type RegisterInput } from '@telemedicine/validation';
import { FormTextField } from '@telemedicine/ui';
import { useAppDispatch } from '../../../app/hooks';
import { useListHospitalsQuery } from '../../hospital/hospitalApi';
import { useRegisterMutation } from '../authApi';
import { setCredentials } from '../authSlice';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const { data: hospitals, isLoading: isLoadingHospitals } = useListHospitalsQuery({
    limit: 100,
    status: 'active',
  });

  const { control, handleSubmit } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      age: undefined,
      hospitalId: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null);
    try {
      const { user, accessToken } = await registerUser(values).unwrap();
      dispatch(setCredentials({ user, accessToken }));
      navigate('/app/patient');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to register';
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
            bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.14),
            color: 'secondary.main',
          }}
        >
          <PersonAddAltRoundedIcon />
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Create your patient account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Book appointments and manage your care in one place.
          </Typography>
        </Box>
      </Stack>
      {formError && <Alert severity="error">{formError}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormTextField name="firstName" control={control} label="Name" />
        <FormTextField name="lastName" control={control} label="Last name" />
      </Stack>
      <FormTextField name="age" control={control} label="Age" type="number" />
      <Controller
        name="hospitalId"
        control={control}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            label="Hospital"
            fullWidth
            disabled={isLoadingHospitals}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          >
            {(hospitals?.items ?? []).map((hospital) => (
              <MenuItem key={hospital._id} value={hospital._id}>
                {hospital.name}
              </MenuItem>
            ))}
          </TextField>
        )}
      />
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
        color="secondary"
        size="large"
        disabled={isLoading}
        endIcon={<ArrowForwardRoundedIcon />}
      >
        Create account
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

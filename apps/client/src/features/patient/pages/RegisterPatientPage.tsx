import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import { FormTextField, PageHeader } from '@telemedicine/ui';
import { useRegisterPatientMutation } from '../patientApi';

interface RegisterPatientForm {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: 'male' | 'female' | 'other' | '';
}

export default function RegisterPatientPage() {
  const [registerPatient, { isLoading }] = useRegisterPatientMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { control, handleSubmit, reset } = useForm<RegisterPatientForm>({
    defaultValues: { email: '', firstName: '', lastName: '', phone: '', gender: '' },
  });

  const onSubmit = async (values: RegisterPatientForm) => {
    setFormError(null);
    setSuccess(false);
    try {
      await registerPatient({ ...values }).unwrap();
      reset();
      setSuccess(true);
    } catch (error) {
      setFormError(
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to register patient',
      );
    }
  };

  return (
    <>
      <PageHeader title="Register Patient" subtitle="Front-desk intake for a new patient" />
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ maxWidth: 480 }}
      >
        {formError && <Alert severity="error">{formError}</Alert>}
        {success && <Alert severity="success">Patient registered. They'll receive an email to set their password.</Alert>}
        <FormTextField name="firstName" control={control} label="First name" />
        <FormTextField name="lastName" control={control} label="Last name" />
        <FormTextField name="email" control={control} label="Email" type="email" />
        <FormTextField name="phone" control={control} label="Phone" />
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Gender" fullWidth>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
          )}
        />
        <Button type="submit" variant="contained" size="large" disabled={isLoading}>
          Register patient
        </Button>
      </Stack>
    </>
  );
}

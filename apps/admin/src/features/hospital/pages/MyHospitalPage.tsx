import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, MenuItem, Paper, Snackbar, Stack, TextField } from '@mui/material';
import { FormTextField, LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { hospitalSchema, type HospitalInput } from '@telemedicine/validation';
import { useGetMyAdminProfileQuery } from '../../admin/adminApi';
import { useGetHospitalQuery, useUpdateHospitalMutation } from '../hospitalApi';

export default function MyHospitalPage() {
  const { data: admin } = useGetMyAdminProfileQuery();
  const { data: hospital, isLoading } = useGetHospitalQuery(admin?.hospitalId ?? '', {
    skip: !admin?.hospitalId,
  });
  const [updateHospital, { isLoading: isSaving }] = useUpdateHospitalMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset } = useForm<HospitalInput>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: '',
      registrationNumber: '',
      type: 'hospital',
      phone: '',
      email: '',
      website: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (hospital) {
      reset({
        name: hospital.name,
        registrationNumber: hospital.registrationNumber,
        type: hospital.type,
        phone: hospital.contact?.phone ?? '',
        email: hospital.contact?.email ?? '',
        website: hospital.contact?.website ?? '',
        street: hospital.address?.street ?? '',
        city: hospital.address?.city ?? '',
        state: hospital.address?.state ?? '',
        zipCode: hospital.address?.zipCode ?? '',
        country: hospital.address?.country ?? '',
      });
    }
  }, [hospital, reset]);

  if (isLoading || !hospital) return <LoadingSpinner label="Loading your hospital..." fullHeight />;

  const onSubmit = async (values: HospitalInput) => {
    setFormError(null);
    try {
      await updateHospital({ id: hospital._id, body: values }).unwrap();
      setSaved(true);
    } catch (error) {
      setFormError((error as { data?: { message?: string } })?.data?.message ?? 'Unable to update hospital');
    }
  };

  return (
    <>
      <PageHeader title="My Hospital" subtitle="Manage your hospital's profile" />
      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <FormTextField name="name" control={control} label="Name" />
          <FormTextField name="registrationNumber" control={control} label="Registration number" />
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Type" fullWidth>
                <MenuItem value="clinic">Clinic</MenuItem>
                <MenuItem value="hospital">Hospital</MenuItem>
                <MenuItem value="multi_specialty">Multi-specialty</MenuItem>
              </TextField>
            )}
          />
          <FormTextField name="phone" control={control} label="Phone" />
          <FormTextField name="email" control={control} label="Email" type="email" />
          <FormTextField name="website" control={control} label="Website (optional)" />
          <FormTextField name="street" control={control} label="Street" />
          <FormTextField name="city" control={control} label="City" />
          <FormTextField name="state" control={control} label="State" />
          <FormTextField name="zipCode" control={control} label="Zip code" />
          <FormTextField name="country" control={control} label="Country" />
          <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
            Save changes
          </Button>
        </Stack>
      </Paper>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Hospital updated
        </Alert>
      </Snackbar>
    </>
  );
}

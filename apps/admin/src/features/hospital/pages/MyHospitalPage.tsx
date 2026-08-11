import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Box, Button, Grid, MenuItem, Paper, Snackbar, TextField } from '@mui/material';
import { FormTextField, LoadingSpinner } from '@telemedicine/ui';
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Page identity ("Admin Console / My Hospital") already shown in the app
          bar — no need to repeat a large title here too, which just costs
          vertical space this single-screen form doesn't have to spare. */}
      <Paper
        component="form"
        variant="outlined"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ p: 2.5, maxWidth: 760 }}
      >
        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormTextField name="name" control={control} label="Name" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="registrationNumber" control={control} label="Registration number" />
          </Grid>
          <Grid item xs={12} sm={6}>
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
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="phone" control={control} label="Phone" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="email" control={control} label="Email" type="email" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="website" control={control} label="Website (optional)" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="street" control={control} label="Street" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="city" control={control} label="City" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="state" control={control} label="State" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="zipCode" control={control} label="Zip code" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="country" control={control} label="Country" />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" disabled={isSaving} sx={{ mt: 2.5 }}>
          Save changes
        </Button>
      </Paper>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Hospital updated
        </Alert>
      </Snackbar>
    </Box>
  );
}

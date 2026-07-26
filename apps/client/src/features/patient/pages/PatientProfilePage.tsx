import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Snackbar, Stack } from '@mui/material';
import { FormTextField, LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { useGetMyPatientProfileQuery, useUpdateMyPatientProfileMutation } from '../patientApi';

interface PatientProfileForm {
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export default function PatientProfilePage() {
  const { data, isLoading } = useGetMyPatientProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyPatientProfileMutation();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset } = useForm<PatientProfileForm>({
    defaultValues: { bloodGroup: '', emergencyContactName: '', emergencyContactPhone: '' },
  });

  useEffect(() => {
    if (data) {
      reset({
        bloodGroup: data.bloodGroup ?? '',
        emergencyContactName: data.emergencyContact?.name ?? '',
        emergencyContactPhone: data.emergencyContact?.phone ?? '',
      });
    }
  }, [data, reset]);

  if (isLoading) return <LoadingSpinner label="Loading your profile..." />;

  const onSubmit = async (values: PatientProfileForm) => {
    await updateProfile({ ...values }).unwrap();
    setSaved(true);
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your health profile details" />
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480 }}>
        <FormTextField name="bloodGroup" control={control} label="Blood group" />
        <FormTextField name="emergencyContactName" control={control} label="Emergency contact name" />
        <FormTextField name="emergencyContactPhone" control={control} label="Emergency contact phone" />
        <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
          Save changes
        </Button>
      </Stack>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Profile updated
        </Alert>
      </Snackbar>
    </>
  );
}

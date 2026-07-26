import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Snackbar, Stack } from '@mui/material';
import { FormTextField, LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { useGetMyDoctorProfileQuery, useUpdateMyDoctorProfileMutation } from '../doctorApi';

interface DoctorProfileForm {
  bio: string;
  department: string;
  consultationFee: number;
  experienceYears: number;
}

export default function DoctorProfilePage() {
  const { data, isLoading } = useGetMyDoctorProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyDoctorProfileMutation();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset } = useForm<DoctorProfileForm>({
    defaultValues: { bio: '', department: '', consultationFee: 0, experienceYears: 0 },
  });

  useEffect(() => {
    if (data) {
      reset({
        bio: data.bio ?? '',
        department: data.department ?? '',
        consultationFee: data.consultationFee,
        experienceYears: data.experienceYears,
      });
    }
  }, [data, reset]);

  if (isLoading) return <LoadingSpinner label="Loading your profile..." />;

  const onSubmit = async (values: DoctorProfileForm) => {
    await updateProfile({ ...values }).unwrap();
    setSaved(true);
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Keep your professional details up to date" />
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480 }}>
        <FormTextField name="department" control={control} label="Department" />
        <FormTextField name="bio" control={control} label="Bio" multiline minRows={3} />
        <FormTextField name="consultationFee" control={control} label="Consultation fee" type="number" />
        <FormTextField name="experienceYears" control={control} label="Years of experience" type="number" />
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

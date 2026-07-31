import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { ChangePasswordForm, FormTextField, LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setUser } from '../../auth/authSlice';
import { useChangePasswordMutation, useUpdateMeMutation } from '../../auth/authApi';
import { useGetMyPatientProfileQuery, useUpdateMyPatientProfileMutation } from '../patientApi';

interface AccountDetailsForm {
  firstName: string;
  lastName: string;
  phone: string;
}

interface PatientProfileForm {
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

function AccountDetailsSection() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset } = useForm<AccountDetailsForm>({
    defaultValues: { firstName: '', lastName: '', phone: '' },
  });

  useEffect(() => {
    if (user) {
      reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone ?? '' });
    }
  }, [user, reset]);

  const onSubmit = async (values: AccountDetailsForm) => {
    const updated = await updateMe(values).unwrap();
    dispatch(setUser(updated));
    setSaved(true);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480 }}>
        <Typography variant="h6" fontWeight={600}>
          Account Details
        </Typography>
        <FormTextField name="firstName" control={control} label="First name" />
        <FormTextField name="lastName" control={control} label="Last name" />
        <FormTextField name="phone" control={control} label="Phone" />
        <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
          Save changes
        </Button>
      </Stack>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Account details updated
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export default function PatientProfilePage() {
  const { data, isLoading } = useGetMyPatientProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyPatientProfileMutation();
  const [changePassword] = useChangePasswordMutation();
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
      <PageHeader title="My Profile" subtitle="Manage your account and health profile details" />
      <Stack spacing={3}>
        <AccountDetailsSection />

        <Paper sx={{ p: 3 }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480 }}>
            <Typography variant="h6" fontWeight={600}>
              Health Profile
            </Typography>
            <FormTextField name="bloodGroup" control={control} label="Blood group" />
            <FormTextField name="emergencyContactName" control={control} label="Emergency contact name" />
            <FormTextField name="emergencyContactPhone" control={control} label="Emergency contact phone" />
            <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
              Save changes
            </Button>
          </Stack>
        </Paper>

        <ChangePasswordForm
          onSubmit={(values) => changePassword(values).unwrap()}
        />
      </Stack>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Profile updated
        </Alert>
      </Snackbar>
    </>
  );
}

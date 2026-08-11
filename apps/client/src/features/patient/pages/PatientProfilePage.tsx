import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Grid, Paper, Snackbar, Stack, Tab, Tabs, Typography } from '@mui/material';
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
    <Paper sx={{ p: 2.5 }}>
      <Stack component="form" spacing={1.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 640 }}>
        <Typography variant="h6" fontWeight={600}>
          Account Details
        </Typography>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <FormTextField name="firstName" control={control} label="First name" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="lastName" control={control} label="Last name" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormTextField name="phone" control={control} label="Phone" />
          </Grid>
        </Grid>
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
  const [tab, setTab] = useState<'account' | 'health' | 'security'>('account');

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
      <Tabs
        value={tab}
        onChange={(_e, value) => setTab(value)}
        sx={{ mb: 2, minHeight: 40, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { minHeight: 40, py: 0.5 } }}
      >
        <Tab label="Account" value="account" />
        <Tab label="Health Profile" value="health" />
        <Tab label="Security" value="security" />
      </Tabs>

      {tab === 'account' && <AccountDetailsSection />}

      {tab === 'health' && (
        <Paper sx={{ p: 2.5 }}>
          <Stack component="form" spacing={1.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 640 }}>
            <Typography variant="h6" fontWeight={600}>
              Health Profile
            </Typography>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={6}>
                <FormTextField name="bloodGroup" control={control} label="Blood group" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormTextField name="emergencyContactName" control={control} label="Emergency contact name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormTextField name="emergencyContactPhone" control={control} label="Emergency contact phone" />
              </Grid>
            </Grid>
            <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
              Save changes
            </Button>
          </Stack>
        </Paper>
      )}

      {tab === 'security' && (
        <ChangePasswordForm onSubmit={(values) => changePassword(values).unwrap()} />
      )}
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Profile updated
        </Alert>
      </Snackbar>
    </>
  );
}

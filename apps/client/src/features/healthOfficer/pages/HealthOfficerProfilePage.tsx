import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, Grid, Paper, Snackbar, Stack, Tab, Tabs, Typography } from '@mui/material';
import { ChangePasswordForm, FormTextField, LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setUser } from '../../auth/authSlice';
import { useChangePasswordMutation, useUpdateMeMutation } from '../../auth/authApi';
import { useGetMyHealthOfficerProfileQuery, useUpdateMyHealthOfficerProfileMutation } from '../healthOfficerApi';

interface AccountDetailsForm {
  firstName: string;
  lastName: string;
  phone: string;
}

interface HealthOfficerProfileForm {
  certifications: string;
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

export default function HealthOfficerProfilePage() {
  const { data, isLoading } = useGetMyHealthOfficerProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyHealthOfficerProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'account' | 'clinic' | 'security'>('account');

  const { control, handleSubmit, reset } = useForm<HealthOfficerProfileForm>({
    defaultValues: { certifications: '' },
  });

  useEffect(() => {
    if (data) {
      reset({ certifications: (data.certifications ?? []).join(', ') });
    }
  }, [data, reset]);

  if (isLoading) return <LoadingSpinner label="Loading your profile..." />;

  const onSubmit = async (values: HealthOfficerProfileForm) => {
    const certifications = values.certifications
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    await updateProfile({ certifications }).unwrap();
    setSaved(true);
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Manage your account and clinic details" />
      <Tabs
        value={tab}
        onChange={(_e, value) => setTab(value)}
        sx={{ mb: 2, minHeight: 40, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { minHeight: 40, py: 0.5 } }}
      >
        <Tab label="Account" value="account" />
        <Tab label="Clinic Details" value="clinic" />
        <Tab label="Security" value="security" />
      </Tabs>

      {tab === 'account' && <AccountDetailsSection />}

      {tab === 'clinic' && (
        <Paper sx={{ p: 2.5 }}>
          <Stack component="form" spacing={1.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 640 }}>
            <Typography variant="h6" fontWeight={600}>
              Clinic Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assigned clinic: {data?.assignedClinic ?? 'Not assigned yet'} &nbsp;·&nbsp; Employee ID:{' '}
              {data?.employeeId ?? '—'}
            </Typography>
            <FormTextField
              name="certifications"
              control={control}
              label="Certifications"
              helperText="Comma-separated, e.g. BLS, ACLS"
              multiline
              minRows={2}
            />
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

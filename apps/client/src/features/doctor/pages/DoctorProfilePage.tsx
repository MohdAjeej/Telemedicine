import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Alert, Button, MenuItem, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { ChangePasswordForm, FormMultiSelect, FormTextField, LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { SPECIALTIES } from '@telemedicine/constants';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { setUser } from '../../auth/authSlice';
import { useChangePasswordMutation, useUpdateMeMutation } from '../../auth/authApi';
import { useGetMyDoctorProfileQuery, useUpdateMyDoctorProfileMutation } from '../doctorApi';

interface AccountDetailsForm {
  firstName: string;
  lastName: string;
  phone: string;
}

interface DoctorProfileForm {
  specialization: string[];
  qualifications: string;
  bio: string;
  department: string;
  consultationFee: number;
  experienceYears: number;
  age: string;
  gender: string;
  bloodGroup: string;
  address: string;
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

export default function DoctorProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data, isLoading } = useGetMyDoctorProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyDoctorProfileMutation();
  const [changePassword] = useChangePasswordMutation();
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset } = useForm<DoctorProfileForm>({
    defaultValues: {
      specialization: [],
      qualifications: '',
      bio: '',
      department: '',
      consultationFee: 0,
      experienceYears: 0,
      age: '',
      gender: '',
      bloodGroup: '',
      address: '',
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        specialization: data.specialization,
        qualifications: data.qualifications.join(', '),
        bio: data.bio ?? '',
        department: data.department ?? '',
        consultationFee: data.consultationFee,
        experienceYears: data.experienceYears,
        age: data.age !== undefined ? String(data.age) : '',
        gender: data.gender ?? '',
        bloodGroup: data.bloodGroup ?? '',
        address: data.address ?? '',
      });
    }
  }, [data, reset]);

  if (isLoading) return <LoadingSpinner label="Loading your profile..." />;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hospital = data?.hospitalId as any;

  const onSubmit = async (values: DoctorProfileForm) => {
    await updateProfile({
      specialization: values.specialization,
      qualifications: values.qualifications.split(',').map((s) => s.trim()).filter(Boolean),
      bio: values.bio,
      department: values.department,
      consultationFee: values.consultationFee,
      experienceYears: values.experienceYears,
      age: values.age ? Number(values.age) : undefined,
      gender: values.gender || undefined,
      bloodGroup: values.bloodGroup || undefined,
      address: values.address || undefined,
    }).unwrap();
    setSaved(true);
  };

  return (
    <>
      <PageHeader title="My Profile" subtitle="Keep your account and professional details up to date" />
      <Stack spacing={3}>
        <AccountDetailsSection />

        <Paper sx={{ p: 3 }}>
          <Stack spacing={0.75} sx={{ maxWidth: 480 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              Contact & Hospital
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Email:</strong> {user?.email ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Hospital Name:</strong> {hospital?.name ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Hospital Address:</strong>{' '}
              {hospital?.address
                ? [hospital.address.street, hospital.address.city, hospital.address.state, hospital.address.country]
                    .filter(Boolean)
                    .join(', ')
                : '—'}
            </Typography>
          </Stack>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 480 }}>
            <Typography variant="h6" fontWeight={600}>
              Professional Details
            </Typography>
            <FormTextField name="department" control={control} label="Department" />
            <FormMultiSelect name="specialization" control={control} label="Specialist" options={SPECIALTIES} required />
            <FormTextField name="qualifications" control={control} label="Degree" helperText="Comma-separated, e.g. MBBS, MD" />
            <FormTextField name="experienceYears" control={control} label="Experience (years)" type="number" />
            <FormTextField name="bio" control={control} label="Bio" multiline minRows={3} />
            <FormTextField name="consultationFee" control={control} label="Consultation fee" type="number" />

            <Typography variant="subtitle2" fontWeight={600} sx={{ pt: 1 }}>
              Personal Details
            </Typography>
            <FormTextField name="age" control={control} label="Age" type="number" />
            <FormTextField name="gender" control={control} label="Gender" select>
              <MenuItem value="">Not specified</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </FormTextField>
            <FormTextField name="bloodGroup" control={control} label="Blood Group" />
            <FormTextField name="address" control={control} label="Address" />

            <Button type="submit" variant="contained" disabled={isSaving} sx={{ alignSelf: 'flex-start' }}>
              Save changes
            </Button>
          </Stack>
        </Paper>

        <ChangePasswordForm onSubmit={(values) => changePassword(values).unwrap()} />
      </Stack>
      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)}>
        <Alert severity="success" onClose={() => setSaved(false)}>
          Profile updated
        </Alert>
      </Snackbar>
    </>
  );
}

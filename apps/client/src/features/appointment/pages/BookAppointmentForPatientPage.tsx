import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';
import { bookAppointmentSchema, type BookAppointmentInput } from '@telemedicine/validation';
import { FormTextField, PageHeader } from '@telemedicine/ui';
import type { Doctor, Patient, User } from '@telemedicine/types';
import { useGetMyHealthOfficerProfileQuery } from '../../healthOfficer/healthOfficerApi';
import { useListPatientsQuery } from '../../patient/patientApi';
import { useListDoctorsQuery } from '../../doctor/doctorApi';
import { useBookAppointmentMutation } from '../appointmentApi';

function patientUser(patient: Patient): Partial<User> {
  return (patient.userId as unknown as User) ?? {};
}

function doctorUser(doctor: Doctor): Partial<User> {
  return (doctor.userId as unknown as User) ?? {};
}

function doctorLabel(doctor: Doctor): string {
  const user = doctorUser(doctor);
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Doctor';
  const specialty = doctor.specialization.join(', ') || 'General';
  return `Dr. ${name} — ${specialty} (${doctor.department ?? 'General'})`;
}

export default function BookAppointmentForPatientPage() {
  const navigate = useNavigate();
  const { data: officer } = useGetMyHealthOfficerProfileQuery();
  const [bookAppointment, { isLoading }] = useBookAppointmentMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const hospitalId = officer?.hospitalId ?? '';
  const { data: patients } = useListPatientsQuery(
    hospitalId ? { hospitalId, limit: 100 } : { limit: 100 },
  );
  const { data: doctors } = useListDoctorsQuery(
    hospitalId ? { hospitalId, limit: 100 } : { limit: 100 },
  );

  const { control, handleSubmit, setValue } = useForm<BookAppointmentInput>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      hospitalId: '',
      doctorId: '',
      patientId: '',
      scheduledStart: '',
      reasonForVisit: '',
    },
  });

  useEffect(() => {
    if (hospitalId) setValue('hospitalId', hospitalId);
  }, [hospitalId, setValue]);

  const onSubmit = async (values: BookAppointmentInput) => {
    setFormError(null);
    if (!hospitalId) {
      setFormError('Your health officer profile is not linked to a hospital yet.');
      return;
    }
    try {
      await bookAppointment({
        ...values,
        scheduledStart: new Date(values.scheduledStart).toISOString(),
      }).unwrap();
      navigate('/app/health-officer/appointments');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to book appointment';
      setFormError(message);
    }
  };

  return (
    <>
      <PageHeader
        title="Book Video Consultation"
        subtitle="Schedule a video consultation on behalf of a patient at your hospital"
      />
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ maxWidth: 480 }}
      >
        <Chip
          icon={<VideoCameraFrontOutlinedIcon />}
          label="Video Consultation"
          color="primary"
          variant="outlined"
          sx={{ alignSelf: 'flex-start' }}
        />
        {formError && <Alert severity="error">{formError}</Alert>}
        <Controller
          name="patientId"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              label="Patient"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {(patients?.items ?? []).map((patient) => (
                <MenuItem key={patient._id} value={patient._id}>
                  {`${patientUser(patient).firstName ?? ''} ${patientUser(patient).lastName ?? ''}`.trim() ||
                    patientUser(patient).email ||
                    'Patient'}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="doctorId"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              label="Doctor"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {(doctors?.items ?? []).map((doctor) => (
                <MenuItem key={doctor._id} value={doctor._id}>
                  {doctorLabel(doctor)}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <FormTextField
          name="scheduledStart"
          control={control}
          label="Preferred date & time"
          type="datetime-local"
          InputLabelProps={{ shrink: true }}
        />
        <FormTextField
          name="reasonForVisit"
          control={control}
          label="Reason for visit"
          multiline
          minRows={3}
        />
        <Button type="submit" variant="contained" size="large" disabled={isLoading || !hospitalId}>
          Book appointment
        </Button>
      </Stack>
    </>
  );
}

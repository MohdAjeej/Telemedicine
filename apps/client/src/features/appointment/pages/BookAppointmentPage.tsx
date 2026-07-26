import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material';
import { bookAppointmentSchema, type BookAppointmentInput } from '@telemedicine/validation';
import { FormTextField, PageHeader } from '@telemedicine/ui';
import { useListHospitalsQuery } from '../../hospital/hospitalApi';
import { useListDoctorsQuery } from '../../doctor/doctorApi';
import { useBookAppointmentMutation } from '../appointmentApi';

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [bookAppointment, { isLoading }] = useBookAppointmentMutation();
  const [formError, setFormError] = useState<string | null>(null);

  const { control, handleSubmit, watch } = useForm<BookAppointmentInput>({
    resolver: zodResolver(bookAppointmentSchema),
    defaultValues: {
      hospitalId: '',
      doctorId: '',
      scheduledStart: '',
      type: 'in_person',
      reasonForVisit: '',
    },
  });

  const hospitalId = watch('hospitalId');
  const { data: hospitals } = useListHospitalsQuery({ limit: 100, status: 'active' });
  const { data: doctors } = useListDoctorsQuery(
    hospitalId ? { hospitalId, limit: 100 } : { limit: 100 },
  );

  const onSubmit = async (values: BookAppointmentInput) => {
    setFormError(null);
    try {
      await bookAppointment({
        ...values,
        scheduledStart: new Date(values.scheduledStart).toISOString(),
      }).unwrap();
      navigate('/app/patient/appointments');
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to book appointment';
      setFormError(message);
    }
  };

  return (
    <>
      <PageHeader title="Book an Appointment" subtitle="Find a doctor and pick a time that works" />
      <Stack
        component="form"
        spacing={2.5}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        sx={{ maxWidth: 480 }}
      >
        {formError && <Alert severity="error">{formError}</Alert>}
        <Controller
          name="hospitalId"
          control={control}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              select
              label="Hospital"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {(hospitals?.items ?? []).map((hospital) => (
                <MenuItem key={hospital._id} value={hospital._id}>
                  {hospital.name}
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
              disabled={!hospitalId}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            >
              {(doctors?.items ?? []).map((doctor) => (
                <MenuItem key={doctor._id} value={doctor._id}>
                  {doctor.specialization.join(', ') || 'Doctor'} — {doctor.department ?? 'General'}
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
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Consultation type" fullWidth>
              <MenuItem value="in_person">In-person</MenuItem>
              <MenuItem value="video">Video</MenuItem>
            </TextField>
          )}
        />
        <FormTextField
          name="reasonForVisit"
          control={control}
          label="Reason for visit"
          multiline
          minRows={3}
        />
        <Button type="submit" variant="contained" size="large" disabled={isLoading}>
          Request appointment
        </Button>
      </Stack>
    </>
  );
}

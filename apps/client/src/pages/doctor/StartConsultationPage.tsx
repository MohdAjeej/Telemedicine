import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Paper, Stack, TextField, Button, Alert } from '@mui/material';
import { PageHeader } from '@telemedicine/ui';
import { useStartConsultationMutation } from '../../features/consultation/consultationApi';

interface StartConsultationForm {
  appointmentId: string;
  chiefComplaint: string;
}

export default function StartConsultationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || '';
  
  const [error, setError] = useState<string | null>(null);
  const [startConsultation, { isLoading }] = useStartConsultationMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<StartConsultationForm>({
    defaultValues: {
      appointmentId,
      chiefComplaint: '',
    },
  });

  const onSubmit = async (data: StartConsultationForm) => {
    try {
      const consultation = await startConsultation({
        appointmentId: data.appointmentId,
        chiefComplaint: data.chiefComplaint,
      }).unwrap();

      navigate(`/app/doctor/consultations/${consultation._id}`);
    } catch {
      setError('Failed to start consultation');
    }
  };

  return (
    <>
      <PageHeader title="Start Consultation" subtitle="Begin a new patient consultation" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="appointmentId"
              control={control}
              rules={{ required: 'Appointment ID is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Appointment ID"
                  required
                  fullWidth
                  error={!!errors.appointmentId}
                  helperText={errors.appointmentId?.message}
                />
              )}
            />

            <Controller
              name="chiefComplaint"
              control={control}
              rules={{ required: 'Chief complaint is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Chief Complaint"
                  placeholder="What is the patient's main concern?"
                  required
                  multiline
                  rows={4}
                  fullWidth
                  error={!!errors.chiefComplaint}
                  helperText={errors.chiefComplaint?.message}
                />
              )}
            />

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? 'Starting...' : 'Start Consultation'}
              </Button>
              <Button variant="outlined" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  Grid,
  Divider,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { DataTable, PageHeader, LoadingSpinner, type DataTableColumn } from '@telemedicine/ui';
import type { Vital } from '@telemedicine/types';
import {
  useGetConsultationQuery,
  useUpdateConsultationMutation,
  useCompleteConsultationMutation,
} from '../../features/consultation/consultationApi';
import { useGetAppointmentQuery } from '../../features/appointment/appointmentApi';
import { useListVitalsQuery } from '../../features/vital/vitalApi';
import { format } from 'date-fns';

interface ConsultationForm {
  diagnosis: string;
  notes: string;
  followUpRequired: boolean;
  followUpDate: string;
}

export default function ConsultationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const { data: consultation, isLoading } = useGetConsultationQuery(id!, { skip: !id });
  const { data: appointment } = useGetAppointmentQuery(consultation?.appointmentId || '', {
    skip: !consultation?.appointmentId,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientInfo = appointment?.patientId as any;
  const patientName = patientInfo?.userId
    ? `${patientInfo.userId.firstName} ${patientInfo.userId.lastName}`
    : 'Unknown Patient';
  const patientId: string | undefined = patientInfo?._id;

  const { data: vitals = [], isFetching: isFetchingVitals } = useListVitalsQuery(
    { patientId },
    { skip: !patientId },
  );

  const [updateConsultation, { isLoading: isUpdating }] = useUpdateConsultationMutation();
  const [completeConsultation, { isLoading: isCompleting }] = useCompleteConsultationMutation();

  const { control, handleSubmit, reset } = useForm<ConsultationForm>({
    defaultValues: {
      diagnosis: '',
      notes: '',
      followUpRequired: false,
      followUpDate: '',
    },
  });

  useEffect(() => {
    if (consultation) {
      reset({
        diagnosis: consultation.diagnosis || '',
        notes: consultation.notes || '',
        followUpRequired: consultation.followUpRequired,
        followUpDate: consultation.followUpDate
          ? format(new Date(consultation.followUpDate), 'yyyy-MM-dd')
          : '',
      });
    }
  }, [consultation, reset]);

  const onSave = async (data: ConsultationForm) => {
    if (!id) return;

    try {
      await updateConsultation({
        id,
        body: {
          diagnosis: data.diagnosis,
          notes: data.notes,
          followUpRequired: data.followUpRequired,
          followUpDate: data.followUpDate || undefined,
        },
      }).unwrap();

      setError(null);
    } catch {
      setError('Failed to save consultation');
    }
  };

  const handleComplete = async () => {
    if (!id) return;

    try {
      await completeConsultation(id).unwrap();
      navigate('/app/doctor/consultations');
    } catch {
      setError('Failed to complete consultation');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (!consultation) {
    return (
      <>
        <PageHeader title="Consultation" subtitle="View and update consultation" />
        <Alert severity="error">Consultation not found</Alert>
      </>
    );
  }

  const vitalColumns: DataTableColumn<Vital>[] = [
    { key: 'date', header: 'Date', render: (row) => format(new Date(row.recordedAt), 'MMM d, yyyy p') },
    { key: 'age', header: 'Age', render: (row) => row.age ?? '—' },
    { key: 'gender', header: 'Gender', render: (row) => row.gender ?? '—' },
    {
      key: 'bp',
      header: 'Blood pressure',
      render: (row) =>
        row.bloodPressureSystolic && row.bloodPressureDiastolic
          ? `${row.bloodPressureSystolic}/${row.bloodPressureDiastolic}`
          : '—',
    },
    { key: 'hr', header: 'Heart rate', render: (row) => row.heartRate ?? '—' },
    { key: 'temp', header: 'Temperature', render: (row) => row.temperature ?? '—' },
    { key: 'spo2', header: 'SpO2', render: (row) => row.oxygenSaturation ?? '—' },
    { key: 'bmi', header: 'BMI', render: (row) => row.bmi ?? '—' },
    { key: 'bloodSugar', header: 'Blood sugar', render: (row) => row.bloodSugar ?? '—' },
    { key: 'hemoglobin', header: 'Hemoglobin', render: (row) => row.hemoglobin ?? '—' },
    { key: 'comorbidity', header: 'Comorbidity', render: (row) => row.comorbidity ?? '—' },
    { key: 'complaints', header: 'Complaints', render: (row) => row.complaints ?? '—' },
    { key: 'symptoms', header: 'Symptoms', render: (row) => row.symptoms ?? '—' },
  ];

  return (
    <>
      <PageHeader
        title="Consultation"
        subtitle={`Started ${format(new Date(consultation.startedAt), 'PPp')}`}
        actions={
          <Chip
            label={consultation.status === 'completed' ? 'Completed' : 'In Progress'}
            color={consultation.status === 'completed' ? 'success' : 'primary'}
          />
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSave)}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Patient Information
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Name:</strong> {patientName}
                  </Typography>
                  {patientInfo?.age !== undefined && (
                    <Typography variant="body1" color="text.secondary">
                      <strong>Age:</strong> {patientInfo.age}
                    </Typography>
                  )}
                  {patientInfo?.gender && (
                    <Typography variant="body1" color="text.secondary">
                      <strong>Gender:</strong>{' '}
                      {patientInfo.gender.charAt(0).toUpperCase() + patientInfo.gender.slice(1)}
                    </Typography>
                  )}
                  {consultation.chiefComplaint && (
                    <Typography variant="body1" color="text.secondary">
                      <strong>Chief Complaint:</strong> {consultation.chiefComplaint}
                    </Typography>
                  )}
                </Box>

                <Divider />

                <Controller
                  name="diagnosis"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Diagnosis"
                      multiline
                      rows={3}
                      fullWidth
                      disabled={consultation.status === 'completed'}
                    />
                  )}
                />

                <Controller
                  name="notes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Clinical Notes"
                      multiline
                      rows={6}
                      fullWidth
                      disabled={consultation.status === 'completed'}
                    />
                  )}
                />

                <Controller
                  name="followUpDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Follow-up Date (Optional)"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      disabled={consultation.status === 'completed'}
                    />
                  )}
                />

                {consultation.status !== 'completed' && (
                  <Stack direction="row" spacing={2}>
                    <Button type="submit" variant="contained" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleComplete}
                      disabled={isCompleting}
                    >
                      {isCompleting ? 'Completing...' : 'Complete Consultation'}
                    </Button>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Stack>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/app/doctor/prescriptions/create?consultationId=${id}`)}
                disabled={consultation.status === 'completed'}
              >
                Create Prescription
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(`/app/doctor/lab-reports/request?consultationId=${id}`)}
                disabled={consultation.status === 'completed'}
              >
                Request Lab Test
              </Button>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                Vitals for {patientName}
              </Typography>
              <DataTable
                columns={vitalColumns}
                rows={vitals}
                getRowId={(row) => row._id}
                loading={isFetchingVitals}
                emptyTitle="No vitals recorded yet"
                emptyDescription="The health officer hasn't recorded any vitals for this patient yet."
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

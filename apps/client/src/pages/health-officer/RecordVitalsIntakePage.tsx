import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { MenuItem, Paper, Stack, TextField, Button, Alert, Grid, InputAdornment } from '@mui/material';
import { PageHeader } from '@telemedicine/ui';
import type { Patient, User } from '@telemedicine/types';
import { useRecordVitalMutation } from '../../features/vital/vitalApi';
import { useGetMyHealthOfficerProfileQuery } from '../../features/healthOfficer/healthOfficerApi';
import { useListPatientsQuery } from '../../features/patient/patientApi';

function patientName(patient: Patient): string {
  const user = (patient.userId as unknown as User) ?? ({} as Partial<User>);
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (name && user.email) return `${name} (${user.email})`;
  return name || user.email || 'Patient';
}

interface VitalIntakeForm {
  patientId: string;
  systolic: string;
  diastolic: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  weight: string;
  height: string;
  bloodSugar: string;
  symptoms: string;
  notes: string;
}

export default function RecordVitalsIntakePage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [recordVital, { isLoading }] = useRecordVitalMutation();
  const { data: officer } = useGetMyHealthOfficerProfileQuery();
  const hospitalId = officer?.hospitalId ?? '';
  const { data: patients } = useListPatientsQuery(
    hospitalId ? { hospitalId, limit: 100 } : { limit: 100 },
  );
  const noPatients = (patients?.items?.length ?? 0) === 0;

  const { control, handleSubmit, formState: { errors } } = useForm<VitalIntakeForm>({
    defaultValues: {
      patientId: '',
      systolic: '',
      diastolic: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
      bloodSugar: '',
      symptoms: '',
      notes: '',
    },
  });

  const onSubmit = async (data: VitalIntakeForm) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        patientId: data.patientId,
        notes: data.notes || undefined,
      };

      if (data.systolic) payload.bloodPressureSystolic = Number(data.systolic);
      if (data.diastolic) payload.bloodPressureDiastolic = Number(data.diastolic);

      if (data.heartRate) payload.heartRate = Number(data.heartRate);
      if (data.temperature) payload.temperature = Number(data.temperature);
      if (data.respiratoryRate) payload.respiratoryRate = Number(data.respiratoryRate);
      if (data.oxygenSaturation) payload.oxygenSaturation = Number(data.oxygenSaturation);
      if (data.weight) payload.weight = Number(data.weight);
      if (data.height) payload.height = Number(data.height);
      if (data.bloodSugar) payload.bloodSugar = Number(data.bloodSugar);
      if (data.symptoms) payload.symptoms = data.symptoms;

      await recordVital(payload).unwrap();
      navigate('/app/health-officer');
    } catch (err) {
      const data = (err as { data?: { message?: string; errors?: { field?: string; message: string }[] } })?.data;
      const detail = data?.errors?.map((e) => e.message).join(', ');
      setError(detail || data?.message || 'Failed to record patient vitals');
    }
  };

  return (
    <>
      <PageHeader title="Patient Intake - Record Vitals" subtitle="Record vital signs during patient check-in" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {noPatients && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No patients found at your hospital yet. Register a patient first.
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="patientId"
              control={control}
              rules={{ required: 'Please select a patient' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Patient"
                  required
                  fullWidth
                  error={!!errors.patientId}
                  helperText={errors.patientId?.message || 'Select the patient checking in'}
                >
                  {(patients?.items ?? []).map((patient) => (
                    <MenuItem key={patient._id} value={patient._id}>
                      {patientName(patient)}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="systolic"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Systolic BP"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="diastolic"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Diastolic BP"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="heartRate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Heart Rate"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="temperature"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Temperature"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">°F</InputAdornment>,
                      }}
                      inputProps={{ step: '0.1' }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="respiratoryRate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Respiratory Rate"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">/min</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="oxygenSaturation"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Oxygen Saturation (SpO2)"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="weight"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Weight"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                      }}
                      inputProps={{ step: '0.1' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="height"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Height"
                      type="number"
                      fullWidth
                      InputProps={{
                        endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                      }}
                      inputProps={{ step: '0.1' }}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="bloodSugar"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Blood Sugar"
                  type="number"
                  fullWidth
                  InputProps={{
                    endAdornment: <InputAdornment position="end">mg/dL</InputAdornment>,
                  }}
                />
              )}
            />

            <Controller
              name="symptoms"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Symptoms"
                  placeholder="Symptoms reported by the patient"
                  multiline
                  rows={2}
                  fullWidth
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
                  placeholder="Any observations or patient concerns during intake"
                  multiline
                  rows={3}
                  fullWidth
                />
              )}
            />

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={isLoading || noPatients}>
                {isLoading ? 'Recording...' : 'Complete Intake'}
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

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { FormTextField } from '@telemedicine/ui';
import type { Patient, User } from '@telemedicine/types';
import {
  useRegisterPatientMutation,
  useListPatientsQuery,
} from '../../features/patient/patientApi';
import { useRecordVitalMutation } from '../../features/vital/vitalApi';
import { useGetMyHealthOfficerProfileQuery } from '../../features/healthOfficer/healthOfficerApi';

function patientName(patient: Patient): string {
  const user = (patient.userId as unknown as User) ?? ({} as Partial<User>);
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (name && user.email) return `${name} (${user.email})`;
  return name || user.email || 'Patient';
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  const theme = useTheme();
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mb: 1.5, flexShrink: 0 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: alpha(theme.palette.primary.main, 0.12),
          color: 'primary.main',
        }}
      >
        {icon}
      </Avatar>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
    </Stack>
  );
}

interface RegisterPatientForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  age: number | '';
  gender: 'male' | 'female' | 'other' | '';
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
  hemoglobin: string;
  comorbidity: string;
  complaints: string;
  symptoms: string;
  notes: string;
}

export default function PatientIntakePage() {
  const navigate = useNavigate();

  // --- Register patient ---
  const [registerPatient, { isLoading: isRegistering }] = useRegisterPatientMutation();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const registerForm = useForm<RegisterPatientForm>({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      age: '',
      gender: '',
    },
  });

  const onRegister = async (values: RegisterPatientForm) => {
    setRegisterError(null);
    setRegisterSuccess(false);
    try {
      const patient = await registerPatient({ ...values }).unwrap();
      registerForm.reset();
      setRegisterSuccess(true);
      vitalsForm.setValue('patientId', patient._id);
    } catch (error) {
      setRegisterError(
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to register patient',
      );
    }
  };

  // --- Record vitals ---
  const [vitalsError, setVitalsError] = useState<string | null>(null);
  const [recordVital, { isLoading: isRecordingVitals }] = useRecordVitalMutation();
  const { data: officer } = useGetMyHealthOfficerProfileQuery();
  const hospitalId = officer?.hospitalId ?? '';
  const { data: patients } = useListPatientsQuery(
    hospitalId ? { hospitalId, limit: 100 } : { limit: 100 },
  );
  const noPatients = (patients?.items?.length ?? 0) === 0;

  const vitalsForm = useForm<VitalIntakeForm>({
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
      hemoglobin: '',
      comorbidity: '',
      complaints: '',
      symptoms: '',
      notes: '',
    },
  });
  const {
    control: vitalsControl,
    handleSubmit: handleVitalsSubmit,
    watch,
    formState: { errors: vitalsErrors },
  } = vitalsForm;

  const selectedPatientId = watch('patientId');
  const selectedPatient = (patients?.items ?? []).find(
    (patient) => patient._id === selectedPatientId,
  );

  const onRecordVitals = async (data: VitalIntakeForm) => {
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
      if (data.hemoglobin) payload.hemoglobin = Number(data.hemoglobin);
      if (data.comorbidity) payload.comorbidity = data.comorbidity;
      if (data.complaints) payload.complaints = data.complaints;
      if (data.symptoms) payload.symptoms = data.symptoms;

      // Age/gender are captured as a snapshot from the patient's profile at
      // intake time rather than retyped, so they stay consistent with the
      // registered patient record.
      if (selectedPatient?.age !== undefined) payload.age = selectedPatient.age;
      if (selectedPatient?.gender) payload.gender = selectedPatient.gender;

      await recordVital(payload).unwrap();
      navigate('/app/health-officer');
    } catch (err) {
      const data = (
        err as {
          data?: {
            message?: string;
            errors?: { field?: string; message: string }[];
          };
        }
      )?.data;
      const detail = data?.errors?.map((e) => e.message).join(', ');
      setVitalsError(detail || data?.message || 'Failed to record patient vitals');
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Page identity ("Health Officer Desk / Patient Intake") already shown
          in the app bar — no separate on-page title needed here too.
          Side-by-side instead of stacked — the two sections no longer compete
          for the same vertical space, so the page fits one screen instead of
          needing height equal to their sum. Each panel keeps its own
          overflowY as a safety net (never the page itself) in case a very
          short viewport still can't fit everything. */}
      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Grid item xs={12} md={4} sx={{ height: { md: '100%' } }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SectionHeader
              icon={<PersonAddAltOutlinedIcon fontSize="small" />}
              title="1. Register Patient"
            />
            <Grid
              container
              component="form"
              spacing={1.25}
              onSubmit={registerForm.handleSubmit(onRegister)}
              noValidate
            >
              {registerError && (
                <Grid item xs={12}>
                  <Alert severity="error">{registerError}</Alert>
                </Grid>
              )}
              {registerSuccess && (
                <Grid item xs={12}>
                  <Alert severity="success">Patient registered successfully.</Alert>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="firstName"
                  control={registerForm.control}
                  label="First name"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="lastName"
                  control={registerForm.control}
                  label="Last name"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="age"
                  control={registerForm.control}
                  label="Age"
                  type="number"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={registerForm.control}
                  render={({ field }) => (
                    <TextField {...field} select label="Gender" fullWidth size="small">
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextField
                  name="email"
                  control={registerForm.control}
                  label="Email"
                  type="email"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="phone"
                  control={registerForm.control}
                  label="Phone"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormTextField
                  name="password"
                  control={registerForm.control}
                  label="Password"
                  type="password"
                  size="small"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<PersonAddAltOutlinedIcon />}
                  disabled={isRegistering}
                >
                  Register patient
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8} sx={{ height: { md: '100%' } }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              height: '100%',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SectionHeader
              icon={<MonitorHeartOutlinedIcon fontSize="small" />}
              title="2. Record Vitals"
            />

            {vitalsError && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                {vitalsError}
              </Alert>
            )}
            {noPatients && (
              <Alert severity="warning" sx={{ mb: 1.5 }}>
                No patients found at your hospital yet. Register a patient above first.
              </Alert>
            )}

            <form onSubmit={handleVitalsSubmit(onRecordVitals)}>
              <Stack spacing={1.25}>
                <Controller
                  name="patientId"
                  control={vitalsControl}
                  rules={{ required: 'Please select a patient' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Patient"
                      required
                      fullWidth
                      size="small"
                      error={!!vitalsErrors.patientId}
                      helperText={
                        vitalsErrors.patientId?.message || 'Select the patient checking in'
                      }
                      sx={{ maxWidth: 480 }}
                    >
                      {(patients?.items ?? []).map((patient) => (
                        <MenuItem key={patient._id} value={patient._id}>
                          {patientName(patient)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                {selectedPatient && (
                  <Typography variant="body2" color="text.secondary">
                    Age: {selectedPatient.age ?? '—'} · Gender:{' '}
                    {selectedPatient.gender
                      ? selectedPatient.gender.charAt(0).toUpperCase() +
                        selectedPatient.gender.slice(1)
                      : '—'}{' '}
                    <em>(from patient profile)</em>
                  </Typography>
                )}

                <Grid container spacing={1.5}>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="systolic"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Systolic BP"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="diastolic"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Diastolic BP"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="heartRate"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Heart Rate"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="temperature"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Temperature"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">°F</InputAdornment>,
                          }}
                          inputProps={{ step: '0.1' }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="respiratoryRate"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Respiratory Rate"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">/min</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="oxygenSaturation"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="SpO2"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="weight"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Weight"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                          }}
                          inputProps={{ step: '0.1' }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="height"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Height"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                          }}
                          inputProps={{ step: '0.1' }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="bloodSugar"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Blood Sugar"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">mg/dL</InputAdornment>,
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} md={3}>
                    <Controller
                      name="hemoglobin"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Hemoglobin"
                          type="number"
                          fullWidth
                          size="small"
                          InputProps={{
                            endAdornment: <InputAdornment position="end">g/dL</InputAdornment>,
                          }}
                          inputProps={{ step: '0.1' }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 0.5 }} />

                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="comorbidity"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Comorbidity"
                          placeholder="e.g., Diabetes, Hypertension"
                          multiline
                          rows={2}
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="complaints"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Complaints"
                          placeholder="Complaints reported by the patient at intake"
                          multiline
                          rows={2}
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Controller
                      name="symptoms"
                      control={vitalsControl}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Symptoms"
                          placeholder="Symptoms reported by the patient"
                          multiline
                          rows={2}
                          fullWidth
                          size="small"
                        />
                      )}
                    />
                  </Grid>
                </Grid>

                <Controller
                  name="notes"
                  control={vitalsControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Clinical Notes"
                      placeholder="Any observations or patient concerns during intake"
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
                    />
                  )}
                />

                <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<CheckCircleOutlineRoundedIcon />}
                    disabled={isRecordingVitals || noPatients}
                  >
                    {isRecordingVitals ? 'Recording...' : 'Complete Intake'}
                  </Button>
                  <Button variant="outlined" onClick={() => navigate('/app/health-officer')}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

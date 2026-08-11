import { useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { Paper, Stack, TextField, Button, Alert, IconButton, Typography, Box, Divider, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Medication, Prescription } from '@telemedicine/types';
import { useCreatePrescriptionMutation } from '../prescriptionApi';

interface PrescriptionFormValues {
  comorbidity: string;
  allergy: string;
  otherIllness: string;
  familyHistory: string;
  symptoms: string;
  medications: Medication[];
  advice: string;
  provisionalDiagnosis: string;
  finalDiagnosis: string;
  clinicalFindings: string;
  labTests: { value: string }[];
  followUpDate: string;
}

export interface PrescriptionFormProps {
  consultationId: string;
  onSaved?: (prescription: Prescription) => void;
  onCancel?: () => void;
}

export function PrescriptionForm({ consultationId, onSaved, onCancel }: PrescriptionFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [createPrescription, { isLoading }] = useCreatePrescriptionMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormValues>({
    defaultValues: {
      comorbidity: '',
      allergy: '',
      otherIllness: '',
      familyHistory: '',
      symptoms: '',
      medications: [{ name: '', dosage: '', frequency: '', durationDays: 7, instructions: '' }],
      advice: '',
      provisionalDiagnosis: '',
      finalDiagnosis: '',
      clinicalFindings: '',
      labTests: [{ value: '' }],
      followUpDate: '',
    },
  });

  const medicationFields = useFieldArray({ control, name: 'medications' });
  const labTestFields = useFieldArray({ control, name: 'labTests' });

  const onSubmit = async (data: PrescriptionFormValues) => {
    setError(null);
    try {
      const prescription = await createPrescription({
        consultationId,
        medications: data.medications,
        comorbidity: data.comorbidity || undefined,
        allergy: data.allergy || undefined,
        otherIllness: data.otherIllness || undefined,
        familyHistory: data.familyHistory || undefined,
        symptoms: data.symptoms || undefined,
        advice: data.advice || undefined,
        provisionalDiagnosis: data.provisionalDiagnosis || undefined,
        finalDiagnosis: data.finalDiagnosis || undefined,
        clinicalFindings: data.clinicalFindings || undefined,
        labTests: data.labTests.map((t) => t.value.trim()).filter(Boolean),
        followUpDate: data.followUpDate || undefined,
      }).unwrap();

      reset();
      onSaved?.(prescription);
    } catch {
      setError('Failed to save prescription');
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="comorbidity"
                control={control}
                render={({ field }) => <TextField {...field} label="Comorbidity" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="allergy"
                control={control}
                render={({ field }) => <TextField {...field} label="Allergy" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="otherIllness"
                control={control}
                render={({ field }) => <TextField {...field} label="Other Illness" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="familyHistory"
                control={control}
                render={({ field }) => <TextField {...field} label="Family History" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="symptoms"
                control={control}
                render={({ field }) => <TextField {...field} label="Symptoms" multiline rows={2} fullWidth />}
              />
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Medications</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  medicationFields.append({
                    name: '',
                    dosage: '',
                    frequency: '',
                    durationDays: 7,
                    instructions: '',
                  })
                }
              >
                Add Medication
              </Button>
            </Box>

            <Stack spacing={3}>
              {medicationFields.fields.map((field, index) => (
                <Paper key={field.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">Medication #{index + 1}</Typography>
                      {medicationFields.fields.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => medicationFields.remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    <Controller
                      name={`medications.${index}.name`}
                      control={control}
                      rules={{ required: 'Medication name is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Medication Name"
                          required
                          fullWidth
                          error={!!errors.medications?.[index]?.name}
                          helperText={errors.medications?.[index]?.name?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`medications.${index}.dosage`}
                      control={control}
                      rules={{ required: 'Dosage is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Dosage (e.g., 500mg, 10ml)"
                          required
                          fullWidth
                          error={!!errors.medications?.[index]?.dosage}
                          helperText={errors.medications?.[index]?.dosage?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`medications.${index}.frequency`}
                      control={control}
                      rules={{ required: 'Frequency is required' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Frequency (e.g., Twice daily, Every 8 hours)"
                          required
                          fullWidth
                          error={!!errors.medications?.[index]?.frequency}
                          helperText={errors.medications?.[index]?.frequency?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`medications.${index}.durationDays`}
                      control={control}
                      rules={{ required: 'Duration is required', min: 1 }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Duration (days)"
                          type="number"
                          required
                          fullWidth
                          error={!!errors.medications?.[index]?.durationDays}
                          helperText={errors.medications?.[index]?.durationDays?.message}
                        />
                      )}
                    />

                    <Controller
                      name={`medications.${index}.instructions`}
                      control={control}
                      render={({ field }) => (
                        <TextField {...field} label="Special Instructions (Optional)" multiline rows={2} fullWidth />
                      )}
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>

          <Divider />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="advice"
                control={control}
                render={({ field }) => <TextField {...field} label="Advice" multiline rows={2} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="provisionalDiagnosis"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Provisional Diagnosis" multiline rows={2} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="clinicalFindings"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Clinical Findings" multiline rows={2} fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="finalDiagnosis"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Final Diagnosis" multiline rows={2} fullWidth />
                )}
              />
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Laboratory Tests</Typography>
              <Button startIcon={<AddIcon />} onClick={() => labTestFields.append({ value: '' })}>
                Add Lab Test
              </Button>
            </Box>

            <Stack spacing={2}>
              {labTestFields.fields.map((field, index) => (
                <Stack key={field.id} direction="row" spacing={1} alignItems="center">
                  <Controller
                    name={`labTests.${index}.value`}
                    control={control}
                    render={({ field: inputField }) => <TextField {...inputField} label="Lab Test Name" fullWidth />}
                  />
                  {labTestFields.fields.length > 1 && (
                    <IconButton size="small" color="error" onClick={() => labTestFields.remove(index)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              ))}
            </Stack>
          </Box>

          <Controller
            name="followUpDate"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Follow Up Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: 240 }}
              />
            )}
          />

          <Stack direction="row" spacing={2}>
            <Button type="submit" variant="contained" color="success" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Prescription'}
            </Button>
            {onCancel && (
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}

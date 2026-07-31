import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import {
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  MenuItem,
} from '@mui/material';
import { PageHeader } from '@telemedicine/ui';
import { useRequestLabReportMutation } from '../../features/labReport/labReportApi';
import { COMMON_TESTS } from '../../features/labReport/constants';

interface LabTestForm {
  patientId: string;
  testType: string;
  customTestType: string;
}

export default function RequestLabTestPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get('consultationId');
  
  const [error, setError] = useState<string | null>(null);
  const [requestLabReport, { isLoading }] = useRequestLabReportMutation();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<LabTestForm>({
    defaultValues: {
      patientId: '',
      testType: '',
      customTestType: '',
    },
  });

  const selectedTestType = watch('testType');

  const onSubmit = async (data: LabTestForm) => {
    try {
      await requestLabReport({
        patientId: data.patientId,
        testType: data.testType === 'Other' ? data.customTestType.trim() : data.testType,
      }).unwrap();

      if (consultationId) {
        navigate(`/app/doctor/consultations/${consultationId}`);
      } else {
        navigate('/app/doctor');
      }
    } catch {
      setError('Failed to request lab test');
    }
  };

  return (
    <>
      <PageHeader title="Request Lab Test" subtitle="Order laboratory tests for patient" />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="patientId"
              control={control}
              rules={{ required: 'Patient ID is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Patient ID"
                  required
                  fullWidth
                  error={!!errors.patientId}
                  helperText={errors.patientId?.message}
                />
              )}
            />

            <Controller
              name="testType"
              control={control}
              rules={{ required: 'Test type is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Test Type"
                  required
                  fullWidth
                  error={!!errors.testType}
                  helperText={errors.testType?.message}
                >
                  {COMMON_TESTS.map((test) => (
                    <MenuItem key={test} value={test}>
                      {test}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {selectedTestType === 'Other' && (
              <Controller
                name="customTestType"
                control={control}
                rules={{ required: 'Please specify the test type' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Specify Test Type"
                    placeholder="Enter custom test type"
                    required
                    fullWidth
                    error={!!errors.customTestType}
                    helperText={errors.customTestType?.message}
                  />
                )}
              />
            )}

            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={isLoading}>
                {isLoading ? 'Requesting...' : 'Request Lab Test'}
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

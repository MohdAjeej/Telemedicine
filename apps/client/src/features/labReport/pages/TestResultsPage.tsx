import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataTable, PageHeader, ReportViewerDialog, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { LabReport } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListLabReportsQuery, useUploadOwnLabReportMutation } from '../labReportApi';
import { COMMON_TESTS } from '../constants';

const REPORT_FILE_ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf';

interface UploadForm {
  testType: string;
  customTestType: string;
}

function parseErrorMessage(err: unknown, fallback: string): string {
  const errData = (err as { data?: { message?: string; errors?: { field?: string; message: string }[] } })?.data;
  const detail = errData?.errors?.map((e) => e.message).join(', ');
  if (detail || errData?.message) return (detail || errData?.message)!;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function TestResultsPage() {
  const { data: reports = [], isFetching } = useListLabReportsQuery({});
  const [reportViewerUrl, setReportViewerUrl] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadOwnLabReport, { isLoading: isUploading }] = useUploadOwnLabReportMutation();

  const { control, handleSubmit, reset, watch } = useForm<UploadForm>({
    defaultValues: { testType: '', customTestType: '' },
  });
  const selectedTestType = watch('testType');

  const openUploadDialog = () => {
    reset({ testType: '', customTestType: '' });
    setUploadFile(null);
    setError(null);
    setUploadOpen(true);
  };

  const onSubmit = async (data: UploadForm) => {
    if (!uploadFile) {
      setError('Please attach the report file');
      return;
    }
    setError(null);
    try {
      const testType = data.testType === 'Other' ? data.customTestType.trim() : data.testType;
      await uploadOwnLabReport({ testType, file: uploadFile }).unwrap();
      setUploadOpen(false);
    } catch (err) {
      setError(parseErrorMessage(err, 'Failed to upload the report'));
    }
  };

  const columns: DataTableColumn<LabReport>[] = [
    { key: 'test', header: 'Test', render: (row) => row.testType },
    { key: 'requested', header: 'Requested', render: (row) => format(new Date(row.requestedAt), 'MMM d, yyyy') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'summary', header: 'Summary', render: (row) => row.resultSummary ?? '—' },
    {
      key: 'report',
      header: 'Report',
      render: (row) =>
        row.resultFileUrl ? (
          <Button size="small" variant="text" onClick={() => setReportViewerUrl(row.resultFileUrl!)}>
            View report
          </Button>
        ) : (
          '—'
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Test Results"
        subtitle="Lab test requests and results"
        actions={
          <Button variant="contained" onClick={openUploadDialog}>
            Upload Test Result
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={reports}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle="No lab tests on record"
      />

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload test result</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <Controller
                name="testType"
                control={control}
                rules={{ required: 'Test type is required' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    select
                    label="Test type"
                    required
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
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
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      label="Specify test type"
                      placeholder="Enter custom test type"
                      required
                      fullWidth
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              )}
              <Stack spacing={0.5}>
                <Button variant="outlined" component="label">
                  {uploadFile ? 'Change report file' : 'Attach report file'}
                  <input
                    type="file"
                    hidden
                    accept={REPORT_FILE_ACCEPT}
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
                {uploadFile && <Typography variant="caption">{uploadFile.name}</Typography>}
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setUploadOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <ReportViewerDialog
        open={!!reportViewerUrl}
        onClose={() => setReportViewerUrl(null)}
        url={reportViewerUrl}
        title="Lab Report"
      />
    </>
  );
}

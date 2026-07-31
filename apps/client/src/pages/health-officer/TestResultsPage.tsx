import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { DataTable, PageHeader, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { LabReport, LabReportStatus, Patient, User } from '@telemedicine/types';
import { format } from 'date-fns';
import { useGetMyHealthOfficerProfileQuery } from '../../features/healthOfficer/healthOfficerApi';
import { useListPatientsQuery } from '../../features/patient/patientApi';
import {
  useDeleteLabReportMutation,
  useListLabReportsQuery,
  useRequestLabReportMutation,
  useUpdateLabReportMutation,
} from '../../features/labReport/labReportApi';
import { COMMON_TESTS } from '../../features/labReport/constants';

function patientName(patient: Patient): string {
  const user = (patient.userId as unknown as User) ?? ({} as Partial<User>);
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (name && user.email) return `${name} (${user.email})`;
  return name || user.email || 'Patient';
}

interface FillResultForm {
  status: LabReportStatus;
  resultSummary: string;
}

interface AddResultForm {
  testType: string;
  customTestType: string;
  status: LabReportStatus;
  resultSummary: string;
}

function parseErrorMessage(err: unknown, fallback: string): string {
  const errData = (err as { data?: { message?: string; errors?: { field?: string; message: string }[] } })?.data;
  const detail = errData?.errors?.map((e) => e.message).join(', ');
  if (detail || errData?.message) return (detail || errData?.message)!;
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function TestResultsPage() {
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [activeReport, setActiveReport] = useState<LabReport | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LabReport | null>(null);

  const { data: officer } = useGetMyHealthOfficerProfileQuery();
  const hospitalId = officer?.hospitalId ?? '';
  const { data: patients } = useListPatientsQuery(hospitalId ? { hospitalId, limit: 100 } : { limit: 100 });
  const noPatients = (patients?.items?.length ?? 0) === 0;

  const { data: reports = [], isFetching } = useListLabReportsQuery(
    { patientId },
    { skip: !patientId },
  );

  const [requestLabReport, { isLoading: isRequesting }] = useRequestLabReportMutation();
  const [updateLabReport, { isLoading: isSaving }] = useUpdateLabReportMutation();
  const [deleteLabReport, { isLoading: isDeleting }] = useDeleteLabReportMutation();

  const { control, handleSubmit, reset } = useForm<FillResultForm>({
    defaultValues: { status: 'completed', resultSummary: '' },
  });

  const addForm = useForm<AddResultForm>({
    defaultValues: { testType: '', customTestType: '', status: 'completed', resultSummary: '' },
  });
  const selectedAddTestType = addForm.watch('testType');

  const openFillDialog = (report: LabReport) => {
    setActiveReport(report);
    reset({ status: 'completed', resultSummary: report.resultSummary ?? '' });
    setError(null);
  };

  const onSubmit = async (data: FillResultForm) => {
    if (!activeReport) return;
    try {
      await updateLabReport({
        id: activeReport._id,
        status: data.status,
        resultSummary: data.resultSummary || undefined,
      }).unwrap();
      setActiveReport(null);
    } catch (err) {
      setError(parseErrorMessage(err, 'Failed to save the test result'));
    }
  };

  const openAddDialog = () => {
    addForm.reset({ testType: '', customTestType: '', status: 'completed', resultSummary: '' });
    setError(null);
    setAddOpen(true);
  };

  // A health officer isn't limited to filling in tests a doctor already
  // requested — they can add a new test and its result in one step (e.g.
  // a rapid test performed on the spot), which POSTs the request and then
  // immediately PATCHes the result onto the record it creates.
  const onAddSubmit = async (data: AddResultForm) => {
    try {
      const testType = data.testType === 'Other' ? data.customTestType.trim() : data.testType;
      const created = await requestLabReport({ patientId, testType }).unwrap();
      if (!created?._id) {
        // Guards against a stale/misconfigured API response shape rather than
        // silently sending a PATCH to `/lab-reports/undefined`, which the
        // server rejects with a confusing "Invalid lab report id".
        throw new Error('The server did not return a valid test report id');
      }
      await updateLabReport({
        id: created._id,
        status: data.status,
        resultSummary: data.resultSummary || undefined,
      }).unwrap();
      setAddOpen(false);
    } catch (err) {
      setError(parseErrorMessage(err, 'Failed to add the test result'));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLabReport(deleteTarget._id).unwrap();
      setDeleteTarget(null);
    } catch (err) {
      setError(parseErrorMessage(err, 'Failed to delete the test report'));
      setDeleteTarget(null);
    }
  };

  const columns: DataTableColumn<LabReport>[] = [
    { key: 'test', header: 'Test', render: (row) => row.testType },
    { key: 'requested', header: 'Requested', render: (row) => format(new Date(row.requestedAt), 'MMM d, yyyy') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'summary', header: 'Summary', render: (row) => row.resultSummary ?? '—' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="outlined" onClick={() => openFillDialog(row)}>
            {row.status === 'completed' ? 'Edit result' : 'Fill result'}
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={() => setDeleteTarget(row)}>
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Test Results"
        subtitle="Enter lab test results for a patient"
        actions={
          <Button variant="contained" onClick={openAddDialog} disabled={!patientId}>
            Add Test Result
          </Button>
        }
      />

      {noPatients && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No patients found at your hospital yet.
        </Alert>
      )}

      {error && !activeReport && !addOpen && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
        <TextField
          select
          label="Patient"
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          fullWidth
          sx={{ maxWidth: 480 }}
        >
          <MenuItem value="">
            <em>Select a patient</em>
          </MenuItem>
          {(patients?.items ?? []).map((patient) => (
            <MenuItem key={patient._id} value={patient._id}>
              {patientName(patient)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <DataTable
        columns={columns}
        rows={reports}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle={patientId ? 'No lab tests requested for this patient yet' : 'Select a patient to see their lab tests'}
      />

      <Dialog open={!!activeReport} onClose={() => setActiveReport(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Fill test result{activeReport ? ` — ${activeReport.testType}` : ''}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    <MenuItem value="in_progress">In progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="resultSummary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Result summary"
                    placeholder="e.g. Hemoglobin 13.2 g/dL, WBC 6,800/uL — within normal range"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setActiveReport(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save result'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add test result</DialogTitle>
        <form onSubmit={addForm.handleSubmit(onAddSubmit)}>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              {error && <Alert severity="error">{error}</Alert>}
              <Controller
                name="testType"
                control={addForm.control}
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
              {selectedAddTestType === 'Other' && (
                <Controller
                  name="customTestType"
                  control={addForm.control}
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
              <Controller
                name="status"
                control={addForm.control}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth>
                    <MenuItem value="in_progress">In progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="resultSummary"
                control={addForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Result summary"
                    placeholder="e.g. Hemoglobin 13.2 g/dL, WBC 6,800/uL — within normal range"
                    multiline
                    rows={4}
                    fullWidth
                  />
                )}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isRequesting || isSaving}>
              {isRequesting || isSaving ? 'Saving...' : 'Save result'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete test report?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteTarget
              ? `This will permanently delete the "${deleteTarget.testType}" test report${
                  deleteTarget.status === 'completed' ? ' and its result' : ''
                }. This cannot be undone.`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

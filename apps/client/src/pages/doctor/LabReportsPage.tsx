import { useState } from 'react';
import { Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import { DataTable, PageHeader, ReportViewerDialog, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { LabReport, Patient, User } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListPatientsQuery } from '../../features/patient/patientApi';
import { useListLabReportsQuery } from '../../features/labReport/labReportApi';

function patientName(patient: Patient): string {
  const user = (patient.userId as unknown as User) ?? ({} as Partial<User>);
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (name && user.email) return `${name} (${user.email})`;
  return name || user.email || 'Patient';
}

export default function LabReportsPage() {
  const [patientId, setPatientId] = useState('');
  const [reportViewerUrl, setReportViewerUrl] = useState<string | null>(null);

  const { data: patients } = useListPatientsQuery({ limit: 100 });
  const { data: reports = [], isFetching } = useListLabReportsQuery({ patientId }, { skip: !patientId });

  const columns: DataTableColumn<LabReport>[] = [
    { key: 'test', header: 'Test', render: (row) => row.testType },
    {
      key: 'source',
      header: 'Source',
      render: (row) =>
        row.uploadedBy ? (
          <Chip label="Patient uploaded" size="small" color="info" variant="outlined" />
        ) : (
          '—'
        ),
    },
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
      <PageHeader title="Test Results" subtitle="View lab test results for your patients" />

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
        emptyTitle={patientId ? 'No lab tests on record for this patient' : 'Select a patient to see their lab tests'}
      />

      <ReportViewerDialog
        open={!!reportViewerUrl}
        onClose={() => setReportViewerUrl(null)}
        url={reportViewerUrl}
        title="Lab Report"
      />
    </>
  );
}

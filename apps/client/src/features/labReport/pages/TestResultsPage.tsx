import { useState } from 'react';
import { Button } from '@mui/material';
import { DataTable, PageHeader, ReportViewerDialog, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { LabReport } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListLabReportsQuery } from '../labReportApi';

export default function TestResultsPage() {
  const { data: reports = [], isFetching } = useListLabReportsQuery({});
  const [reportViewerUrl, setReportViewerUrl] = useState<string | null>(null);

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
      <PageHeader title="Test Results" subtitle="Lab test requests and results" />
      <DataTable
        columns={columns}
        rows={reports}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle="No lab tests on record"
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

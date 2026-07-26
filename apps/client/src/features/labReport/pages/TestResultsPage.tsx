import { DataTable, PageHeader, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { LabReport } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListLabReportsQuery } from '../labReportApi';

export default function TestResultsPage() {
  const { data: reports = [], isFetching } = useListLabReportsQuery();

  const columns: DataTableColumn<LabReport>[] = [
    { key: 'test', header: 'Test', render: (row) => row.testType },
    { key: 'requested', header: 'Requested', render: (row) => format(new Date(row.requestedAt), 'MMM d, yyyy') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'summary', header: 'Summary', render: (row) => row.resultSummary ?? '—' },
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
    </>
  );
}

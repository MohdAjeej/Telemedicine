import { DataTable, PageHeader, type DataTableColumn } from '@telemedicine/ui';
import type { MedicalRecord } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListMedicalRecordsQuery } from '../medicalRecordApi';

export default function MedicalRecordsPage() {
  const { data: records = [], isFetching } = useListMedicalRecordsQuery();

  const columns: DataTableColumn<MedicalRecord>[] = [
    { key: 'title', header: 'Title', render: (row) => row.title },
    { key: 'type', header: 'Type', render: (row) => row.type.replace('_', ' ') },
    { key: 'date', header: 'Date', render: (row) => format(new Date(row.recordDate), 'MMM d, yyyy') },
    { key: 'tags', header: 'Tags', render: (row) => row.tags.join(', ') || '—' },
  ];

  return (
    <>
      <PageHeader title="Medical Records" subtitle="Your clinical documents and history" />
      <DataTable
        columns={columns}
        rows={records}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle="No medical records yet"
      />
    </>
  );
}

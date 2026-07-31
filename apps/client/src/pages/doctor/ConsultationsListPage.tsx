import { useNavigate } from 'react-router-dom';
import { Button, Chip } from '@mui/material';
import { PageHeader, DataTable, type DataTableColumn, EmptyState } from '@telemedicine/ui';
import type { Consultation } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListConsultationsQuery } from '../../features/consultation/consultationApi';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';

export default function ConsultationsListPage() {
  const navigate = useNavigate();
  const { data, isFetching } = useListConsultationsQuery();

  const columns: DataTableColumn<Consultation>[] = [
    {
      key: 'startedAt',
      header: 'Date',
      render: (row) => format(new Date(row.startedAt), 'MMM d, yyyy p'),
    },
    {
      key: 'chiefComplaint',
      header: 'Chief Complaint',
      render: (row) => row.chiefComplaint || '—',
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (row) => row.diagnosis || 'Pending',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Chip
          label={row.status === 'completed' ? 'Completed' : 'In Progress'}
          color={row.status === 'completed' ? 'success' : 'primary'}
          size="small"
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button size="small" onClick={() => navigate(`/app/doctor/consultations/${row._id}`)}>
          View
        </Button>
      ),
    },
  ];

  if (!isFetching && (!data?.items || data.items.length === 0)) {
    return (
      <>
        <PageHeader title="Consultations" subtitle="View your consultation history" />
        <EmptyState
          icon={<MedicalServicesOutlinedIcon fontSize="inherit" />}
          title="No consultations yet"
          description="Consultations will appear here once you start seeing patients."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Consultations" subtitle="View your consultation history" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle="No consultations"
        emptyDescription="Start a consultation from an appointment."
      />
    </>
  );
}

import { useNavigate } from 'react-router-dom';
import { Button, Chip } from '@mui/material';
import { PageHeader, DataTable, type DataTableColumn, EmptyState } from '@telemedicine/ui';
import type { Consultation } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListConsultationsQuery } from '../../features/consultation/consultationApi';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';

export default function ConsultationHistoryPage() {
  const navigate = useNavigate();
  const { data, isFetching } = useListConsultationsQuery();

  const columns: DataTableColumn<Consultation>[] = [
    {
      key: 'startedAt',
      header: 'Date',
      render: (row) => format(new Date(row.startedAt), 'PPp'),
    },
    {
      key: 'chiefComplaint',
      header: 'Reason for Visit',
      render: (row) => row.chiefComplaint || '—',
    },
    {
      key: 'diagnosis',
      header: 'Diagnosis',
      render: (row) => row.diagnosis || 'Not available',
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
        <Button size="small" onClick={() => navigate(`/app/patient/consultations/${row._id}`)}>
          View Details
        </Button>
      ),
    },
  ];

  if (!isFetching && (!data?.items || data.items.length === 0)) {
    return (
      <>
        <PageHeader title="Consultation History" subtitle="View your past consultations" />
        <EmptyState
          icon={<MedicalServicesOutlinedIcon fontSize="inherit" />}
          title="No consultation history"
          description="Your consultation records will appear here after your appointments."
        />
      </>
    );
  }

  return (
    <>
      <PageHeader title="Consultation History" subtitle="View your past consultations" />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle="No consultations"
        emptyDescription="Your consultation history will appear here."
      />
    </>
  );
}

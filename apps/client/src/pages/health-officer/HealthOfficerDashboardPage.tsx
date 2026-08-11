import { Chip, Grid } from '@mui/material';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { DataTable, PageHeader, StatCard, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { Appointment } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListAppointmentsQuery } from '../../features/appointment/appointmentApi';

function participantName(entity: unknown): string {
  const populated = entity as { userId?: { firstName?: string; lastName?: string } } | undefined;
  const user = populated?.userId;
  return user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
}

export default function HealthOfficerDashboardPage() {
  const { data: queue, isFetching } = useListAppointmentsQuery({ limit: 20, status: 'pending' });
  const { data: confirmedToday } = useListAppointmentsQuery({ limit: 1, status: 'confirmed' });

  const columns: DataTableColumn<Appointment>[] = [
    { key: 'when', header: 'When', render: (row) => format(new Date(row.scheduledStart), 'MMM d, p') },
    { key: 'patient', header: 'Patient', render: (row) => participantName(row.patientId) },
    { key: 'doctor', header: 'Doctor', render: (row) => participantName(row.doctorId) },
    {
      key: 'type',
      header: 'Type',
      render: (row) =>
        row.type === 'video' ? (
          <Chip label="Video Consultation" size="small" color="primary" />
        ) : (
          <Chip label="In-person (legacy)" size="small" variant="outlined" />
        ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader title="Health Officer Dashboard" subtitle="Video consultation queue and intake" />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Pending queue" value={queue?.total ?? 0} icon={<PendingActionsOutlinedIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Confirmed" value={confirmedToday?.total ?? 0} icon={<EventNoteOutlinedIcon />} color="success" />
        </Grid>
      </Grid>
      <DataTable
        columns={columns}
        rows={queue?.items ?? []}
        getRowId={(row) => row._id}
        loading={isFetching}
        emptyTitle="Queue is empty"
      />
    </>
  );
}

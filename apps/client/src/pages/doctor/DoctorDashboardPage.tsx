import { Chip, Grid, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import { DataTable, PageHeader, StatCard, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { Appointment } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListAppointmentsQuery } from '../../features/appointment/appointmentApi';

function patientName(entity: unknown): string {
  const populated = entity as { userId?: { firstName?: string; lastName?: string } } | undefined;
  const user = populated?.userId;
  return user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
}

export default function DoctorDashboardPage() {
  const navigate = useNavigate();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const { data: today, isFetching } = useListAppointmentsQuery({
    limit: 20,
    from: todayStart.toISOString(),
    to: todayEnd.toISOString(),
  });
  const { data: pending } = useListAppointmentsQuery({ limit: 1, status: 'pending' });

  const columns: DataTableColumn<Appointment>[] = [
    { key: 'time', header: 'Time', render: (row) => format(new Date(row.scheduledStart), 'p') },
    { key: 'patient', header: 'Patient', render: (row) => patientName(row.patientId) },
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
    { key: 'reason', header: 'Reason', render: (row) => row.reasonForVisit },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {row.status === 'confirmed' && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/app/doctor/consultations/start?appointmentId=${row._id}`)}
            >
              Start
            </Button>
          )}
          {row.type === 'video' && row.status === 'confirmed' && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate(`/app/doctor/video/${row._id}`)}
            >
              Join Video
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Doctor Dashboard"
        subtitle="Today's video consultation schedule at a glance"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/app/doctor/consultations')}>
              View All Consultations
            </Button>
          </Stack>
        }
      />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Today's appointments" value={today?.total ?? 0} icon={<EventNoteOutlinedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Pending approval" value={pending?.total ?? 0} icon={<PendingActionsOutlinedIcon />} color="warning" />
        </Grid>
      </Grid>
      <Stack spacing={2}>
        <DataTable
          columns={columns}
          rows={today?.items ?? []}
          getRowId={(row) => row._id}
          loading={isFetching}
          emptyTitle="No appointments today"
          emptyDescription="Your schedule is clear for today."
        />
      </Stack>
    </>
  );
}

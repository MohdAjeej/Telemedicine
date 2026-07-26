import { Grid, Stack } from '@mui/material';
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
    { key: 'reason', header: 'Reason', render: (row) => row.reasonForVisit },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader title="Doctor Dashboard" subtitle="Today's schedule at a glance" />
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
          emptyTitle="No appointments scheduled today"
        />
      </Stack>
    </>
  );
}

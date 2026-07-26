import { Button, Grid, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { DataTable, PageHeader, StatCard, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { Appointment } from '@telemedicine/types';
import { format } from 'date-fns';
import { useListAppointmentsQuery } from '../../features/appointment/appointmentApi';

function doctorName(entity: unknown): string {
  const populated = entity as { userId?: { firstName?: string; lastName?: string } } | undefined;
  const user = populated?.userId;
  return user ? `Dr. ${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
}

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const { data: upcoming, isFetching } = useListAppointmentsQuery({
    limit: 10,
    from: new Date().toISOString(),
  });

  const columns: DataTableColumn<Appointment>[] = [
    { key: 'when', header: 'When', render: (row) => format(new Date(row.scheduledStart), 'MMM d, p') },
    { key: 'doctor', header: 'Doctor', render: (row) => doctorName(row.doctorId) },
    { key: 'type', header: 'Type', render: (row) => (row.type === 'video' ? 'Video' : 'In-person') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <>
      <PageHeader
        title="My Dashboard"
        subtitle="Upcoming visits and health summary"
        actions={
          <Button variant="contained" onClick={() => navigate('/app/patient/book')}>
            Book appointment
          </Button>
        }
      />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Upcoming appointments" value={upcoming?.total ?? 0} icon={<EventNoteOutlinedIcon />} />
        </Grid>
      </Grid>
      <Stack spacing={2}>
        <DataTable
          columns={columns}
          rows={upcoming?.items ?? []}
          getRowId={(row) => row._id}
          loading={isFetching}
          emptyTitle="No upcoming appointments"
          emptyDescription="Book your next visit to see it here."
        />
      </Stack>
    </>
  );
}

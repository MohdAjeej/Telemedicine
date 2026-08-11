import { useState } from 'react';
import {
  Button,
  Stack,
  MenuItem,
  TextField,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import type { Appointment, AppointmentStatus } from '@telemedicine/types';
import { format } from 'date-fns';
import { useAppSelector } from '../../../app/hooks';
import {
  useCancelAppointmentMutation,
  useCompleteAppointmentMutation,
  useConfirmAppointmentMutation,
  useListAppointmentsQuery,
  useMarkAppointmentNoShowMutation,
  useRescheduleAppointmentMutation,
} from '../appointmentApi';

const STATUS_OPTIONS: Array<{ value: AppointmentStatus | ''; label: string }> = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No show' },
];

function participantName(entity: unknown): string {
  const populated = entity as { userId?: { firstName?: string; lastName?: string } } | undefined;
  const user = populated?.userId;
  return user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
}

export default function AppointmentListPage() {
  const role = useAppSelector((state) => state.auth.user?.role);
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<AppointmentStatus | ''>('');

  const { data, isFetching } = useListAppointmentsQuery({
    page: page + 1,
    limit: 10,
    status: status || undefined,
  });

  const [confirmAppointment] = useConfirmAppointmentMutation();
  const [completeAppointment] = useCompleteAppointmentMutation();
  const [markNoShow] = useMarkAppointmentNoShowMutation();
  const [cancelAppointment] = useCancelAppointmentMutation();
  const [rescheduleAppointment, { isLoading: isRescheduling }] = useRescheduleAppointmentMutation();

  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleValue, setRescheduleValue] = useState('');
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const canManage = role === 'doctor' || role === 'health_officer' || role === 'admin';
  const canJoinVideo = role === 'doctor' || role === 'patient';
  const canReschedule = role === 'health_officer';
  const roleSegment =
    role === 'doctor' ? 'doctor' : role === 'health_officer' ? 'health-officer' : role === 'patient' ? 'patient' : '';

  const openReschedule = (appointment: Appointment) => {
    setRescheduleError(null);
    setRescheduleValue(format(new Date(appointment.scheduledStart), "yyyy-MM-dd'T'HH:mm"));
    setRescheduleTarget(appointment);
  };

  const closeReschedule = () => {
    setRescheduleTarget(null);
    setRescheduleError(null);
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !rescheduleValue) return;
    setRescheduleError(null);
    try {
      await rescheduleAppointment({
        id: rescheduleTarget._id,
        scheduledStart: new Date(rescheduleValue).toISOString(),
      }).unwrap();
      closeReschedule();
    } catch (error) {
      const message =
        (error as { data?: { message?: string } })?.data?.message ?? 'Unable to reschedule appointment';
      setRescheduleError(message);
    }
  };

  const columns: DataTableColumn<Appointment>[] = [
    {
      key: 'when',
      header: 'When',
      render: (row) => format(new Date(row.scheduledStart), 'MMM d, yyyy p'),
    },
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
    { key: 'reason', header: 'Reason', render: (row) => row.reasonForVisit },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Stack direction="row" spacing={1}>
          {canJoinVideo && row.type === 'video' && row.status === 'confirmed' && (
            <>
              {role === 'doctor' && (
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/app/doctor/video-test/${row._id}`)}
                >
                  Test Video
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                onClick={() => navigate(`/app/${roleSegment}/video/${row._id}`)}
              >
                Join Video
              </Button>
            </>
          )}
          {canReschedule && (row.status === 'pending' || row.status === 'confirmed') && (
            <Button size="small" variant="outlined" onClick={() => openReschedule(row)}>
              Reschedule
            </Button>
          )}
          {canManage && row.status === 'pending' && (
            <Button size="small" variant="outlined" onClick={() => confirmAppointment(row._id)}>
              Confirm
            </Button>
          )}
          {canManage && row.status === 'confirmed' && (
            <Button size="small" variant="outlined" onClick={() => completeAppointment(row._id)}>
              Complete
            </Button>
          )}
          {canManage && row.status === 'confirmed' && (
            <Button size="small" color="warning" onClick={() => markNoShow(row._id)}>
              No-show
            </Button>
          )}
          {row.status !== 'completed' && row.status !== 'cancelled' && (
            <Button
              size="small"
              color="error"
              onClick={() => cancelAppointment({ id: row._id, reason: 'Cancelled from dashboard' })}
            >
              Cancel
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Video Consultations"
        subtitle="Track and manage video consultation appointments"
        actions={
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as AppointmentStatus | '');
              setPage(0);
            }}
            sx={{ minWidth: 180 }}
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        }
      />
      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowId={(row) => row._id}
        loading={isFetching}
        page={page}
        rowsPerPage={10}
        totalCount={data?.total ?? 0}
        onPageChange={setPage}
        onRowsPerPageChange={() => {}}
        emptyTitle="No appointments found"
      />

      <Dialog open={!!rescheduleTarget} onClose={closeReschedule} maxWidth="xs" fullWidth>
        <DialogTitle>Reschedule Video Consultation</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {rescheduleError && <Alert severity="error">{rescheduleError}</Alert>}
            <TextField
              label="New date & time"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={rescheduleValue}
              onChange={(event) => setRescheduleValue(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeReschedule}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleReschedule}
            disabled={isRescheduling || !rescheduleValue}
          >
            {isRescheduling ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

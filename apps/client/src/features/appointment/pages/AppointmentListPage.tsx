import { useState } from 'react';
import { Button, Stack, MenuItem, TextField } from '@mui/material';
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

  const canManage = role === 'doctor' || role === 'health_officer' || role === 'admin';
  const canJoinVideo = role === 'doctor' || role === 'health_officer';
  const roleSegment = role === 'doctor' ? 'doctor' : role === 'health_officer' ? 'health-officer' : '';

  const columns: DataTableColumn<Appointment>[] = [
    {
      key: 'when',
      header: 'When',
      render: (row) => format(new Date(row.scheduledStart), 'MMM d, yyyy p'),
    },
    { key: 'patient', header: 'Patient', render: (row) => participantName(row.patientId) },
    { key: 'doctor', header: 'Doctor', render: (row) => participantName(row.doctorId) },
    { key: 'type', header: 'Type', render: (row) => (row.type === 'video' ? 'Video' : 'In-person') },
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
        title="Appointments"
        subtitle="Track and manage appointment status"
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
    </>
  );
}

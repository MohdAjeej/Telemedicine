import { Grid, Paper, Stack, Typography } from '@mui/material';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { PageHeader, StatCard, StatusBadge } from '@telemedicine/ui';
import { useListHospitalsQuery } from '../../features/hospital/hospitalApi';
import { useListDoctorsQuery } from '../../features/doctor/doctorApi';
import { useListPatientsQuery } from '../../features/patient/patientApi';
import { useListAppointmentsQuery } from '../../features/appointment/appointmentApi';

export default function AdminDashboardPage() {
  const { data: hospitals } = useListHospitalsQuery({ limit: 1 });
  const { data: doctors } = useListDoctorsQuery({ limit: 1 });
  const { data: patients } = useListPatientsQuery({ limit: 1 });
  const { data: appointments } = useListAppointmentsQuery({ limit: 1 });

  // Each status needs its own query — hooks can't be called inside a loop/map.
  const { data: pending } = useListAppointmentsQuery({ limit: 1, status: 'pending' });
  const { data: confirmed } = useListAppointmentsQuery({ limit: 1, status: 'confirmed' });
  const { data: completed } = useListAppointmentsQuery({ limit: 1, status: 'completed' });
  const { data: cancelled } = useListAppointmentsQuery({ limit: 1, status: 'cancelled' });
  const { data: noShow } = useListAppointmentsQuery({ limit: 1, status: 'no_show' });

  const statusCounts = [
    { status: 'pending', total: pending?.total ?? 0 },
    { status: 'confirmed', total: confirmed?.total ?? 0 },
    { status: 'completed', total: completed?.total ?? 0 },
    { status: 'cancelled', total: cancelled?.total ?? 0 },
    { status: 'no_show', total: noShow?.total ?? 0 },
  ] as const;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide overview" />
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Hospitals" value={hospitals?.total ?? 0} icon={<LocalHospitalOutlinedIcon />} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Doctors" value={doctors?.total ?? 0} icon={<MedicalServicesOutlinedIcon />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Patients" value={patients?.total ?? 0} icon={<PeopleAltOutlinedIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="Appointments" value={appointments?.total ?? 0} icon={<EventNoteOutlinedIcon />} color="warning" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          Appointments by status
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
          {statusCounts.map(({ status, total }) => (
            <Stack key={status} direction="row" spacing={1} alignItems="center">
              <StatusBadge status={status} />
              <Typography variant="h6" fontWeight={700}>
                {total}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>
    </>
  );
}

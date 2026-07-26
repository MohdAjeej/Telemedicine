import { PageHeader } from '@telemedicine/ui';
import { Typography } from '@mui/material';
import { useGetMyHealthOfficerProfileQuery } from '../healthOfficerApi';

export default function HealthOfficerProfilePage() {
  const { data } = useGetMyHealthOfficerProfileQuery();

  return (
    <>
      <PageHeader title="My Profile" subtitle="Your health officer account details" />
      <Typography>Assigned clinic: {data?.assignedClinic ?? 'Not assigned yet'}</Typography>
      <Typography>Employee ID: {data?.employeeId ?? '—'}</Typography>
    </>
  );
}

import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EmptyState, PageHeader } from '@telemedicine/ui';
import { useListPrescriptionsQuery } from '../../features/prescription/prescriptionApi';
import { PrescriptionCard } from '../../features/prescription/components/PrescriptionCard';

export default function PatientDashboardPage() {
  const navigate = useNavigate();
  const { data: prescriptions = [] } = useListPrescriptionsQuery({ limit: 3 });

  return (
    <>
      <PageHeader
        title="My Dashboard"
        subtitle="Your health summary"
        actions={
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/app/patient/consultations')}>
              View History
            </Button>
          </Stack>
        }
      />

      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight={600}>
            Recent Prescriptions
          </Typography>
          <Button size="small" onClick={() => navigate('/app/patient/prescriptions')}>
            View All
          </Button>
        </Stack>

        {prescriptions.length === 0 ? (
          <EmptyState
            title="No prescriptions yet"
            description="Medications your care team prescribes will show up here."
          />
        ) : (
          <Stack spacing={1.5}>
            {prescriptions.map((prescription) => (
              <PrescriptionCard key={prescription._id} prescription={prescription} />
            ))}
          </Stack>
        )}
      </Stack>
    </>
  );
}

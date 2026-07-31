import { PageHeader, EmptyState } from '@telemedicine/ui';
import { Stack } from '@mui/material';
import { useListPrescriptionsQuery } from '../prescriptionApi';
import { PrescriptionCard } from '../components/PrescriptionCard';

export default function PrescriptionsPage() {
  const { data: prescriptions = [] } = useListPrescriptionsQuery();

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Medications prescribed by your care team" />
      {prescriptions.length === 0 ? (
        <EmptyState title="No prescriptions yet" />
      ) : (
        <Stack spacing={2}>
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription._id} prescription={prescription} />
          ))}
        </Stack>
      )}
    </>
  );
}

import { Button, Stack } from '@mui/material';
import { EmptyState, PageHeader } from '@telemedicine/ui';
import { useCancelPrescriptionMutation, useListPrescriptionsQuery } from '../prescriptionApi';
import { PrescriptionCard } from '../components/PrescriptionCard';

function patientName(entity: unknown): string {
  const populated = entity as { userId?: { firstName?: string; lastName?: string } } | undefined;
  const user = populated?.userId;
  return user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : '—';
}

export default function DoctorPrescriptionsPage() {
  const { data: prescriptions = [] } = useListPrescriptionsQuery({ limit: 100 });
  const [cancelPrescription, { isLoading: isCancelling }] = useCancelPrescriptionMutation();

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Medications you've prescribed to patients" />
      {prescriptions.length === 0 ? (
        <EmptyState
          title="No prescriptions yet"
          description="Prescriptions you create during consultations will show up here."
        />
      ) : (
        <Stack spacing={2}>
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription._id}
              prescription={prescription}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              patientName={patientName(prescription.patientId as any)}
              actions={
                prescription.status === 'active' ? (
                  <Button
                    size="small"
                    color="error"
                    disabled={isCancelling}
                    onClick={() => cancelPrescription(prescription._id)}
                  >
                    Cancel
                  </Button>
                ) : undefined
              }
            />
          ))}
        </Stack>
      )}
    </>
  );
}

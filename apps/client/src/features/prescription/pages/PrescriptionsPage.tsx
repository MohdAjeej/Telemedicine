import { PageHeader, StatusBadge, EmptyState } from '@telemedicine/ui';
import { Card, CardContent, Stack, Typography, Chip } from '@mui/material';
import { format } from 'date-fns';
import { useListPrescriptionsQuery } from '../prescriptionApi';

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
            <Card key={prescription._id} variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {format(new Date(prescription.issuedAt), 'MMM d, yyyy')}
                  </Typography>
                  <StatusBadge status={prescription.status} />
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {prescription.medications.map((medication, index) => (
                    <Chip
                      key={`${prescription._id}-${index}`}
                      label={`${medication.name} — ${medication.dosage}, ${medication.frequency}`}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}

import { useState } from 'react';
import { Alert, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { EmptyState, PageHeader } from '@telemedicine/ui';
import type { Patient, User } from '@telemedicine/types';
import { useGetMyHealthOfficerProfileQuery } from '../../features/healthOfficer/healthOfficerApi';
import { useListPatientsQuery } from '../../features/patient/patientApi';
import { useListPrescriptionsQuery } from '../../features/prescription/prescriptionApi';
import { PrescriptionCard } from '../../features/prescription/components/PrescriptionCard';

function patientName(patient: Patient): string {
  const user = (patient.userId as unknown as User) ?? ({} as Partial<User>);
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (name && user.email) return `${name} (${user.email})`;
  return name || user.email || 'Patient';
}

export default function PrescriptionsPage() {
  const [patientId, setPatientId] = useState('');
  const { data: officer } = useGetMyHealthOfficerProfileQuery();
  const hospitalId = officer?.hospitalId ?? '';
  const { data: patients } = useListPatientsQuery(
    hospitalId ? { hospitalId, limit: 100 } : { limit: 100 },
  );
  const noPatients = (patients?.items?.length ?? 0) === 0;

  const { data: prescriptions = [] } = useListPrescriptionsQuery(
    { patientId },
    { skip: !patientId },
  );

  return (
    <>
      <PageHeader title="Prescriptions" subtitle="Look up a patient's prescribed medications" />

      {noPatients && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No patients found at your hospital yet.
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          select
          label="Patient"
          fullWidth
          value={patientId}
          onChange={(event) => setPatientId(event.target.value)}
          helperText="Select a patient to view their prescriptions"
        >
          {(patients?.items ?? []).map((patient) => (
            <MenuItem key={patient._id} value={patient._id}>
              {patientName(patient)}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {patientId ? (
        prescriptions.length === 0 ? (
          <EmptyState title="No prescriptions yet" description="This patient has no prescriptions on record." />
        ) : (
          <Stack spacing={2}>
            {prescriptions.map((prescription) => (
              <PrescriptionCard key={prescription._id} prescription={prescription} />
            ))}
          </Stack>
        )
      ) : (
        <Typography variant="body2" color="text.secondary">
          Select a patient above to see their prescriptions.
        </Typography>
      )}
    </>
  );
}

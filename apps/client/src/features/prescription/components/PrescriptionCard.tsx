import type { ReactNode } from 'react';
import { Card, CardContent, Chip, Divider, Stack, Typography } from '@mui/material';
import { StatusBadge } from '@telemedicine/ui';
import type { Prescription } from '@telemedicine/types';
import { format } from 'date-fns';

function Field({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <Typography variant="body2" color="text.secondary">
      <strong>{label}:</strong> {value}
    </Typography>
  );
}

export interface PrescriptionCardProps {
  prescription: Prescription;
  /** Shown when this card appears in a multi-patient context (doctor/health-officer views). */
  patientName?: string;
  /** Role-specific actions (e.g. a doctor's Cancel button), rendered top-right next to the status badge. */
  actions?: ReactNode;
}

export function PrescriptionCard({ prescription, patientName, actions }: PrescriptionCardProps) {
  const hasIntakeDetails =
    prescription.chiefComplaints ||
    prescription.complaints ||
    prescription.symptoms ||
    prescription.comorbidity ||
    prescription.allergy ||
    prescription.otherIllness;

  const hasClinicalDetails =
    prescription.clinicalFindings || prescription.provisionalDiagnosis || prescription.finalDiagnosis;

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: patientName ? 0.5 : 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {format(new Date(prescription.issuedAt), 'MMM d, yyyy')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <StatusBadge status={prescription.status} />
            {actions}
          </Stack>
        </Stack>

        {patientName && (
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
            Patient: {patientName}
          </Typography>
        )}

        {hasIntakeDetails && (
          <>
            <Stack spacing={0.5} sx={{ mb: 1.5 }}>
              <Field label="Chief Complaints" value={prescription.chiefComplaints} />
              <Field label="Complaints" value={prescription.complaints} />
              <Field label="Symptoms" value={prescription.symptoms} />
              <Field label="Comorbidity" value={prescription.comorbidity} />
              <Field label="Allergy" value={prescription.allergy} />
              <Field label="Other Illness" value={prescription.otherIllness} />
            </Stack>
            <Divider sx={{ mb: 1.5 }} />
          </>
        )}

        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
          {prescription.medications.map((medication, index) => (
            <Chip
              key={`${prescription._id}-med-${index}`}
              label={`${medication.name} — ${medication.dosage}, ${medication.frequency}`}
              variant="outlined"
            />
          ))}
        </Stack>

        {hasClinicalDetails && (
          <Stack spacing={0.5} sx={{ mb: 1.5 }}>
            <Field label="Clinical Findings" value={prescription.clinicalFindings} />
            <Field label="Provisional Diagnosis" value={prescription.provisionalDiagnosis} />
            <Field label="Final Diagnosis" value={prescription.finalDiagnosis} />
          </Stack>
        )}

        <Field label="Advice" value={prescription.advice} />

        {prescription.labTests.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center" sx={{ mt: 1.5 }}>
            <Typography variant="body2" fontWeight={600} color="text.secondary">
              Lab Tests:
            </Typography>
            {prescription.labTests.map((test, index) => (
              <Chip key={`${prescription._id}-lab-${index}`} label={test} size="small" />
            ))}
          </Stack>
        )}

        {prescription.followUpDate && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            <strong>Follow-up:</strong> {format(new Date(prescription.followUpDate), 'MMM d, yyyy')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

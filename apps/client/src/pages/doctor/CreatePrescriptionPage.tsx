import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '@mui/material';
import { LoadingSpinner, PageHeader } from '@telemedicine/ui';
import { PrescriptionForm } from '../../features/prescription/components/PrescriptionForm';
import { useGetConsultationQuery } from '../../features/consultation/consultationApi';
import { useGetAppointmentQuery } from '../../features/appointment/appointmentApi';

export default function CreatePrescriptionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const consultationId = searchParams.get('consultationId') || '';

  const { data: consultation, isLoading: isLoadingConsultation } = useGetConsultationQuery(
    consultationId,
    { skip: !consultationId },
  );
  const { data: appointment } = useGetAppointmentQuery(consultation?.appointmentId || '', {
    skip: !consultation?.appointmentId,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientInfo = appointment?.patientId as any;
  const patientName = patientInfo?.userId
    ? `${patientInfo.userId.firstName} ${patientInfo.userId.lastName}`
    : 'Unknown Patient';

  if (!consultationId) {
    return (
      <>
        <PageHeader title="Create Prescription" subtitle="Prescribe medications for patient" />
        <Alert severity="error">
          No consultation selected. Open this page from a consultation's "Create Prescription" action.
        </Alert>
      </>
    );
  }

  if (isLoadingConsultation) return <LoadingSpinner label="Loading consultation..." />;

  return (
    <>
      <PageHeader title="Create Prescription" subtitle={`Patient: ${patientName}`} />
      <PrescriptionForm
        consultationId={consultationId}
        onSaved={() => navigate(`/app/doctor/consultations/${consultationId}`)}
        onCancel={() => navigate(-1)}
      />
    </>
  );
}

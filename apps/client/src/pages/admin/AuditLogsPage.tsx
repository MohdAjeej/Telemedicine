import { PageHeader } from '@telemedicine/ui';
import { Typography } from '@mui/material';

export default function AuditLogsPage() {
  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Security and activity trail" />
      <Typography color="text.secondary">
        Every login, refresh, appointment status change, and administrative action is already
        being recorded server-side. This screen for browsing and filtering that trail is completed
        in a later phase.
      </Typography>
    </>
  );
}

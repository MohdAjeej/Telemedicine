import { PageHeader } from '@telemedicine/ui';
import { Typography } from '@mui/material';

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" subtitle="Platform-wide trends and utilization" />
      <Typography color="text.secondary">
        Detailed analytics and reports are completed in a later phase, building on the same
        appointment and consultation data shown on the dashboard.
      </Typography>
    </>
  );
}

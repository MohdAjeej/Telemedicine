import { PageHeader, EmptyState } from '@telemedicine/ui';
import VideoCameraFrontOutlinedIcon from '@mui/icons-material/VideoCameraFrontOutlined';

export default function VideoConsultationPage() {
  return (
    <>
      <PageHeader title="Video Consultation" subtitle="Join a scheduled video visit" />
      <EmptyState
        icon={<VideoCameraFrontOutlinedIcon fontSize="inherit" />}
        title="No active video session"
        description="WebRTC video consultation launches from a confirmed video appointment. This module is completed in a later phase."
      />
    </>
  );
}

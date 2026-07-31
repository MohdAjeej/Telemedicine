import { useParams } from 'react-router-dom';
import { Paper, Stack, Typography, Box, Chip, Divider, Alert } from '@mui/material';
import { PageHeader, LoadingSpinner } from '@telemedicine/ui';
import { useGetConsultationQuery } from '../../features/consultation/consultationApi';
import { format } from 'date-fns';

export default function ConsultationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: consultation, isLoading } = useGetConsultationQuery(id!, { skip: !id });

  if (isLoading) return <LoadingSpinner />;

  if (!consultation) {
    return (
      <>
        <PageHeader title="Consultation Details" subtitle="View consultation information" />
        <Alert severity="error">Consultation not found</Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Consultation Details"
        subtitle={format(new Date(consultation.startedAt), 'PPPP')}
        actions={
          <Chip
            label={consultation.status === 'completed' ? 'Completed' : 'In Progress'}
            color={consultation.status === 'completed' ? 'success' : 'primary'}
          />
        }
      />

      <Paper sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="text.secondary">
              Chief Complaint
            </Typography>
            <Typography variant="body1">{consultation.chiefComplaint || '—'}</Typography>
          </Box>

          <Divider />

          {consultation.diagnosis && (
            <Box>
              <Typography variant="overline" color="text.secondary">
                Diagnosis
              </Typography>
              <Typography variant="body1">{consultation.diagnosis}</Typography>
            </Box>
          )}

          {consultation.notes && (
            <Box>
              <Typography variant="overline" color="text.secondary">
                Clinical Notes
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {consultation.notes}
              </Typography>
            </Box>
          )}

          {consultation.followUpRequired && (
            <Box>
              <Alert severity="info">
                Follow-up appointment recommended
                {consultation.followUpDate &&
                  ` on ${format(new Date(consultation.followUpDate), 'PPP')}`}
              </Alert>
            </Box>
          )}

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary">
              Timeline
            </Typography>
            <Typography variant="body2">
              Started: {format(new Date(consultation.startedAt), 'PPp')}
            </Typography>
            {consultation.endedAt && (
              <Typography variant="body2">
                Ended: {format(new Date(consultation.endedAt), 'PPp')}
              </Typography>
            )}
          </Box>
        </Stack>
      </Paper>
    </>
  );
}

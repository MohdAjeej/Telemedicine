import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Badge,
  Box,
  Paper,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Snackbar,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import { SOCKET_EVENTS } from '@telemedicine/constants';
import type { LabReport, Message, Vital } from '@telemedicine/types';
import { DataTable, LoadingSpinner, PageHeader, StatusBadge, type DataTableColumn } from '@telemedicine/ui';
import { format } from 'date-fns';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useGetVideoRoomQuery } from '../../features/video/videoApi';
import { useGetAppointmentQuery } from '../../features/appointment/appointmentApi';
import { useListVitalsQuery } from '../../features/vital/vitalApi';
import { useListLabReportsQuery } from '../../features/labReport/labReportApi';
import { useStartConsultationMutation } from '../../features/consultation/consultationApi';
import { PrescriptionForm } from '../../features/prescription/components/PrescriptionForm';
import {
  messageApi,
  useListMessagesQuery,
  useSendMessageMutation,
  useStartConversationMutation,
} from '../../features/message/messageApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

const vitalColumns: DataTableColumn<Vital>[] = [
  { key: 'date', header: 'Date', render: (row) => format(new Date(row.recordedAt), 'MMM d, yyyy p') },
  {
    key: 'bp',
    header: 'Blood pressure',
    render: (row) =>
      row.bloodPressureSystolic && row.bloodPressureDiastolic
        ? `${row.bloodPressureSystolic}/${row.bloodPressureDiastolic}`
        : '—',
  },
  { key: 'hr', header: 'Heart rate', render: (row) => row.heartRate ?? '—' },
  { key: 'temp', header: 'Temperature', render: (row) => row.temperature ?? '—' },
  { key: 'spo2', header: 'SpO2', render: (row) => row.oxygenSaturation ?? '—' },
  { key: 'bmi', header: 'BMI', render: (row) => row.bmi ?? '—' },
  { key: 'bloodSugar', header: 'Blood sugar', render: (row) => row.bloodSugar ?? '—' },
  { key: 'symptoms', header: 'Symptoms', render: (row) => row.symptoms ?? '—' },
];

const labReportColumns: DataTableColumn<LabReport>[] = [
  { key: 'test', header: 'Test', render: (row) => row.testType },
  { key: 'requested', header: 'Requested', render: (row) => format(new Date(row.requestedAt), 'MMM d, yyyy') },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'summary', header: 'Summary', render: (row) => row.resultSummary ?? '—' },
];

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

function participantUserId(entity: unknown): string | undefined {
  const populated = entity as { userId?: { _id?: string } | string } | undefined;
  const userId = populated?.userId;
  if (!userId) return undefined;
  return typeof userId === 'string' ? userId : userId._id;
}

function participantName(entity: unknown): string {
  const populated = entity as { userId?: { firstName?: string; lastName?: string } } | undefined;
  const user = populated?.userId;
  return user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : 'the other participant';
}

/** message.senderId comes back populated (a full User) from the list endpoint, not a bare id. */
function messageSenderId(message: Message): string | undefined {
  const raw = message.senderId as unknown as { _id?: string } | string;
  return typeof raw === 'string' ? raw : raw?._id;
}

export default function VideoConsultationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [callEnded, setCallEnded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { data: room, isLoading, error: roomError } = useGetVideoRoomQuery(appointmentId!, {
    skip: !appointmentId,
  });
  const { data: appointment } = useGetAppointmentQuery(appointmentId!, { skip: !appointmentId });

  const otherUserId =
    participantUserId(appointment?.doctorId) === currentUserId
      ? participantUserId(appointment?.healthOfficerId)
      : participantUserId(appointment?.doctorId);
  const otherName = participantUserId(appointment?.doctorId) === currentUserId
    ? participantName(appointment?.healthOfficerId)
    : participantName(appointment?.doctorId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientInfo = appointment?.patientId as any;
  const patientName = patientInfo?.userId
    ? `${patientInfo.userId.firstName} ${patientInfo.userId.lastName}`
    : 'Unknown Patient';
  const patientId: string | undefined = patientInfo?._id;
  const showDoctorPanel = currentUserRole === 'doctor';

  const { data: vitals = [], isFetching: isFetchingVitals } = useListVitalsQuery(
    { patientId },
    { skip: !patientId || !showDoctorPanel },
  );
  const { data: labReports = [], isFetching: isFetchingLabReports } = useListLabReportsQuery(
    { patientId },
    { skip: !patientId || !showDoctorPanel },
  );

  const [rightTab, setRightTab] = useState<'vitals' | 'testResults' | 'prescription'>('vitals');
  const [startConsultation] = useStartConsultationMutation();
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [consultationError, setConsultationError] = useState<string | null>(null);
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  // A doctor can join a video call straight from a confirmed appointment without
  // having gone through the separate "Start Consultation" flow first — but writing
  // a prescription requires a consultationId, so ensure one exists (idempotent:
  // the server returns the existing consultation for this appointment if already started).
  useEffect(() => {
    if (!showDoctorPanel || !appointmentId) return;
    let cancelled = false;
    startConsultation({ appointmentId, chiefComplaint: '' })
      .unwrap()
      .then((consultation) => {
        if (!cancelled) setConsultationId(consultation._id);
      })
      .catch(() => {
        if (!cancelled) setConsultationError('Unable to start a consultation for this appointment.');
      });
    return () => {
      cancelled = true;
    };
  }, [showDoctorPanel, appointmentId, startConsultation]);

  const [startConversation] = useStartConversationMutation();
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    if (!otherUserId) return;
    let cancelled = false;
    startConversation({ otherUserId })
      .unwrap()
      .then((conversation) => {
        if (!cancelled) setConversationId(conversation._id);
      })
      .catch(() => {
        /* chat is a convenience layer on top of the call; ignore failures silently */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherUserId]);

  const { data: messages = [] } = useListMessagesQuery(conversationId!, { skip: !conversationId });
  // The list endpoint returns newest-first with a cap; always re-sort to chronological
  // order for display rather than trusting array insertion order (realtime pushes append).
  const orderedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  // Live chat delivery: a lightweight socket connection scoped to this page,
  // separate from useWebRTC's signaling socket, merged straight into the
  // RTK Query cache so useListMessagesQuery stays the single source of truth.
  useEffect(() => {
    if (!conversationId || !accessToken) return;
    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
    });

    socket.on(SOCKET_EVENTS.MESSAGE_NEW, (message: Message) => {
      if (message.conversationId !== conversationId) return;
      dispatch(
        messageApi.util.updateQueryData('listMessages', conversationId, (draftMessages) => {
          if (!draftMessages.some((existing) => existing._id === message._id)) {
            draftMessages.push(message);
          }
        }),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [conversationId, accessToken, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [orderedMessages.length, chatOpen]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !conversationId) return;
    setDraft('');
    try {
      await sendMessage({ conversationId, content }).unwrap();
    } catch {
      setDraft(content);
    }
  };

  const {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    error: webrtcError,
    toggleAudio,
    toggleVideo,
    endCall,
  } = useWebRTC({
    roomId: room?.roomId || '',
    accessToken,
    onCallEnded: () => {
      setCallEnded(true);
      setTimeout(() => navigate(-1), 3000);
    },
  });

  // Attach local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const handleEndCall = () => {
    endCall();
    setCallEnded(true);
    setTimeout(() => navigate(-1), 2000);
  };

  // Keeps the button icon/state in sync when fullscreen is exited via Esc or
  // the browser's own UI, not just via our toggle button.
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!appointmentId) {
    return (
      <>
        <PageHeader title="Video Consultation" subtitle="Join a scheduled video visit" />
        <Alert severity="error">No appointment ID provided</Alert>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Video Consultation" subtitle="Connecting..." />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (roomError || webrtcError) {
    return (
      <>
        <PageHeader title="Video Consultation" subtitle="Connection error" />
        <Alert severity="error">
          {webrtcError || 'Failed to connect to video room. Please check your permissions and try again.'}
        </Alert>
      </>
    );
  }

  if (callEnded) {
    return (
      <>
        <PageHeader title="Video Consultation" subtitle="Call ended" />
        <Alert severity="info">The call has ended. Redirecting...</Alert>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Video Consultation"
        subtitle={`Room: ${room?.roomId}`}
        actions={
          <Chip
            label={connectionState === 'connected' ? 'Connected' : connectionState}
            color={connectionState === 'connected' ? 'success' : 'default'}
            size="small"
          />
        }
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ height: 'calc(100vh - 200px)' }}>
      <Box
        ref={videoContainerRef}
        sx={{
          position: 'relative',
          flex: showDoctorPanel ? '0 0 50%' : '1 1 100%',
          minWidth: 0,
          minHeight: 0,
          height: '100%',
          bgcolor: 'black',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {/* Remote Video (main view) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000',
          }}
        />

        {/* Local Video (picture-in-picture) */}
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 240,
            height: 180,
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: 'scaleX(-1)', // Mirror effect
            }}
          />
          {!isVideoEnabled && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.800',
              }}
            >
              <Typography variant="body2" color="white">
                Camera Off
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Chat panel */}
        {chatOpen && (
          <Paper
            elevation={6}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: { xs: '100%', sm: 320 },
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 0,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Chat with {otherName}
              </Typography>
              <IconButton size="small" onClick={() => setChatOpen(false)} aria-label="Close chat">
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
              <Stack spacing={1}>
                {orderedMessages.length === 0 && (
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                    No messages yet. Say hello.
                  </Typography>
                )}
                {orderedMessages.map((message) => {
                  const isOwn = messageSenderId(message) === currentUserId;
                  return (
                    <Box
                      key={message._id}
                      sx={{
                        alignSelf: isOwn ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        bgcolor: isOwn ? 'primary.main' : 'action.selected',
                        color: isOwn ? 'primary.contrastText' : 'text.primary',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.75,
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                    </Box>
                  );
                })}
                <div ref={messagesEndRef} />
              </Stack>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
            >
              <TextField
                size="small"
                fullWidth
                placeholder="Type a message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                disabled={!conversationId}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!conversationId || !draft.trim() || isSending}
                aria-label="Send message"
              >
                <SendRoundedIcon />
              </IconButton>
            </Stack>
          </Paper>
        )}

        {/* Controls */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 3,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="center">
            <IconButton
              onClick={toggleAudio}
              sx={{
                bgcolor: isAudioEnabled ? 'background.paper' : 'error.main',
                color: isAudioEnabled ? 'text.primary' : 'white',
                '&:hover': {
                  bgcolor: isAudioEnabled ? 'background.paper' : 'error.dark',
                },
              }}
              size="large"
            >
              {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            <IconButton
              onClick={toggleVideo}
              sx={{
                bgcolor: isVideoEnabled ? 'background.paper' : 'error.main',
                color: isVideoEnabled ? 'text.primary' : 'white',
                '&:hover': {
                  bgcolor: isVideoEnabled ? 'background.paper' : 'error.dark',
                },
              }}
              size="large"
            >
              {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>

            <IconButton
              onClick={() => setChatOpen((open) => !open)}
              sx={{
                bgcolor: chatOpen ? 'primary.main' : 'background.paper',
                color: chatOpen ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: chatOpen ? 'primary.dark' : 'background.paper',
                },
              }}
              size="large"
            >
              <Badge
                color="secondary"
                variant="dot"
                invisible={chatOpen || orderedMessages.length === 0}
              >
                <ChatBubbleOutlineRoundedIcon />
              </Badge>
            </IconButton>

            <IconButton
              onClick={toggleFullscreen}
              sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
              size="large"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
            </IconButton>

            <IconButton
              onClick={handleEndCall}
              sx={{
                bgcolor: 'error.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
              size="large"
            >
              <CallEndIcon />
            </IconButton>
          </Stack>

          {connectionState !== 'connected' && (
            <Typography variant="caption" color="white" align="center" display="block" mt={1}>
              {connectionState === 'connecting' && 'Connecting to peer...'}
              {connectionState === 'new' && 'Waiting for peer to join...'}
              {connectionState === 'disconnected' && 'Disconnected. Attempting to reconnect...'}
              {connectionState === 'failed' && 'Connection failed. Please refresh the page.'}
            </Typography>
          )}
        </Box>
      </Box>

      {showDoctorPanel && (
        <Paper sx={{ flex: '0 0 50%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ px: 3, pt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Patient: {patientName}
            </Typography>
            <Tabs value={rightTab} onChange={(_event, value) => setRightTab(value)}>
              <Tab label="Vitals" value="vitals" />
              <Tab label="Test Results" value="testResults" />
              <Tab label="Prescription" value="prescription" />
            </Tabs>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
            {rightTab === 'vitals' && (
              <DataTable
                columns={vitalColumns}
                rows={vitals}
                getRowId={(row) => row._id}
                loading={isFetchingVitals}
                emptyTitle="No vitals recorded yet"
                emptyDescription="The health officer hasn't recorded any vitals for this patient yet."
              />
            )}

            {rightTab === 'testResults' && (
              <DataTable
                columns={labReportColumns}
                rows={labReports}
                getRowId={(row) => row._id}
                loading={isFetchingLabReports}
                emptyTitle="No lab tests on record"
                emptyDescription="No lab tests have been requested for this patient yet."
              />
            )}

            {rightTab === 'prescription' &&
              (consultationError ? (
                <Alert severity="error">{consultationError}</Alert>
              ) : !consultationId ? (
                <LoadingSpinner label="Preparing consultation..." />
              ) : (
                <PrescriptionForm consultationId={consultationId} onSaved={() => setPrescriptionSaved(true)} />
              ))}
          </Box>
        </Paper>
      )}
      </Stack>

      <Snackbar open={prescriptionSaved} autoHideDuration={3000} onClose={() => setPrescriptionSaved(false)}>
        <Alert severity="success" onClose={() => setPrescriptionSaved(false)}>
          Prescription saved
        </Alert>
      </Snackbar>
    </>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Badge,
  Box,
  Paper,
  IconButton,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tabs,
  TextField,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Chip,
  Snackbar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import { SOCKET_EVENTS } from '@telemedicine/constants';
import type { LabReport, Message, Recording, Vital } from '@telemedicine/types';
import {
  DataTable,
  EmptyState,
  LoadingSpinner,
  PageHeader,
  ReportViewerPanel,
  StatusBadge,
  type DataTableColumn,
} from '@telemedicine/ui';
import { format } from 'date-fns';
import { useCallContext } from '../../features/videoCall/useCallContext';
import { DraggablePanel } from '../../features/videoCall/DraggablePanel';
import { useHeaderContent } from '../../components/layout/HeaderContentContext';
import { useCallRecording } from '../../hooks/useCallRecording';
import { useGetVideoRoomQuery } from '../../features/video/videoApi';
import { useGetAppointmentQuery } from '../../features/appointment/appointmentApi';
import { useListVitalsQuery } from '../../features/vital/vitalApi';
import { useListLabReportsQuery } from '../../features/labReport/labReportApi';
import { useStartConsultationMutation } from '../../features/consultation/consultationApi';
import {
  useListRecordingsQuery,
  useUploadRecordingMutation,
  useDeleteRecordingMutation,
} from '../../features/recording/recordingApi';
import { PrescriptionForm } from '../../features/prescription/components/PrescriptionForm';
import {
  messageApi,
  useListMessagesQuery,
  useSendMessageMutation,
  useStartConversationMutation,
} from '../../features/message/messageApi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';

// Reserves room for the absolutely-positioned control bar (mic/camera/chat/record
// buttons, ~56px IconButtons + 24px padding top and bottom) at the bottom of the
// video container, so the chat/recordings side panels stop above it instead of
// the control bar stacking on top of — and hiding — their bottom edge.
const CONTROL_BAR_HEIGHT = 104;

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

const vitalColumns: DataTableColumn<Vital>[] = [
  { key: 'date', header: 'Date', render: (row) => format(new Date(row.recordedAt), 'MMM d, yyyy p') },
  { key: 'age', header: 'Age', render: (row) => row.age ?? '—' },
  { key: 'gender', header: 'Gender', render: (row) => row.gender ?? '—' },
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
  { key: 'hemoglobin', header: 'Hemoglobin', render: (row) => row.hemoglobin ?? '—' },
  { key: 'comorbidity', header: 'Comorbidity', render: (row) => row.comorbidity ?? '—' },
  { key: 'complaints', header: 'Complaints', render: (row) => row.complaints ?? '—' },
  { key: 'symptoms', header: 'Symptoms', render: (row) => row.symptoms ?? '—' },
];

/** Same markup/CSS as DataTable (Paper variant="outlined" > TableContainer > Table > TableBody,
 * Skeleton loading rows, EmptyState, row hover) — axes swapped: vitalColumns become rows,
 * vitals become columns, instead of the other way around. */
function VitalsHistoryPanel({ vitals, loading }: { vitals: Vital[]; loading: boolean }) {
  return (
    <Paper variant="outlined">
      <TableContainer>
        <Table>
          <TableBody>
            {loading &&
              vitalColumns.map((column) => (
                <TableRow key={column.key}>
                  <TableCell component="th" scope="row">
                    {column.header}
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" />
                  </TableCell>
                </TableRow>
              ))}
            {!loading &&
              vitalColumns.map((column) => (
                <TableRow key={column.key} hover>
                  <TableCell component="th" scope="row">
                    {column.header}
                  </TableCell>
                  {vitals.map((vital) => (
                    <TableCell key={vital._id}>{column.render(vital)}</TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      {!loading && vitals.length === 0 && (
        <EmptyState
          title="No vitals recorded yet"
          description="The health officer hasn't recorded any vitals for this patient yet."
        />
      )}
    </Paper>
  );
}

function createLabReportColumns(onViewReport: (url: string) => void): DataTableColumn<LabReport>[] {
  return [
    {
      key: 'test',
      header: 'Test',
      render: (row) => (
        <Stack spacing={0.5} alignItems="flex-start">
          <Typography variant="body2">{row.testType}</Typography>
          {row.resultFileUrl && (
            <Button
              size="small"
              variant="text"
              onClick={() => onViewReport(row.resultFileUrl!)}
              sx={{ minWidth: 0, p: 0 }}
            >
              View Report
            </Button>
          )}
        </Stack>
      ),
    },
    { key: 'requested', header: 'Requested', render: (row) => format(new Date(row.requestedAt), 'MMM d, yyyy') },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { key: 'summary', header: 'Summary', render: (row) => row.resultSummary ?? '—' },
  ];
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

function participantUserId(entity: unknown): string | undefined {
  const populated = entity as { userId?: { _id?: string } | string } | undefined;
  const userId = populated?.userId;
  if (!userId) return undefined;
  return typeof userId === 'string' ? userId : userId._id;
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
  const currentUser = useAppSelector((state) => state.auth.user);
  const currentUserId = currentUser?.id;
  const currentUserRole = currentUser?.role;

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [callEnded, setCallEnded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [recordingsPanelOpen, setRecordingsPanelOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: room, isLoading, error: roomError } = useGetVideoRoomQuery(appointmentId!, {
    skip: !appointmentId,
  });
  const { data: appointment } = useGetAppointmentQuery(appointmentId!, { skip: !appointmentId });

  const otherUserId =
    participantUserId(appointment?.doctorId) === currentUserId
      ? participantUserId(appointment?.patientId)
      : participantUserId(appointment?.doctorId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const patientInfo = appointment?.patientId as any;
  const patientName = patientInfo?.userId
    ? `${patientInfo.userId.firstName} ${patientInfo.userId.lastName}`
    : 'Unknown Patient';
  const patientId: string | undefined = patientInfo?._id;
  const doctorName = currentUser ? `${currentUser.firstName ?? ''} ${currentUser.lastName ?? ''}`.trim() : '';
  const showDoctorPanel = currentUserRole === 'doctor';
  // Video calls are Doctor <-> Patient only (see videoService) — recording is
  // kept doctor-controlled, matching who could record before this page also
  // stopped admitting the health officer.
  const canRecord = currentUserRole === 'doctor';

  const { data: vitals = [], isFetching: isFetchingVitals } = useListVitalsQuery(
    { patientId },
    { skip: !patientId || !showDoctorPanel },
  );
  const { data: labReports = [], isFetching: isFetchingLabReports } = useListLabReportsQuery(
    { patientId },
    { skip: !patientId || !showDoctorPanel },
  );

  const [reportViewerUrl, setReportViewerUrl] = useState<string | null>(null);
  // Report opens docked inline in the right-hand panel (50/50 next to the call) by
  // default; maximizing promotes it to a full-screen dialog. Reset on close so the
  // next report always starts docked rather than reopening maximized.
  const [reportMaximized, setReportMaximized] = useState(false);
  const closeReportViewer = () => {
    setReportViewerUrl(null);
    setReportMaximized(false);
  };
  const labReportColumns = useMemo(() => createLabReportColumns(setReportViewerUrl), []);

  const [rightTab, setRightTab] = useState<'vitals' | 'testResults' | 'prescription'>('vitals');
  const { setHeaderContent } = useHeaderContent();

  // Renders the patient name + tabs directly inside the top app bar — one row, no
  // separate header strip below it — instead of as its own header in the right panel.
  useEffect(() => {
    if (!showDoctorPanel) {
      setHeaderContent(null);
      return;
    }
    setHeaderContent(
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ flexGrow: 1, minWidth: 0, overflow: 'hidden' }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {doctorName ? (
            <>
              Dr. {doctorName} | <Box component="span" fontWeight={700}>P:</Box> {patientName}
            </>
          ) : (
            patientName
          )}
        </Typography>
        <Tabs
          value={rightTab}
          onChange={(_event, value) => setRightTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{ sx: { display: 'none' } }}
          sx={{
            minHeight: 0,
            flexShrink: 0,
            maxWidth: '100%',
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 999,
            p: 0.5,
            '& .MuiTabs-flexContainer': { gap: 0.5 },
            '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
            '& .MuiTab-root': {
              minHeight: 32,
              minWidth: 0,
              py: 0.5,
              px: 1.25,
              borderRadius: 999,
              textTransform: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'text.secondary',
              transition: 'background-color 0.15s ease, color 0.15s ease',
            },
            '& .MuiTab-root.Mui-selected': {
              bgcolor: 'background.paper',
              color: 'primary.main',
              boxShadow: '0 1px 2px rgba(15,23,42,0.12)',
            },
          }}
        >
          <Tab
            icon={<MonitorHeartOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? undefined : 'Vitals'}
            aria-label="Vitals"
            value="vitals"
          />
          <Tab
            icon={<ScienceOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? undefined : 'Test Results'}
            aria-label="Test Results"
            value="testResults"
          />
          <Tab
            icon={<MedicationOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label={isMobile ? undefined : 'Prescription'}
            aria-label="Prescription"
            value="prescription"
          />
        </Tabs>
      </Stack>,
    );
    return () => setHeaderContent(null);
  }, [showDoctorPanel, doctorName, patientName, rightTab, isMobile, setHeaderContent]);

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
  const [chatSetupError, setChatSetupError] = useState<string | null>(null);

  useEffect(() => {
    if (!otherUserId) return;
    let cancelled = false;
    setChatSetupError(null);
    startConversation({ otherUserId })
      .unwrap()
      .then((conversation) => {
        if (cancelled) return;
        if (!conversation?._id) {
          setChatSetupError('Chat is unavailable right now. Please rejoin the call.');
          return;
        }
        setConversationId(conversation._id);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to start chat conversation', err);
        setChatSetupError('Chat is unavailable right now. Please rejoin the call.');
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

  // Holds the recording hook's stopRecording so the call-ended effect below
  // can still trigger a stop when the peer disconnects.
  const stopRecordingRef = useRef<(() => void) | null>(null);

  // The live WebRTC connection lives in CallProvider (mounted at the app root), not
  // in this page — that's what lets "minimize" navigate elsewhere in the app without
  // tearing down the call. This page just starts/attaches to it and renders its state.
  const {
    activeCall,
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    error: webrtcError,
    callEnded: contextCallEnded,
    startCall,
    minimize,
    leaveCall,
    toggleAudio,
    toggleVideo,
  } = useCallContext();

  const isActiveCall = activeCall?.appointmentId === appointmentId;

  // Starts the call the first time this page is opened for this appointment. Guarded
  // by a ref (not just `isActiveCall`) scoped to this mount: ending the call sets
  // activeCall to null, which flips isActiveCall to false while this page is still
  // mounted (handleEndCall navigates away 2s later) — without the ref, that flip would
  // satisfy this effect's guard again and re-invoke startCall, silently restarting the
  // call (and the camera) right after the user ended it.
  const hasJoinedRef = useRef(false);
  useEffect(() => {
    if (!appointmentId || !room?.roomId || hasJoinedRef.current) return;
    hasJoinedRef.current = true;
    startCall({ appointmentId, roomId: room.roomId });
  }, [appointmentId, room?.roomId, startCall]);

  useEffect(() => {
    if (!contextCallEnded) return;
    stopRecordingRef.current?.();
    setCallEnded(true);
    const timer = setTimeout(() => navigate(-1), 3000);
    return () => clearTimeout(timer);
  }, [contextCallEnded, navigate]);

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

  const [uploadRecording] = useUploadRecordingMutation();
  const [recordingSaved, setRecordingSaved] = useState(false);
  const [recordingSaveError, setRecordingSaveError] = useState<string | null>(null);

  const handleRecordingComplete = useCallback(
    (blob: Blob) => {
      if (!appointmentId) return;
      uploadRecording({ appointmentId, file: blob })
        .unwrap()
        .then(() => setRecordingSaved(true))
        .catch((err: unknown) => {
          const data = (err as { data?: { message?: string } } | undefined)?.data;
          setRecordingSaveError(data?.message ? `Failed to save the recording: ${data.message}` : 'Failed to save the recording.');
        });
    },
    [appointmentId, uploadRecording],
  );

  const {
    isRecording,
    canRecord: canStartRecording,
    error: recordingError,
    startRecording,
    stopRecording,
  } = useCallRecording(localStream, remoteStream, handleRecordingComplete);

  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  const { data: recordings = [] } = useListRecordingsQuery(appointmentId!, {
    skip: !appointmentId || !canRecord,
  });

  const [deleteTarget, setDeleteTarget] = useState<Recording | null>(null);
  const [deleteRecording, { isLoading: isDeletingRecording }] = useDeleteRecordingMutation();
  const [recordingDeleted, setRecordingDeleted] = useState(false);
  const [recordingDeleteError, setRecordingDeleteError] = useState<string | null>(null);

  const handleDeleteRecording = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRecording(deleteTarget._id).unwrap();
      setDeleteTarget(null);
      setRecordingDeleted(true);
    } catch (err) {
      const data = (err as { data?: { message?: string } } | undefined)?.data;
      setRecordingDeleteError(
        data?.message ? `Failed to delete the recording: ${data.message}` : 'Failed to delete the recording.',
      );
      setDeleteTarget(null);
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleToggleRecordingsPanel = () => {
    setRecordingsPanelOpen((open) => !open);
    setChatOpen(false);
  };

  const handleEndCall = () => {
    if (isRecording) stopRecording();
    leaveCall();
    setCallEnded(true);
    setTimeout(() => navigate(-1), 2000);
  };

  // Recording state (MediaRecorder + chunks) lives in this page's own hook, not in
  // CallProvider, so it wouldn't survive unmounting on minimize — block minimizing
  // while a recording is in progress rather than silently losing it.
  const handleMinimize = () => {
    if (isRecording) return;
    minimize();
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

  if (isLoading && !isActiveCall) {
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
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ height: 'calc(100vh - 130px)' }}>
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

        {/* Connection status */}
        <Chip
          label={connectionState === 'connected' ? 'Connected' : connectionState}
          color={connectionState === 'connected' ? 'success' : 'default'}
          size="small"
          sx={{ position: 'absolute', top: 16, left: 16 }}
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

        {/* Chat panel — draggable on desktop; docked full-width on mobile where dragging doesn't make sense */}
        {chatOpen &&
          (() => {
            const chatBody = (
              <>
                {chatSetupError && (
                  <Alert severity="warning" sx={{ borderRadius: 0 }}>
                    {chatSetupError}
                  </Alert>
                )}

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
                    placeholder={conversationId ? 'Type a message' : 'Connecting to chat…'}
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
              </>
            );

            if (isMobile) {
              return (
                <Paper
                  elevation={6}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: CONTROL_BAR_HEIGHT,
                    width: '100%',
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
                      Chat
                    </Typography>
                    <IconButton size="small" onClick={() => setChatOpen(false)} aria-label="Close chat">
                      <CloseRoundedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                  {chatBody}
                </Paper>
              );
            }

            return (
              <DraggablePanel title="Chat" onClose={() => setChatOpen(false)} width={380} height={460}>
                {chatBody}
              </DraggablePanel>
            );
          })()}

        {/* Recordings panel */}
        {recordingsPanelOpen && (
          <Paper
            elevation={6}
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: CONTROL_BAR_HEIGHT,
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
                Recordings — {patientName}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setRecordingsPanelOpen(false)}
                aria-label="Close recordings"
              >
                <CloseRoundedIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
              <Stack spacing={1}>
                {recordings.length === 0 && (
                  <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                    No recordings saved yet for this appointment.
                  </Typography>
                )}
                {recordings.map((recording) => (
                  <Paper key={recording._id} variant="outlined" sx={{ p: 1.5 }}>
                    <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                      <Typography variant="body2" fontWeight={600}>
                        {patientName}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(recording)}
                        aria-label="Delete recording"
                        sx={{ mt: -0.5, mr: -0.5 }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      {format(new Date(recording.createdAt), 'MMM d, yyyy p')}
                      {recording.durationSeconds ? ` · ${formatDuration(recording.durationSeconds)}` : ''}
                    </Typography>
                    <a href={recording.fileUrl} target="_blank" rel="noreferrer">
                      Play recording
                    </a>
                  </Paper>
                ))}
              </Stack>
            </Box>
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
              onClick={() => {
                setChatOpen((open) => !open);
                setRecordingsPanelOpen(false);
              }}
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

            {canRecord && (
              <Tooltip
                title={
                  isRecording
                    ? 'Stop recording and save'
                    : canStartRecording
                      ? 'Record this call'
                      : 'Waiting for the other participant to join before you can record'
                }
              >
                <span>
                  <IconButton
                    onClick={handleToggleRecording}
                    disabled={!isRecording && !canStartRecording}
                    sx={{
                      bgcolor: isRecording ? 'error.main' : 'background.paper',
                      color: isRecording ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: isRecording ? 'error.dark' : 'background.paper',
                      },
                    }}
                    size="large"
                  >
                    {isRecording ? <StopRoundedIcon /> : <FiberManualRecordIcon />}
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {canRecord && (
              <IconButton
                onClick={handleToggleRecordingsPanel}
                sx={{
                  bgcolor: recordingsPanelOpen ? 'primary.main' : 'background.paper',
                  color: recordingsPanelOpen ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: recordingsPanelOpen ? 'primary.dark' : 'background.paper',
                  },
                }}
                size="large"
                aria-label="Recordings"
              >
                <Badge color="secondary" badgeContent={recordings.length} max={9}>
                  <VideoLibraryRoundedIcon />
                </Badge>
              </IconButton>
            )}

            <IconButton
              onClick={toggleFullscreen}
              sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
              size="large"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
            </IconButton>

            <Tooltip title={isRecording ? 'Stop recording before minimizing' : 'Minimize call'}>
              <span>
                <IconButton
                  onClick={handleMinimize}
                  disabled={isRecording}
                  sx={{ bgcolor: 'background.paper', color: 'text.primary' }}
                  size="large"
                  aria-label="Minimize call"
                >
                  <MinimizeRoundedIcon />
                </IconButton>
              </span>
            </Tooltip>

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
        <Paper
          sx={{ flex: '0 0 50%', minWidth: 0, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 3 }}>
            {rightTab === 'vitals' && <VitalsHistoryPanel vitals={vitals} loading={isFetchingVitals} />}

            {rightTab === 'testResults' && (
              <Stack spacing={2}>
                <DataTable
                  columns={labReportColumns}
                  rows={labReports}
                  getRowId={(row) => row._id}
                  loading={isFetchingLabReports}
                  emptyTitle="No lab tests on record"
                  emptyDescription="No lab tests have been requested for this patient yet."
                />
              </Stack>
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

          {/* Docked report view — fills this same 50% panel instead of overlaying the
              video call or the app header. Maximize promotes it to the fullscreen Dialog below. */}
          {reportViewerUrl && !reportMaximized && (
            <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'background.paper', zIndex: 2 }}>
              <ReportViewerPanel
                url={reportViewerUrl}
                title="Lab Report"
                onClose={closeReportViewer}
                extraActions={
                  <Tooltip title="Maximize">
                    <IconButton size="small" onClick={() => setReportMaximized(true)} aria-label="Maximize">
                      <OpenInFullRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              />
            </Box>
          )}
        </Paper>
      )}
      </Stack>

      {reportViewerUrl && reportMaximized && (
        <Dialog
          open
          onClose={closeReportViewer}
          maxWidth={false}
          fullWidth
          PaperProps={{ sx: { m: 0, width: '100vw', height: '100vh', maxWidth: '100vw', borderRadius: 0 } }}
        >
          <ReportViewerPanel
            url={reportViewerUrl}
            title="Lab Report"
            onClose={closeReportViewer}
            extraActions={
              <Tooltip title="Restore">
                <IconButton size="small" onClick={() => setReportMaximized(false)} aria-label="Restore">
                  <CloseFullscreenRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            }
          />
        </Dialog>
      )}

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete recording?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete this recording. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteRecording} disabled={isDeletingRecording}>
            {isDeletingRecording ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={prescriptionSaved} autoHideDuration={3000} onClose={() => setPrescriptionSaved(false)}>
        <Alert severity="success" onClose={() => setPrescriptionSaved(false)}>
          Prescription saved
        </Alert>
      </Snackbar>

      <Snackbar open={recordingSaved} autoHideDuration={3000} onClose={() => setRecordingSaved(false)}>
        <Alert severity="success" onClose={() => setRecordingSaved(false)}>
          Recording saved
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(recordingSaveError || recordingError)}
        autoHideDuration={4000}
        onClose={() => setRecordingSaveError(null)}
      >
        <Alert severity="error" onClose={() => setRecordingSaveError(null)}>
          {recordingSaveError ?? recordingError}
        </Alert>
      </Snackbar>

      <Snackbar open={recordingDeleted} autoHideDuration={3000} onClose={() => setRecordingDeleted(false)}>
        <Alert severity="success" onClose={() => setRecordingDeleted(false)}>
          Recording deleted
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(recordingDeleteError)}
        autoHideDuration={4000}
        onClose={() => setRecordingDeleteError(null)}
      >
        <Alert severity="error" onClose={() => setRecordingDeleteError(null)}>
          {recordingDeleteError}
        </Alert>
      </Snackbar>
    </>
  );
}

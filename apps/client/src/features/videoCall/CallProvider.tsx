import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useAppSelector } from '../../app/hooks';
import { CallContext, type CallContextValue, type ActiveCall } from './callContext';

function roleVideoPath(role: string | undefined, appointmentId: string): string {
  const base = role === 'health_officer' ? 'health-officer' : 'doctor';
  return `/app/${base}/video/${appointmentId}`;
}

/**
 * Owns the live WebRTC call (mounted once at the app root, above the router's
 * <Outlet/>), so navigating between in-app pages while "minimized" doesn't tear
 * down the peer connection the way unmounting VideoConsultationPage would.
 */
export function CallProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const currentUserRole = useAppSelector((state) => state.auth.user?.role);

  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callEnded, setCallEnded] = useState(false);

  const handleCallEnded = useCallback(() => {
    setCallEnded(true);
    setActiveCall(null);
    setIsMinimized(false);
  }, []);

  const {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    error,
    toggleAudio,
    toggleVideo,
    endCall,
  } = useWebRTC({
    roomId: activeCall?.roomId ?? '',
    accessToken,
    onCallEnded: handleCallEnded,
  });

  const startCall = useCallback((call: ActiveCall) => {
    setCallEnded(false);
    setActiveCall(call);
    setIsMinimized(false);
  }, []);

  const minimize = useCallback(() => {
    if (!activeCall) return;
    setIsMinimized(true);
    navigate(-1);
  }, [activeCall, navigate]);

  const maximize = useCallback(() => {
    if (!activeCall) return;
    setIsMinimized(false);
    navigate(roleVideoPath(currentUserRole, activeCall.appointmentId));
  }, [activeCall, currentUserRole, navigate]);

  const leaveCall = useCallback(() => {
    endCall();
    setActiveCall(null);
    setIsMinimized(false);
  }, [endCall]);

  const value = useMemo<CallContextValue>(
    () => ({
      activeCall,
      isMinimized,
      callEnded,
      localStream,
      remoteStream,
      isAudioEnabled,
      isVideoEnabled,
      connectionState,
      error,
      startCall,
      minimize,
      maximize,
      leaveCall,
      toggleAudio,
      toggleVideo,
    }),
    [
      activeCall,
      isMinimized,
      callEnded,
      localStream,
      remoteStream,
      isAudioEnabled,
      isVideoEnabled,
      connectionState,
      error,
      startCall,
      minimize,
      maximize,
      leaveCall,
      toggleAudio,
      toggleVideo,
    ],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

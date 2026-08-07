import { createContext } from 'react';

export interface ActiveCall {
  appointmentId: string;
  roomId: string;
}

export interface CallContextValue {
  activeCall: ActiveCall | null;
  isMinimized: boolean;
  callEnded: boolean;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  connectionState: RTCPeerConnectionState;
  error: string | null;
  startCall: (call: ActiveCall) => void;
  minimize: () => void;
  maximize: () => void;
  leaveCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
}

export const CallContext = createContext<CallContextValue | null>(null);

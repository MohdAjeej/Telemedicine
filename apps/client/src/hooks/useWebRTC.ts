import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@telemedicine/constants';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

// TURN server credentials from environment variables
const TURN_USERNAME = import.meta.env.VITE_TURN_USERNAME || '';
const TURN_PASSWORD = import.meta.env.VITE_TURN_PASSWORD || '';

// ICE server configuration (STUN + TURN with multiple transports)
const getIceServers = (): RTCIceServer[] => {
  const servers: RTCIceServer[] = [
    // Google's public STUN servers for NAT traversal
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  // Add Metered.ca TURN servers if credentials are provided
  if (TURN_USERNAME && TURN_PASSWORD) {
    servers.push(
      // Metered.ca STUN server
      {
        urls: 'stun:stun.relay.metered.ca:80',
      },
      // TURN server - UDP on port 80
      {
        urls: 'turn:global.relay.metered.ca:80',
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      },
      // TURN server - TCP on port 80 (for restrictive networks)
      {
        urls: 'turn:global.relay.metered.ca:80?transport=tcp',
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      },
      // TURN server - UDP/TCP on port 443 (bypasses most firewalls)
      {
        urls: 'turn:global.relay.metered.ca:443',
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      },
      // TURN server - TLS on port 443 (most secure, bypasses all firewalls)
      {
        urls: 'turns:global.relay.metered.ca:443?transport=tcp',
        username: TURN_USERNAME,
        credential: TURN_PASSWORD,
      }
    );
  }

  return servers;
};

interface UseWebRTCProps {
  roomId: string;
  accessToken: string | null;
  onRemoteStream?: (stream: MediaStream) => void;
  onCallEnded?: () => void;
}

export function useWebRTC({ roomId, accessToken, onRemoteStream, onCallEnded }: UseWebRTCProps) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>('new');
  const [error, setError] = useState<string | null>(null);

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const isInitiatorRef = useRef(false);

  // Keep the latest callbacks in refs so the connection-setup effect below doesn't
  // need them as dependencies — callers pass inline functions that change identity
  // on every render, which would otherwise tear down and re-acquire the camera/mic
  // (and rejoin the room) on every re-render instead of only when roomId/accessToken change.
  const onRemoteStreamRef = useRef(onRemoteStream);
  const onCallEndedRef = useRef(onCallEnded);
  useEffect(() => {
    onRemoteStreamRef.current = onRemoteStream;
    onCallEndedRef.current = onCallEnded;
  });

  useEffect(() => {
    if (!roomId || !accessToken) return;

    let isMounted = true;

    const initializeMedia = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            window.isSecureContext
              ? 'Camera/microphone access is not supported in this browser.'
              : 'For video calls, please open this app with HTTPS. Try: https://' + window.location.hostname + ':' + window.location.port,
          );
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        setLocalStream(stream);

        // Initialize Socket.io
        const socket = io(SOCKET_URL, {
          auth: { token: accessToken },
          transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        // Initialize RTCPeerConnection with TURN server support
        const peerConnection = new RTCPeerConnection({
          iceServers: getIceServers(),
        });

        peerConnectionRef.current = peerConnection;

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        // Handle remote stream
        peerConnection.ontrack = (event) => {
          const [remoteMediaStream] = event.streams;
          if (isMounted) {
            setRemoteStream(remoteMediaStream);
            onRemoteStreamRef.current?.(remoteMediaStream);
          }
        };

        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        // Monitor connection state
        peerConnection.onconnectionstatechange = () => {
          setConnectionState(peerConnection.connectionState);
          if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
            onCallEndedRef.current?.();
          }
        };

        // Socket event handlers
        socket.on(SOCKET_EVENTS.VIDEO_JOIN, async ({ userId }: { userId: string }) => {
          // eslint-disable-next-line no-console
          console.log('Participant joined:', userId);
          
          // First to join becomes the initiator (creates offer)
          if (!isInitiatorRef.current) {
            isInitiatorRef.current = true;
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit(SOCKET_EVENTS.VIDEO_OFFER, { roomId, offer });
          }
        });

        socket.on(SOCKET_EVENTS.VIDEO_OFFER, async ({ offer }: { offer: RTCSessionDescriptionInit }) => {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit(SOCKET_EVENTS.VIDEO_ANSWER, { roomId, answer });
        });

        socket.on(SOCKET_EVENTS.VIDEO_ANSWER, async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        });

        socket.on(SOCKET_EVENTS.VIDEO_LEAVE, () => {
          onCallEndedRef.current?.();
        });

        // Join the video room
        socket.emit(SOCKET_EVENTS.VIDEO_JOIN, { roomId });

      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to access media devices');
          console.error('WebRTC initialization error:', err);
        }
      }
    };

    initializeMedia();

    return () => {
      isMounted = false;

      // Clean up media tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }

      // Clean up peer connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }

      // Clean up socket
      if (socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.VIDEO_LEAVE, { roomId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, accessToken]);

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (socketRef.current && roomId) {
      socketRef.current.emit(SOCKET_EVENTS.VIDEO_LEAVE, { roomId });
    }
    
    localStream?.getTracks().forEach((track) => track.stop());
    remoteStream?.getTracks().forEach((track) => track.stop());
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    onCallEnded?.();
  };

  return {
    localStream,
    remoteStream,
    isAudioEnabled,
    isVideoEnabled,
    connectionState,
    error,
    toggleAudio,
    toggleVideo,
    endCall,
  };
}

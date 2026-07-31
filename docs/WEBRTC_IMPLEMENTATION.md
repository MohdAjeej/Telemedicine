# WebRTC Video Consultation Implementation Guide

## Overview

This document explains how the WebRTC video consultation feature is implemented in the Telemedicine Management System. The implementation provides real-time peer-to-peer video/audio communication between doctors and patients.

## Architecture

### High-Level Flow

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│ Doctor  │                 │ Socket  │                 │ Patient │
│ Browser │                 │ Server  │                 │ Browser │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │ 1. Join Room              │                           │
     ├──────────────────────────>│                           │
     │                           │                           │
     │                           │ 2. Join Room              │
     │                           │<──────────────────────────┤
     │                           │                           │
     │ 3. Emit Offer             │                           │
     ├──────────────────────────>│                           │
     │                           │ 4. Forward Offer          │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │ 5. Emit Answer            │
     │                           │<──────────────────────────┤
     │ 6. Forward Answer         │                           │
     │<──────────────────────────┤                           │
     │                           │                           │
     │ 7. Exchange ICE Candidates                            │
     │<─────────────────────────────────────────────────────>│
     │                           │                           │
     │ 8. Direct P2P Connection  │                           │
     │<═════════════════════════════════════════════════════>│
```

## Components

### 1. Backend: WebRTC Signaling Server

**File:** `apps/server/src/modules/video/video.socket.ts`

```typescript
import { SOCKET_EVENTS } from '@telemedicine/constants';
import { registerSocketHandler } from '../../sockets/registerHandlers';
import { logger } from '../../utils/logger';

function roomChannel(roomId: string): string {
  return `video:${roomId}`;
}

/**
 * Pure WebRTC signaling relay: joins/leaves a per-appointment room and
 * forwards offer/answer/ICE payloads between the two participants.
 * No media ever passes through the server.
 */
registerSocketHandler((_io, socket) => {
  socket.on(SOCKET_EVENTS.VIDEO_JOIN, ({ roomId }: { roomId: string }) => {
    socket.join(roomChannel(roomId));
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_JOIN, { 
      userId: socket.data.user?.id 
    });
    logger.info(`Socket ${socket.id} joined video room ${roomId}`);
  });

  socket.on(SOCKET_EVENTS.VIDEO_LEAVE, ({ roomId }: { roomId: string }) => {
    socket.leave(roomChannel(roomId));
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_LEAVE, { 
      userId: socket.data.user?.id 
    });
  });

  socket.on(SOCKET_EVENTS.VIDEO_OFFER, ({ roomId, offer }) => {
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_OFFER, { 
      offer, 
      from: socket.data.user?.id 
    });
  });

  socket.on(SOCKET_EVENTS.VIDEO_ANSWER, ({ roomId, answer }) => {
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_ANSWER, { 
      answer, 
      from: socket.data.user?.id 
    });
  });

  socket.on(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, ({ roomId, candidate }) => {
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, { 
      candidate, 
      from: socket.data.user?.id 
    });
  });
});
```

**Key Points:**
- Socket.io server acts as a **signaling server only**
- No media data passes through the server
- Rooms are created per appointment (format: `video:${appointmentId}`)
- Simple relay pattern: receive from one peer, forward to others in the room

### 2. Frontend: Video API Layer

**File:** `apps/client/src/features/video/videoApi.ts`

```typescript
import { baseApi } from '../../store/api/baseApi';

export interface VideoRoom {
  roomId: string;
  appointmentId: string;
  participants: string[];
}

export const videoApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVideoRoom: builder.query<VideoRoom, string>({
      query: (appointmentId) => `/video/${appointmentId}/room`,
      transformResponse: (response: { data: VideoRoom }) => response.data,
    }),
  }),
});

export const { useGetVideoRoomQuery } = videoApi;
```

**Key Points:**
- Fetches video room information from backend
- Room ID is derived from appointment ID
- Used to validate appointment before joining call

### 3. Frontend: WebRTC Hook (Core Logic)

**File:** `apps/client/src/hooks/useWebRTC.ts`

This is the heart of the WebRTC implementation. Let's break it down step by step.

#### Step 1: Hook Interface and State

```typescript
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
}
```

**State Variables:**
- `localStream`: User's own camera/microphone stream
- `remoteStream`: Peer's camera/microphone stream
- `isAudioEnabled/isVideoEnabled`: Track control states
- `connectionState`: WebRTC connection status
- `peerConnectionRef`: Reference to RTCPeerConnection object
- `socketRef`: Reference to Socket.io connection
- `isInitiatorRef`: First person to join becomes the initiator (creates offer)

#### Step 2: Initialize Media Devices

```typescript
const initializeMedia = async () => {
  try {
    // Request camera and microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true,
    });

    if (!isMounted) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    setLocalStream(stream);
    
    // Continue with Socket.io and RTCPeerConnection setup...
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to access media devices');
  }
};
```

**Key Points:**
- Uses `getUserMedia` API to access camera/microphone
- Requests 720p video quality
- Handles permission denials gracefully
- Cleans up if component unmounts during async operation

#### Step 3: Initialize Socket.io Connection

```typescript
// Initialize Socket.io
const socket = io(SOCKET_URL, {
  auth: { token: accessToken },
  transports: ['websocket', 'polling'],
});

socketRef.current = socket;
```

**Key Points:**
- Authenticates with JWT token
- Uses both WebSocket and polling transports for reliability
- Stores reference for cleanup

#### Step 4: Create RTCPeerConnection

```typescript
// Initialize RTCPeerConnection
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
});

peerConnectionRef.current = peerConnection;

// Add local tracks to peer connection
stream.getTracks().forEach((track) => {
  peerConnection.addTrack(track, stream);
});
```

**Key Points:**
- Uses Google's public STUN servers for NAT traversal
- STUN servers help peers discover their public IP addresses
- Local media tracks are added to the connection

#### Step 5: Handle Remote Stream

```typescript
// Handle remote stream
peerConnection.ontrack = (event) => {
  const [remoteMediaStream] = event.streams;
  if (isMounted) {
    setRemoteStream(remoteMediaStream);
    onRemoteStream?.(remoteMediaStream);
  }
};
```

**Key Points:**
- `ontrack` event fires when remote peer adds their media tracks
- Extract the MediaStream and store it in state
- Optional callback for additional handling

#### Step 6: Handle ICE Candidates

```typescript
// Handle ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, {
      roomId,
      candidate: event.candidate,
    });
  }
};
```

**Key Points:**
- ICE (Interactive Connectivity Establishment) candidates are network paths
- When discovered locally, send to remote peer via signaling
- Includes information about IP addresses and ports

#### Step 7: Monitor Connection State

```typescript
// Monitor connection state
peerConnection.onconnectionstatechange = () => {
  setConnectionState(peerConnection.connectionState);
  if (peerConnection.connectionState === 'failed' || 
      peerConnection.connectionState === 'disconnected') {
    onCallEnded?.();
  }
};
```

**Key Points:**
- Track connection lifecycle: new → connecting → connected → disconnected/failed
- Automatically handle disconnections
- Notify parent component when call ends

#### Step 8: Socket Event Handlers

**A. Handle Peer Joining**

```typescript
socket.on(SOCKET_EVENTS.VIDEO_JOIN, async ({ userId }: { userId: string }) => {
  console.log('Participant joined:', userId);
  
  // First to join becomes the initiator (creates offer)
  if (!isInitiatorRef.current) {
    isInitiatorRef.current = true;
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit(SOCKET_EVENTS.VIDEO_OFFER, { roomId, offer });
  }
});
```

**Key Points:**
- First person in the room creates the offer
- SDP (Session Description Protocol) offer describes the media capabilities
- Set as local description before sending

**B. Handle Offer (Answerer Side)**

```typescript
socket.on(SOCKET_EVENTS.VIDEO_OFFER, async ({ offer }) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);
  socket.emit(SOCKET_EVENTS.VIDEO_ANSWER, { roomId, answer });
});
```

**Key Points:**
- Receive offer from initiator
- Set as remote description
- Create and send answer back

**C. Handle Answer (Initiator Side)**

```typescript
socket.on(SOCKET_EVENTS.VIDEO_ANSWER, async ({ answer }) => {
  await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});
```

**Key Points:**
- Initiator receives answer from peer
- Set as remote description
- Connection is now established

**D. Handle ICE Candidates**

```typescript
socket.on(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, async ({ candidate }) => {
  await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});
```

**Key Points:**
- Both peers exchange ICE candidates
- Add received candidates to the peer connection
- Helps establish the best network path

#### Step 9: Join the Video Room

```typescript
// Join the video room
socket.emit(SOCKET_EVENTS.VIDEO_JOIN, { roomId });
```

**Key Points:**
- Announce presence to the room
- Triggers the offer/answer exchange if peer is already present

#### Step 10: Cleanup on Unmount

```typescript
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
```

**Key Points:**
- Stop all media tracks to turn off camera/microphone
- Close peer connection to free resources
- Notify peers of departure
- Disconnect socket

#### Step 11: Control Functions

```typescript
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
```

**Key Points:**
- `toggleAudio/toggleVideo`: Enable/disable tracks without recreating them
- `endCall`: Gracefully terminate the call and clean up resources
- Return all necessary state and controls to the UI component

### 4. Frontend: Video UI Component

**File:** `apps/client/src/pages/shared/VideoConsultationPage.tsx`

#### Component Structure

```typescript
export default function VideoConsultationPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callEnded, setCallEnded] = useState(false);

  // Fetch video room information
  const { data: room, isLoading, error: roomError } = useGetVideoRoomQuery(
    appointmentId!, 
    { skip: !appointmentId }
  );

  // Initialize WebRTC
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
}
```

#### Attach Streams to Video Elements

```typescript
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
```

**Key Points:**
- Use refs to access DOM video elements
- Assign MediaStream to `srcObject` property
- Separate effects for local and remote streams

#### Video UI Layout

```tsx
<Box sx={{ position: 'relative', height: 'calc(100vh - 200px)', bgcolor: 'black' }}>
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
        transform: 'scaleX(-1)', // Mirror effect for local video
      }}
    />
  </Paper>

  {/* Controls */}
  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
    <Stack direction="row" spacing={2} justifyContent="center">
      <IconButton onClick={toggleAudio}>
        {isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
      </IconButton>
      
      <IconButton onClick={toggleVideo}>
        {isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
      </IconButton>
      
      <IconButton onClick={handleEndCall}>
        <CallEndIcon />
      </IconButton>
    </Stack>
  </Box>
</Box>
```

**Key Points:**
- Remote video takes full screen (main focus)
- Local video as small overlay (picture-in-picture)
- Mirror local video for natural user experience
- Controls overlay at the bottom
- `autoPlay` and `playsInline` required for automatic playback

## Complete Implementation Flow

### Flow Diagram: Establishing Connection

```
Doctor Side                                     Patient Side
───────────                                     ────────────

1. Load page
2. Request camera/mic ─────────────────────────> 1. Load page
3. Get permission                                2. Request camera/mic
4. Create RTCPeerConnection                      3. Get permission
5. Connect to Socket.io                          4. Create RTCPeerConnection
6. Join room (VIDEO_JOIN) ────────────────────> 5. Connect to Socket.io
                                                 6. Join room (VIDEO_JOIN)
7. Receive VIDEO_JOIN event                      
8. Become initiator                              
9. Create offer (SDP)                            
10. Set local description                        
11. Send offer (VIDEO_OFFER) ──────────────────> 7. Receive VIDEO_OFFER
                                                 8. Set remote description
                                                 9. Create answer (SDP)
                                                 10. Set local description
12. Receive VIDEO_ANSWER <──────────────────── 11. Send answer (VIDEO_ANSWER)
13. Set remote description                       

14. Generate ICE candidates ←───────────────────> 12. Generate ICE candidates
15. Exchange ICE candidates (VIDEO_ICE_CANDIDATE)
16. Establish P2P connection ←═════════════════> 13. Establish P2P connection

17. Media flows directly (peer-to-peer) ←═══════> 14. Media flows directly
```

## Key Concepts Explained

### 1. STUN Server

**Purpose:** Help peers discover their public IP addresses

```typescript
iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
]
```

- Most devices are behind NAT (Network Address Translation)
- STUN server tells you your public-facing IP address
- Required for peers to find each other across the internet

### 2. ICE (Interactive Connectivity Establishment)

**Purpose:** Find the best path to connect two peers

**Process:**
1. Gather all possible network paths (candidates)
2. Test each path
3. Select the best one

**Types of Candidates:**
- **host:** Direct connection (same network)
- **srflx:** Connection through STUN (Server Reflexive)
- **relay:** Connection through TURN server (last resort)

### 3. SDP (Session Description Protocol)

**Purpose:** Describe media capabilities

**Offer SDP includes:**
- Supported codecs (VP8, H.264, Opus, etc.)
- Media types (audio, video)
- Network information

**Answer SDP includes:**
- Selected codecs
- Accepted media types
- Answerer's network information

### 4. Signaling vs Media

**Signaling (via Socket.io):**
- Exchange offer/answer
- Exchange ICE candidates
- Room management
- Goes through the server

**Media (via WebRTC):**
- Audio/video streams
- Peer-to-peer (direct)
- Does NOT go through the server
- More efficient and private

## Testing Locally

### Setup for Local Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open two browser tabs:**
   - Tab 1: Login as doctor
   - Tab 2: Login as patient (use incognito mode)

3. **Create and confirm a video appointment** (as admin/health officer)

4. **Join from both sides:**
   - Doctor: Click "Join Video" from dashboard
   - Patient: Click "Join Video" from dashboard

5. **Grant permissions when prompted**

### Testing From a Second Device (Phone) on the LAN

Browsers only expose `navigator.mediaDevices.getUserMedia` in **secure
contexts** (HTTPS, or `http://localhost`) — a plain-HTTP LAN address like
`http://192.168.x.x:5173` doesn't qualify, so `getUserMedia` will be
`undefined`. To test with a second physical device on the same network:

1. `apps/client/vite.config.ts` runs the dev server over HTTPS
   (`@vitejs/plugin-basic-ssl`) with `server.host: true`, so `npm run dev`
   is reachable at `https://<your-LAN-IP>:5173` from any device on the same
   Wi-Fi/network.
2. Find your machine's LAN IP (`ipconfig` on Windows) and open
   `https://<LAN-IP>:5173` on the phone.
3. The browser will show a "connection not private" warning — this is
   expected (the cert is self-signed). Tap **Advanced → Proceed** — a
   one-time step per device.
4. Log in and open the video consultation page as normal; the camera/mic
   permission prompt should now appear.

`apps/admin` is unaffected — it doesn't use WebRTC.

### Debugging Tips

**Check Socket.io Connection:**
```javascript
// In browser console
socketRef.current?.connected // Should be true
```

**Check Peer Connection State:**
```javascript
// In browser console
peerConnectionRef.current?.connectionState // Should progress to "connected"
```

**Check ICE Connection State:**
```javascript
peerConnectionRef.current?.iceConnectionState
// Should progress: new → checking → connected
```

**Check Media Tracks:**
```javascript
localStream?.getTracks() // Should show audio and video tracks
remoteStream?.getTracks() // Should show peer's tracks
```

## Common Issues & Solutions

### Issue 1: "Camera not found" or "Permission denied"

**Cause:** Browser doesn't have camera/microphone access

**Solution:**
```
Chrome: Settings → Privacy and Security → Site Settings → Camera/Microphone
Firefox: Preferences → Privacy & Security → Permissions → Camera/Microphone
Safari: Preferences → Websites → Camera/Microphone
```

### Issue 2: Connection stays in "connecting" state

**Cause:** Firewall blocking WebRTC ports or STUN server unreachable

**Solutions:**
- Check if STUN server is accessible: `ping stun.l.google.com`
- Try different STUN servers
- Consider using a TURN server for restrictive networks

### Issue 3: No remote video/audio

**Causes:**
- Peer hasn't joined yet
- Peer denied camera/microphone access
- Network connectivity issues

**Debug Steps:**
1. Check if both peers joined the room
2. Verify both peers have media devices enabled
3. Check browser console for errors
4. Verify `remoteStream` has tracks

### Issue 4: Echo or feedback

**Cause:** Local audio being played back

**Solution:** Always mute the local video element:
```tsx
<video ref={localVideoRef} autoPlay muted />
```

### Issue 5: `Cannot read properties of undefined (reading 'getUserMedia')` on phone/LAN

**Cause:** `navigator.mediaDevices` doesn't exist outside a secure context.
Opening the app via a plain-HTTP LAN address (e.g. `http://192.168.x.x:5173`)
is not a secure context, so `navigator.mediaDevices` is `undefined`.

**Solution:** See [Testing From a Second Device (Phone) on the LAN](#testing-from-a-second-device-phone-on-the-lan) —
use the HTTPS LAN URL (`https://<LAN-IP>:5173`) instead of HTTP.

## Performance Optimization

### 1. Adaptive Video Quality

```typescript
// Adjust based on network conditions
const constraints = {
  video: {
    width: { ideal: 1280, max: 1920 },
    height: { ideal: 720, max: 1080 },
    frameRate: { ideal: 30, max: 60 },
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
  },
};
```

### 2. Monitor Connection Quality

```typescript
peerConnection.addEventListener('icecandidateerror', (event) => {
  console.error('ICE candidate error:', event);
});

// Periodically check stats
setInterval(async () => {
  const stats = await peerConnection.getStats();
  stats.forEach((report) => {
    if (report.type === 'inbound-rtp' && report.mediaType === 'video') {
      console.log('Video quality:', {
        packetsLost: report.packetsLost,
        jitter: report.jitter,
        framesDecoded: report.framesDecoded,
      });
    }
  });
}, 5000);
```

### 3. Bandwidth Management

```typescript
// Limit bandwidth if needed
const sender = peerConnection.getSenders().find(s => s.track?.kind === 'video');
const parameters = sender.getParameters();
parameters.encodings[0].maxBitrate = 500000; // 500 kbps
await sender.setParameters(parameters);
```

## Security Considerations

### 1. Authentication

- Socket.io connection requires valid JWT token
- Token verified on server before joining room
- Room ID tied to appointment ID (authorization check)

### 2. Privacy

- Media streams are peer-to-peer (end-to-end)
- Server never sees or stores media content
- Encryption provided by WebRTC (DTLS-SRTP)

### 3. Access Control

- Only participants of the appointment can join the video room
- Backend validates appointment ownership before providing room ID

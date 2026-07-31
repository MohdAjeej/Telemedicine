import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Button, Stack, Typography, Alert } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';

export default function SimpleVideoTestPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Initializing...');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize media on mount
  useEffect(() => {
    const initMedia = async () => {
      try {
        setStatus('Requesting camera and microphone access...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        });

        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        setStatus('Camera and microphone ready!');
        setError(null);
      } catch (err) {
        console.error('Media error:', err);
        setError(`Failed to access camera/microphone: ${(err as Error).message}`);
        setStatus('Error');
      }
    };

    initMedia();

    return () => {
      // Cleanup
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    window.history.back();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Video Call Test - Appointment: {appointmentId}
      </Typography>

      <Typography variant="body1" color="text.secondary" gutterBottom>
        Status: {status}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          maxWidth: 800,
          height: 600,
          bgcolor: 'black',
          borderRadius: 2,
          overflow: 'hidden',
          mb: 2,
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
            <Typography variant="h6" color="white">
              Camera Off
            </Typography>
          </Box>
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="contained"
          onClick={toggleAudio}
          color={isAudioEnabled ? 'primary' : 'error'}
          startIcon={isAudioEnabled ? <MicIcon /> : <MicOffIcon />}
        >
          {isAudioEnabled ? 'Mute' : 'Unmute'}
        </Button>

        <Button
          variant="contained"
          onClick={toggleVideo}
          color={isVideoEnabled ? 'primary' : 'error'}
          startIcon={isVideoEnabled ? <VideocamIcon /> : <VideocamOffIcon />}
        >
          {isVideoEnabled ? 'Turn Off Video' : 'Turn On Video'}
        </Button>

        <Button variant="contained" color="error" onClick={endCall} startIcon={<CallEndIcon />}>
          End Call
        </Button>
      </Stack>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Instructions:
        </Typography>
        <Typography variant="body2" component="div">
          <ol>
            <li>Allow camera and microphone access when prompted</li>
            <li>You should see your face in the video</li>
            <li>Test the Mute/Unmute button</li>
            <li>Test the Turn Off/On Video button</li>
            <li>Click End Call to go back</li>
          </ol>
        </Typography>
      </Box>
    </Box>
  );
}

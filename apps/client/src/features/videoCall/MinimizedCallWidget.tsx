import { useEffect, useRef } from 'react';
import { Box, IconButton, Paper, Typography } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import { useCallContext } from './useCallContext';

export function MinimizedCallWidget() {
  const { activeCall, isMinimized, remoteStream, connectionState, maximize, leaveCall } = useCallContext();
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!activeCall || !isMinimized) return null;

  return (
    <Paper
      elevation={8}
      onClick={maximize}
      sx={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        width: 220,
        height: 160,
        zIndex: 1300,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: 'black',
      }}
    >
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)',
        }}
      >
        <Typography variant="caption" color="white">
          {connectionState === 'connected' ? 'Live' : connectionState}
        </Typography>
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            maximize();
          }}
          sx={{ color: 'white' }}
          aria-label="Maximize call"
        >
          <OpenInFullRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <IconButton
        size="small"
        onClick={(event) => {
          event.stopPropagation();
          leaveCall();
        }}
        sx={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          bgcolor: 'error.main',
          color: 'white',
          '&:hover': { bgcolor: 'error.dark' },
        }}
        aria-label="End call"
      >
        <CallEndIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}

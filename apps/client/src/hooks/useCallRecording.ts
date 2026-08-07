import { useCallback, useEffect, useRef, useState } from 'react';

const CANVAS_WIDTH = 1280;
const CANVAS_HEIGHT = 720;
const PIP_WIDTH = 320;
const PIP_HEIGHT = 240;
const PIP_MARGIN = 16;

const CANDIDATE_MIME_TYPES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp8,opus',
  'video/webm',
];

function pickMimeType(): string {
  return CANDIDATE_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) ?? 'video/webm';
}

/**
 * Composites the local + remote video tracks onto an offscreen canvas (remote
 * full-frame, local as a picture-in-picture corner, matching the on-screen
 * call layout) and mixes both audio tracks through a single AudioContext, so
 * the resulting MediaRecorder output is a single file with both sides of the
 * call — not just the recording user's own camera.
 *
 * `onRecordingComplete` fires whenever the recorder actually stops, whether
 * that was via `stopRecording()` or the unmount cleanup below (e.g. the call
 * ended because the other participant left) — callers that need to persist
 * the recording shouldn't have to handle those two paths separately.
 */
export function useCallRecording(
  localStream: MediaStream | null,
  remoteStream: MediaStream | null,
  onRecordingComplete?: (blob: Blob) => void,
) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localVideoElRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoElRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const combinedStreamRef = useRef<MediaStream | null>(null);
  const onRecordingCompleteRef = useRef(onRecordingComplete);
  useEffect(() => {
    onRecordingCompleteRef.current = onRecordingComplete;
  });

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const remoteVideo = remoteVideoElRef.current;
    if (remoteVideo && remoteVideo.readyState >= 2) {
      ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);
    }

    const localVideo = localVideoElRef.current;
    if (localVideo && localVideo.readyState >= 2) {
      const x = canvas.width - PIP_WIDTH - PIP_MARGIN;
      const y = PIP_MARGIN;
      ctx.drawImage(localVideo, x, y, PIP_WIDTH, PIP_HEIGHT);
    }

    rafRef.current = requestAnimationFrame(drawFrame);
  }, []);

  const cleanup = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    combinedStreamRef.current?.getTracks().forEach((track) => track.stop());
    combinedStreamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    if (localVideoElRef.current) localVideoElRef.current.srcObject = null;
    if (remoteVideoElRef.current) remoteVideoElRef.current.srcObject = null;
    localVideoElRef.current = null;
    remoteVideoElRef.current = null;
  }, []);

  const startRecording = useCallback(() => {
    if (!localStream || !remoteStream || recorderRef.current) return;
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;
      canvasRef.current = canvas;

      const localVideo = document.createElement('video');
      localVideo.muted = true;
      localVideo.playsInline = true;
      localVideo.srcObject = localStream;
      localVideo.play().catch(() => {});
      localVideoElRef.current = localVideo;

      const remoteVideo = document.createElement('video');
      remoteVideo.muted = true;
      remoteVideo.playsInline = true;
      remoteVideo.srcObject = remoteStream;
      remoteVideo.play().catch(() => {});
      remoteVideoElRef.current = remoteVideo;

      rafRef.current = requestAnimationFrame(drawFrame);

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const destination = audioContext.createMediaStreamDestination();
      [localStream, remoteStream].forEach((stream) => {
        if (stream.getAudioTracks().length === 0) return;
        audioContext.createMediaStreamSource(stream).connect(destination);
      });

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks(),
      ]);
      combinedStreamRef.current = combinedStream;

      const recorder = new MediaRecorder(combinedStream, { mimeType: pickMimeType() });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];
        cleanup();
        recorderRef.current = null;
        setIsRecording(false);
        if (blob.size > 0) onRecordingCompleteRef.current?.(blob);
      };

      recorder.start();
      recorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
      cleanup();
    }
  }, [localStream, remoteStream, drawFrame, cleanup]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  // Stop cleanly if the component unmounts mid-recording (e.g. call ends).
  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isRecording,
    canRecord: Boolean(localStream && remoteStream),
    error,
    startRecording,
    stopRecording,
  };
}

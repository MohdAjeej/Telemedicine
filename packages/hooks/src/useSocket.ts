import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

export interface UseSocketOptions {
  url: string;
  token?: string;
  enabled?: boolean;
}

export function useSocket({ url, token, enabled = true }: UseSocketOptions): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!enabled || !token) {
      return;
    }

    const socket = io(url, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [url, token, enabled]);

  return socketRef.current;
}

import { SOCKET_EVENTS } from '@telemedicine/constants';
import { registerSocketHandler } from '../../sockets/registerHandlers';
import { logger } from '../../utils/logger';

function roomChannel(roomId: string): string {
  return `video:${roomId}`;
}

/**
 * Pure WebRTC signaling relay: joins/leaves a per-appointment room and
 * forwards offer/answer/ICE payloads between the two participants already in
 * that room. No media ever passes through the server.
 */
registerSocketHandler((_io, socket) => {
  socket.on(SOCKET_EVENTS.VIDEO_JOIN, ({ roomId }: { roomId: string }) => {
    socket.join(roomChannel(roomId));
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_JOIN, { userId: socket.data.user?.id });
    logger.info(`Socket ${socket.id} joined video room ${roomId}`);
  });

  socket.on(SOCKET_EVENTS.VIDEO_LEAVE, ({ roomId }: { roomId: string }) => {
    socket.leave(roomChannel(roomId));
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_LEAVE, { userId: socket.data.user?.id });
  });

  socket.on(SOCKET_EVENTS.VIDEO_OFFER, ({ roomId, offer }: { roomId: string; offer: unknown }) => {
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_OFFER, { offer, from: socket.data.user?.id });
  });

  socket.on(SOCKET_EVENTS.VIDEO_ANSWER, ({ roomId, answer }: { roomId: string; answer: unknown }) => {
    socket.to(roomChannel(roomId)).emit(SOCKET_EVENTS.VIDEO_ANSWER, { answer, from: socket.data.user?.id });
  });

  socket.on(
    SOCKET_EVENTS.VIDEO_ICE_CANDIDATE,
    ({ roomId, candidate }: { roomId: string; candidate: unknown }) => {
      socket
        .to(roomChannel(roomId))
        .emit(SOCKET_EVENTS.VIDEO_ICE_CANDIDATE, { candidate, from: socket.data.user?.id });
    },
  );
});

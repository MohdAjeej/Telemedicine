export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',

  APPOINTMENT_CREATED: 'appointment:created',
  APPOINTMENT_UPDATED: 'appointment:updated',
  APPOINTMENT_CANCELLED: 'appointment:cancelled',

  NOTIFICATION_NEW: 'notification:new',

  MESSAGE_NEW: 'message:new',
  MESSAGE_READ: 'message:read',
  CONVERSATION_TYPING: 'conversation:typing',

  VIDEO_JOIN: 'video:join',
  VIDEO_LEAVE: 'video:leave',
  VIDEO_OFFER: 'video:offer',
  VIDEO_ANSWER: 'video:answer',
  VIDEO_ICE_CANDIDATE: 'video:ice-candidate',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

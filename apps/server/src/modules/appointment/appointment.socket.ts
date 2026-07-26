import { SOCKET_EVENTS } from '@telemedicine/constants';
import { getSocketServer } from '../../sockets/socket.server';
import { logger } from '../../utils/logger';
import type { HydratedAppointment } from './appointment.model';

function safeEmit(userId: string | undefined, event: string, payload: unknown): void {
  if (!userId) return;
  try {
    getSocketServer().to(`user:${userId}`).emit(event, payload);
  } catch (error) {
    // Socket server may not be initialized yet (e.g. in unit tests) — real-time
    // delivery is a best-effort enhancement on top of the persisted appointment.
    logger.warn(`Skipped socket emit (${event}): ${(error as Error).message}`);
  }
}

export function participantUserIds(appointment: HydratedAppointment): {
  patientUserId?: string;
  doctorUserId?: string;
} {
  // patientId/doctorId are populated with their profile doc which itself has
  // a populated userId — but stay defensive in case callers pass an
  // unpopulated document.
  const patient = appointment.patientId as unknown as { userId?: { _id?: unknown } | string };
  const doctor = appointment.doctorId as unknown as { userId?: { _id?: unknown } | string };

  const patientUserId =
    typeof patient?.userId === 'object' ? String(patient.userId?._id ?? '') : patient?.userId;
  const doctorUserId =
    typeof doctor?.userId === 'object' ? String(doctor.userId?._id ?? '') : doctor?.userId;

  return {
    patientUserId: patientUserId || undefined,
    doctorUserId: doctorUserId || undefined,
  };
}

export function emitAppointmentCreated(appointment: HydratedAppointment): void {
  const { patientUserId, doctorUserId } = participantUserIds(appointment);
  safeEmit(doctorUserId, SOCKET_EVENTS.APPOINTMENT_CREATED, appointment);
  safeEmit(patientUserId, SOCKET_EVENTS.APPOINTMENT_CREATED, appointment);
}

export function emitAppointmentUpdated(appointment: HydratedAppointment): void {
  const { patientUserId, doctorUserId } = participantUserIds(appointment);
  safeEmit(doctorUserId, SOCKET_EVENTS.APPOINTMENT_UPDATED, appointment);
  safeEmit(patientUserId, SOCKET_EVENTS.APPOINTMENT_UPDATED, appointment);
}

export function emitAppointmentCancelled(appointment: HydratedAppointment): void {
  const { patientUserId, doctorUserId } = participantUserIds(appointment);
  safeEmit(doctorUserId, SOCKET_EVENTS.APPOINTMENT_CANCELLED, appointment);
  safeEmit(patientUserId, SOCKET_EVENTS.APPOINTMENT_CANCELLED, appointment);
}

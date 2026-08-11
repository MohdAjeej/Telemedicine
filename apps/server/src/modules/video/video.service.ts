import { ApiError } from '../../helpers/ApiError';
import type { HydratedAppointment } from '../appointment/appointment.model';
import { appointmentRepository } from '../appointment/appointment.repository';
import { participantUserIds } from '../appointment/appointment.socket';

/**
 * Video consultations are Doctor <-> Patient only (never Health Officer) — the
 * health officer's involvement ends once the appointment is booked/confirmed;
 * the live call itself is a direct doctor-patient visit. Shared by
 * `getRoomForAppointment` (joining the live room) and the recording module
 * (which needs the same membership check but without the "call is currently
 * live" constraints, since recordings are viewed after the fact too).
 */
export function assertVideoParticipant(appointment: HydratedAppointment, requestingUserId: string): void {
  const { doctorUserId, patientUserId } = participantUserIds(appointment);
  if (![doctorUserId, patientUserId].includes(requestingUserId)) {
    throw ApiError.forbidden('You are not a participant in this video consultation');
  }
}

export const videoService = {
  /**
   * Video consultations are Doctor <-> Patient only (never Health Officer) —
   * the health officer's involvement ends once the appointment is booked/confirmed;
   * the live call itself is a direct doctor-patient visit.
   */
  async getRoomForAppointment(appointmentId: string, requestingUserId: string) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    if (appointment.type !== 'video') {
      throw ApiError.badRequest('This appointment is not a video consultation');
    }
    if (appointment.status !== 'confirmed') {
      throw ApiError.badRequest('The appointment must be confirmed before joining video');
    }
    if (!appointment.videoRoomId) {
      throw ApiError.badRequest('No video room has been assigned to this appointment yet');
    }

    assertVideoParticipant(appointment, requestingUserId);

    return { roomId: appointment.videoRoomId, appointmentId };
  },
};

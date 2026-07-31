import { ApiError } from '../../helpers/ApiError';
import { appointmentRepository } from '../appointment/appointment.repository';
import { participantUserIds } from '../appointment/appointment.socket';

function healthOfficerUserId(appointment: { healthOfficerId?: unknown }): string | undefined {
  const officer = appointment.healthOfficerId as unknown as { userId?: { _id?: unknown } | string } | undefined;
  if (!officer || typeof officer !== 'object') return undefined;
  const userId = officer.userId;
  return typeof userId === 'object' ? String(userId?._id ?? '') || undefined : userId;
}

export const videoService = {
  /**
   * Video consultations are Doctor <-> Health Officer only (never Patient) —
   * the patient's health data is relayed live by the health officer physically
   * present with them, while the doctor consults remotely.
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
    if (!appointment.healthOfficerId) {
      throw ApiError.badRequest('This appointment has no assigned health officer; video is unavailable');
    }

    const { doctorUserId } = participantUserIds(appointment);
    const officerUserId = healthOfficerUserId(appointment);
    if (![doctorUserId, officerUserId].includes(requestingUserId)) {
      throw ApiError.forbidden('You are not a participant in this video consultation');
    }

    return { roomId: appointment.videoRoomId, appointmentId };
  },
};

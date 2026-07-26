import { ApiError } from '../../helpers/ApiError';
import { appointmentRepository } from '../appointment/appointment.repository';
import { participantUserIds } from '../appointment/appointment.socket';

export const videoService = {
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

    const { patientUserId, doctorUserId } = participantUserIds(appointment);
    if (![patientUserId, doctorUserId].includes(requestingUserId)) {
      throw ApiError.forbidden('You are not a participant in this appointment');
    }

    return { roomId: appointment.videoRoomId, appointmentId };
  },
};

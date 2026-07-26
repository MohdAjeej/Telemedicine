import crypto from 'node:crypto';
import { ApiError } from '../../helpers/ApiError';
import { appointmentRepository } from '../appointment/appointment.repository';
import { consultationRepository } from './consultation.repository';

export const consultationService = {
  async start(appointmentId: string, chiefComplaint?: string) {
    const appointment = await appointmentRepository.findById(appointmentId);
    if (!appointment) throw ApiError.notFound('Appointment not found');
    if (appointment.status !== 'confirmed') {
      throw ApiError.badRequest('Only confirmed appointments can start a consultation');
    }

    const existing = await consultationRepository.findByAppointmentId(appointmentId);
    if (existing) return existing;

    return consultationRepository.create({
      appointmentId,
      doctorId: appointment.doctorId.toString(),
      patientId: appointment.patientId.toString(),
      chiefComplaint,
      videoRoomId: appointment.type === 'video' ? crypto.randomUUID() : undefined,
    });
  },

  async list(filter: { doctorId?: string; patientId?: string; page?: number; limit?: number }) {
    return consultationRepository.findMany(filter);
  },

  async getById(id: string) {
    const consultation = await consultationRepository.findById(id);
    if (!consultation) throw ApiError.notFound('Consultation not found');
    return consultation;
  },

  async update(
    id: string,
    input: { chiefComplaint?: string; diagnosis?: string; notes?: string; followUpRequired?: boolean; followUpDate?: string },
  ) {
    const consultation = await consultationRepository.update(id, input);
    if (!consultation) throw ApiError.notFound('Consultation not found');
    return consultation;
  },

  async complete(id: string) {
    const consultation = await consultationRepository.complete(id);
    if (!consultation) throw ApiError.notFound('Consultation not found');
    await appointmentRepository.updateStatus(consultation.appointmentId.toString(), 'completed');
    return consultation;
  },
};

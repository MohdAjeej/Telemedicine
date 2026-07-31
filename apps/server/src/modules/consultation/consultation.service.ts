import crypto from 'node:crypto';
import { Error as MongooseError } from 'mongoose';
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

    // Extract the actual ObjectId string, handling both populated and non-populated cases
    const getDoctorId = (): string => {
      const id = appointment.doctorId;
      if (!id) {
        throw ApiError.badRequest('Appointment is missing doctorId');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (id as any)?._id ? (id as any)._id.toString() : id.toString();
    };

    const getPatientId = (): string => {
      const id = appointment.patientId;
      if (!id) {
        throw ApiError.badRequest('Appointment is missing patientId');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (id as any)?._id ? (id as any)._id.toString() : id.toString();
    };

    const getHospitalId = (): string => {
      const id = appointment.hospitalId;
      if (!id) {
        throw ApiError.badRequest('Appointment is missing hospitalId');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (id as any)?._id ? (id as any)._id.toString() : id.toString();
    };

    try {
      return await consultationRepository.create({
        appointmentId,
        doctorId: getDoctorId(),
        patientId: getPatientId(),
        hospitalId: getHospitalId(),
        chiefComplaint,
        videoRoomId: appointment.type === 'video' ? crypto.randomUUID() : undefined,
      });
    } catch (error) {
      // If it's a Mongoose validation error, provide more details
      if (error instanceof MongooseError.ValidationError) {
        const messages = Object.values(error.errors)
          .map((err) => err.message)
          .join(', ');
        throw ApiError.badRequest(`Validation failed: ${messages}`);
      }
      // If it's a cast error (invalid ObjectId format)
      if (error instanceof MongooseError.CastError) {
        throw ApiError.badRequest(`Invalid ID format: ${error.message}`);
      }
      throw error;
    }
  },

  async list(filter: {
    doctorId?: string;
    patientId?: string;
    hospitalId?: string;
    page?: number;
    limit?: number;
  }) {
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

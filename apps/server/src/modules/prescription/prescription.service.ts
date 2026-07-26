import { ApiError } from '../../helpers/ApiError';
import { consultationRepository } from '../consultation/consultation.repository';
import { prescriptionRepository } from './prescription.repository';
import type { Medication } from './prescription.model';

export const prescriptionService = {
  async create(consultationId: string, medications: Medication[]) {
    const consultation = await consultationRepository.findById(consultationId);
    if (!consultation) throw ApiError.notFound('Consultation not found');

    return prescriptionRepository.create({
      consultationId,
      doctorId: consultation.doctorId.toString(),
      patientId: consultation.patientId.toString(),
      medications,
    });
  },

  async list(filter: { doctorId?: string; patientId?: string; page?: number; limit?: number }) {
    return prescriptionRepository.findMany(filter);
  },

  async getById(id: string) {
    const prescription = await prescriptionRepository.findById(id);
    if (!prescription) throw ApiError.notFound('Prescription not found');
    return prescription;
  },

  async cancel(id: string) {
    const prescription = await prescriptionRepository.updateStatus(id, 'cancelled');
    if (!prescription) throw ApiError.notFound('Prescription not found');
    return prescription;
  },
};

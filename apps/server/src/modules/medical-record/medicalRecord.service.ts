import { ApiError } from '../../helpers/ApiError';
import { medicalRecordRepository } from './medicalRecord.repository';

export const medicalRecordService = {
  async create(input: {
    patientId: string;
    type: string;
    title: string;
    description?: string;
    fileUrl?: string;
    uploadedBy: string;
    tags?: string[];
  }) {
    return medicalRecordRepository.create(input);
  },

  async listForPatient(patientId: string) {
    return medicalRecordRepository.findByPatientId(patientId);
  },

  async getById(id: string) {
    const record = await medicalRecordRepository.findById(id);
    if (!record) throw ApiError.notFound('Medical record not found');
    return record;
  },

  async remove(id: string) {
    const record = await medicalRecordRepository.deleteById(id);
    if (!record) throw ApiError.notFound('Medical record not found');
  },
};

import { ApiError } from '../../helpers/ApiError';
import { toHospitalIdString } from '../../helpers/hospitalScope';
import { patientRepository } from '../patient/patient.repository';
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
    const patient = await patientRepository.findById(input.patientId);
    if (!patient) throw ApiError.notFound('Patient not found');
    return medicalRecordRepository.create({ ...input, hospitalId: toHospitalIdString(patient.hospitalId)! });
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

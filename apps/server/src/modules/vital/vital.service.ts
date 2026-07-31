import { ApiError } from '../../helpers/ApiError';
import { toHospitalIdString } from '../../helpers/hospitalScope';
import { patientRepository } from '../patient/patient.repository';
import { vitalRepository } from './vital.repository';

export const vitalService = {
  async record(input: {
    patientId: string;
    recordedBy: string;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bloodSugar?: number;
    symptoms?: string;
    notes?: string;
  }) {
    const patient = await patientRepository.findById(input.patientId);
    if (!patient) throw ApiError.notFound('Patient not found');
    return vitalRepository.create({ ...input, hospitalId: toHospitalIdString(patient.hospitalId)! });
  },

  async listForPatient(patientId: string) {
    return vitalRepository.findByPatientId(patientId);
  },

  async getById(id: string) {
    const vital = await vitalRepository.findById(id);
    if (!vital) throw ApiError.notFound('Vital record not found');
    return vital;
  },
};

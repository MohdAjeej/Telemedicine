import { cloudinary } from '../../config/cloudinary.config';
import { ApiError } from '../../helpers/ApiError';
import { toHospitalIdString } from '../../helpers/hospitalScope';
import { patientRepository } from '../patient/patient.repository';
import { labReportRepository } from './labReport.repository';
import type { LabReportStatus } from './labReport.model';

function uploadReportBuffer(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'auto', folder: 'telemedicine/lab-reports' },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export const labReportService = {
  async request(input: { patientId: string; requestedBy: string; testType: string }) {
    const patient = await patientRepository.findById(input.patientId);
    if (!patient) throw ApiError.notFound('Patient not found');
    return labReportRepository.create({ ...input, hospitalId: toHospitalIdString(patient.hospitalId)! });
  },

  async listForPatient(patientId: string) {
    return labReportRepository.findByPatientId(patientId);
  },

  async getById(id: string) {
    const report = await labReportRepository.findById(id);
    if (!report) throw ApiError.notFound('Lab report not found');
    return report;
  },

  async updateResult(id: string, input: { status: LabReportStatus; resultFileUrl?: string; resultSummary?: string }) {
    const report = await labReportRepository.updateResult(id, input);
    if (!report) throw ApiError.notFound('Lab report not found');
    return report;
  },

  async uploadReport(id: string, buffer: Buffer) {
    const existing = await labReportRepository.findById(id);
    if (!existing) throw ApiError.notFound('Lab report not found');
    const resultFileUrl = await uploadReportBuffer(buffer);
    const report = await labReportRepository.updateResult(id, { status: 'completed', resultFileUrl });
    if (!report) throw ApiError.notFound('Lab report not found');
    return report;
  },

  async remove(id: string) {
    const report = await labReportRepository.deleteById(id);
    if (!report) throw ApiError.notFound('Lab report not found');
  },
};

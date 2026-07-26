import { ApiError } from '../../helpers/ApiError';
import { labReportRepository } from './labReport.repository';
import type { LabReportStatus } from './labReport.model';

export const labReportService = {
  async request(input: { patientId: string; requestedBy: string; testType: string }) {
    return labReportRepository.create(input);
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
};

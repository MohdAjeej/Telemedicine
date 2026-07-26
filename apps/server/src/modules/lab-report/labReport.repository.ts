import { LabReportModel, type HydratedLabReport, type LabReportStatus } from './labReport.model';

export const labReportRepository = {
  create(input: { patientId: string; requestedBy: string; testType: string }): Promise<HydratedLabReport> {
    return LabReportModel.create(input);
  },

  findByPatientId(patientId: string): Promise<HydratedLabReport[]> {
    return LabReportModel.find({ patientId }).sort({ requestedAt: -1 }).exec();
  },

  findById(id: string): Promise<HydratedLabReport | null> {
    return LabReportModel.findById(id).exec();
  },

  updateResult(
    id: string,
    input: { status: LabReportStatus; resultFileUrl?: string; resultSummary?: string },
  ): Promise<HydratedLabReport | null> {
    const update: Record<string, unknown> = { ...input };
    if (input.status === 'completed') update.completedAt = new Date();
    return LabReportModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
  },
};

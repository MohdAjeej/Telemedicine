import { MedicalRecordModel, type HydratedMedicalRecord } from './medicalRecord.model';

export const medicalRecordRepository = {
  create(input: {
    patientId: string;
    type: string;
    title: string;
    description?: string;
    fileUrl?: string;
    uploadedBy: string;
    tags?: string[];
  }): Promise<HydratedMedicalRecord> {
    return MedicalRecordModel.create(input);
  },

  findByPatientId(patientId: string): Promise<HydratedMedicalRecord[]> {
    return MedicalRecordModel.find({ patientId }).sort({ recordDate: -1 }).exec();
  },

  findById(id: string): Promise<HydratedMedicalRecord | null> {
    return MedicalRecordModel.findById(id).exec();
  },

  deleteById(id: string): Promise<HydratedMedicalRecord | null> {
    return MedicalRecordModel.findByIdAndDelete(id).exec();
  },
};

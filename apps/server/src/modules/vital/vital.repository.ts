import { VitalModel, type HydratedVital } from './vital.model';

export const vitalRepository = {
  create(input: {
    patientId: string;
    hospitalId: string;
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
    age?: number;
    gender?: 'male' | 'female' | 'other';
    hemoglobin?: number;
    comorbidity?: string;
    complaints?: string;
    symptoms?: string;
    notes?: string;
  }): Promise<HydratedVital> {
    return VitalModel.create(input);
  },

  async findByPatientId(patientId: string, limit = 50): Promise<HydratedVital[]> {
    return VitalModel.find({ patientId }).sort({ recordedAt: -1 }).limit(limit).exec();
  },

  findById(id: string): Promise<HydratedVital | null> {
    return VitalModel.findById(id).exec();
  },
};

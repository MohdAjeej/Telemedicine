import { ApiError } from '../../helpers/ApiError';
import { consultationRepository } from '../consultation/consultation.repository';
import { prescriptionRepository } from './prescription.repository';
import type { Medication } from './prescription.model';

export interface CreatePrescriptionInput {
  consultationId: string;
  medications: Medication[];
  comorbidity?: string;
  allergy?: string;
  otherIllness?: string;
  familyHistory?: string;
  symptoms?: string;
  advice?: string;
  provisionalDiagnosis?: string;
  finalDiagnosis?: string;
  clinicalFindings?: string;
  labTests?: string[];
  followUpDate?: string;
}

export const prescriptionService = {
  async create(input: CreatePrescriptionInput) {
    const consultation = await consultationRepository.findById(input.consultationId);
    if (!consultation) throw ApiError.notFound('Consultation not found');

    // consultationRepository.findById populates doctorId/patientId, so extract
    // the actual ObjectId string rather than calling .toString() on the
    // populated document (same pattern as consultation.service.ts's start()).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doctorRef = consultation.doctorId as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patientRef = consultation.patientId as any;

    return prescriptionRepository.create({
      consultationId: input.consultationId,
      doctorId: doctorRef?._id ? doctorRef._id.toString() : doctorRef.toString(),
      patientId: patientRef?._id ? patientRef._id.toString() : patientRef.toString(),
      hospitalId: consultation.hospitalId.toString(),
      medications: input.medications,
      comorbidity: input.comorbidity,
      allergy: input.allergy,
      otherIllness: input.otherIllness,
      familyHistory: input.familyHistory,
      symptoms: input.symptoms,
      advice: input.advice,
      provisionalDiagnosis: input.provisionalDiagnosis,
      finalDiagnosis: input.finalDiagnosis,
      clinicalFindings: input.clinicalFindings,
      labTests: input.labTests,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : undefined,
    });
  },

  async list(filter: {
    doctorId?: string;
    patientId?: string;
    hospitalId?: string;
    page?: number;
    limit?: number;
  }) {
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

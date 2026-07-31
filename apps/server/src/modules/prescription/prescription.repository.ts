import { PrescriptionModel, type HydratedPrescription, type Medication } from './prescription.model';

export const prescriptionRepository = {
  create(input: {
    consultationId: string;
    doctorId: string;
    patientId: string;
    hospitalId: string;
    medications: Medication[];
    comorbidity?: string;
    complaints?: string;
    allergy?: string;
    otherIllness?: string;
    chiefComplaints?: string;
    symptoms?: string;
    advice?: string;
    provisionalDiagnosis?: string;
    finalDiagnosis?: string;
    clinicalFindings?: string;
    labTests?: string[];
    followUpDate?: Date;
  }): Promise<HydratedPrescription> {
    return PrescriptionModel.create(input);
  },

  findById(id: string): Promise<HydratedPrescription | null> {
    return PrescriptionModel.findById(id)
      .populate({ path: 'doctorId', populate: { path: 'userId' } })
      .populate({ path: 'patientId', populate: { path: 'userId' } })
      .populate('consultationId')
      .exec();
  },

  async findMany(filter: {
    doctorId?: string;
    patientId?: string;
    hospitalId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const query: Record<string, unknown> = {};
    if (filter.doctorId) query.doctorId = filter.doctorId;
    if (filter.patientId) query.patientId = filter.patientId;
    if (filter.hospitalId) query.hospitalId = filter.hospitalId;

    const [items, total] = await Promise.all([
      PrescriptionModel.find(query)
        .populate({ path: 'doctorId', populate: { path: 'userId' } })
        .populate({ path: 'patientId', populate: { path: 'userId' } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      PrescriptionModel.countDocuments(query),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  updateStatus(id: string, status: 'active' | 'completed' | 'cancelled'): Promise<HydratedPrescription | null> {
    return PrescriptionModel.findByIdAndUpdate(id, { $set: { status } }, { new: true }).exec();
  },
};

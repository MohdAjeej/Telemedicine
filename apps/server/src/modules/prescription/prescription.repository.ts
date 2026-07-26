import { PrescriptionModel, type HydratedPrescription, type Medication } from './prescription.model';

export const prescriptionRepository = {
  create(input: {
    consultationId: string;
    doctorId: string;
    patientId: string;
    medications: Medication[];
  }): Promise<HydratedPrescription> {
    return PrescriptionModel.create(input);
  },

  findById(id: string): Promise<HydratedPrescription | null> {
    return PrescriptionModel.findById(id).populate('doctorId patientId consultationId').exec();
  },

  async findMany(filter: { doctorId?: string; patientId?: string; page?: number; limit?: number }) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 10;
    const query: Record<string, unknown> = {};
    if (filter.doctorId) query.doctorId = filter.doctorId;
    if (filter.patientId) query.patientId = filter.patientId;

    const [items, total] = await Promise.all([
      PrescriptionModel.find(query)
        .populate('doctorId patientId')
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

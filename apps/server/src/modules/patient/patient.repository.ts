import { PatientModel, type HydratedPatient } from './patient.model';
import type { ListPatientsQuery, UpdatePatientProfileInput } from './patient.types';

function toPatientDoc(input: UpdatePatientProfileInput) {
  return {
    ...(input.dateOfBirth ? { dateOfBirth: new Date(input.dateOfBirth) } : {}),
    ...(input.gender ? { gender: input.gender } : {}),
    ...(input.bloodGroup ? { bloodGroup: input.bloodGroup } : {}),
    ...(input.street || input.city || input.state || input.zipCode || input.country
      ? {
          address: {
            ...(input.street ? { street: input.street } : {}),
            ...(input.city ? { city: input.city } : {}),
            ...(input.state ? { state: input.state } : {}),
            ...(input.zipCode ? { zipCode: input.zipCode } : {}),
            ...(input.country ? { country: input.country } : {}),
          },
        }
      : {}),
    ...(input.emergencyContactName || input.emergencyContactPhone || input.emergencyContactRelation
      ? {
          emergencyContact: {
            name: input.emergencyContactName,
            phone: input.emergencyContactPhone,
            relation: input.emergencyContactRelation,
          },
        }
      : {}),
    ...(input.insuranceProvider || input.insurancePolicyNumber
      ? {
          insuranceInfo: {
            provider: input.insuranceProvider,
            policyNumber: input.insurancePolicyNumber,
          },
        }
      : {}),
    ...(input.allergies ? { allergies: input.allergies } : {}),
    ...(input.chronicConditions ? { chronicConditions: input.chronicConditions } : {}),
    ...(input.assignedDoctorId ? { assignedDoctorId: input.assignedDoctorId } : {}),
  };
}

export const patientRepository = {
  createMinimal(userId: string): Promise<HydratedPatient> {
    return PatientModel.create({ userId });
  },

  findByUserId(userId: string): Promise<HydratedPatient | null> {
    return PatientModel.findOne({ userId }).populate('userId assignedDoctorId').exec();
  },

  findById(id: string): Promise<HydratedPatient | null> {
    return PatientModel.findById(id).populate('userId assignedDoctorId').exec();
  },

  async findMany(query: ListPatientsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: Record<string, unknown> = {};
    if (query.assignedDoctorId) filter.assignedDoctorId = query.assignedDoctorId;

    const [items, total] = await Promise.all([
      PatientModel.find(filter)
        .populate('userId assignedDoctorId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      PatientModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  updateByUserId(userId: string, input: UpdatePatientProfileInput): Promise<HydratedPatient | null> {
    return PatientModel.findOneAndUpdate(
      { userId },
      { $set: toPatientDoc(input) },
      { new: true, upsert: true },
    ).exec();
  },

  updateById(id: string, input: UpdatePatientProfileInput): Promise<HydratedPatient | null> {
    return PatientModel.findByIdAndUpdate(id, { $set: toPatientDoc(input) }, { new: true }).exec();
  },

  deleteById(id: string): Promise<HydratedPatient | null> {
    return PatientModel.findByIdAndDelete(id).exec();
  },
};

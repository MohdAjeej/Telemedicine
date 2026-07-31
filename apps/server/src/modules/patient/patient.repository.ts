import { PatientModel, type HydratedPatient } from './patient.model';
import type { ListPatientsQuery, UpdatePatientProfileInput } from './patient.types';

function toPatientDoc(input: UpdatePatientProfileInput) {
  return {
    ...(input.age !== undefined ? { age: input.age } : {}),
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
  /** Creates the Patient profile document itself — used at registration time, when hospitalId/age are known upfront and required by the schema. */
  create(input: { userId: string; hospitalId: string; age: number; gender?: 'male' | 'female' | 'other' }): Promise<HydratedPatient> {
    return PatientModel.create(input);
  },

  findByUserId(userId: string): Promise<HydratedPatient | null> {
    return PatientModel.findOne({ userId }).populate('userId assignedDoctorId hospitalId').exec();
  },

  findById(id: string): Promise<HydratedPatient | null> {
    return PatientModel.findById(id).populate('userId assignedDoctorId hospitalId').exec();
  },

  async findMany(query: ListPatientsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: Record<string, unknown> = {};
    if (query.assignedDoctorId) filter.assignedDoctorId = query.assignedDoctorId;
    if (query.hospitalId) filter.hospitalId = query.hospitalId;

    const [items, total] = await Promise.all([
      PatientModel.find(filter)
        .populate('userId assignedDoctorId hospitalId')
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
      { new: true },
    ).exec();
  },

  updateById(id: string, input: UpdatePatientProfileInput): Promise<HydratedPatient | null> {
    return PatientModel.findByIdAndUpdate(id, { $set: toPatientDoc(input) }, { new: true }).exec();
  },

  deleteById(id: string): Promise<HydratedPatient | null> {
    return PatientModel.findByIdAndDelete(id).exec();
  },
};

import { DoctorModel, type HydratedDoctor } from './doctor.model';
import type { ListDoctorsQuery, UpdateDoctorProfileInput } from './doctor.types';

export const doctorRepository = {
  createMinimal(userId: string): Promise<HydratedDoctor> {
    return DoctorModel.create({ userId });
  },

  findByUserId(userId: string): Promise<HydratedDoctor | null> {
    return DoctorModel.findOne({ userId }).populate('userId hospitalId').exec();
  },

  findById(id: string): Promise<HydratedDoctor | null> {
    return DoctorModel.findById(id).populate('userId hospitalId').exec();
  },

  async findMany(query: ListDoctorsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: Record<string, unknown> = {};

    if (query.hospitalId) filter.hospitalId = query.hospitalId;
    if (query.specialization) filter.specialization = query.specialization;

    const [items, total] = await Promise.all([
      DoctorModel.find(filter)
        .populate('userId hospitalId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      DoctorModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  updateByUserId(userId: string, input: UpdateDoctorProfileInput): Promise<HydratedDoctor | null> {
    return DoctorModel.findOneAndUpdate(
      { userId },
      { $set: input },
      { new: true, upsert: true },
    ).exec();
  },

  updateById(id: string, input: UpdateDoctorProfileInput): Promise<HydratedDoctor | null> {
    return DoctorModel.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
  },

  deleteByUserId(userId: string): Promise<HydratedDoctor | null> {
    return DoctorModel.findOneAndDelete({ userId }).exec();
  },

  deleteById(id: string): Promise<HydratedDoctor | null> {
    return DoctorModel.findByIdAndDelete(id).exec();
  },
};

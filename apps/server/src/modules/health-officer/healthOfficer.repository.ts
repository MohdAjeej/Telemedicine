import { HealthOfficerModel, type HydratedHealthOfficer } from './healthOfficer.model';
import type { ListHealthOfficersQuery, UpdateHealthOfficerProfileInput } from './healthOfficer.types';

export const healthOfficerRepository = {
  createMinimal(userId: string): Promise<HydratedHealthOfficer> {
    return HealthOfficerModel.create({ userId });
  },

  findByUserId(userId: string): Promise<HydratedHealthOfficer | null> {
    return HealthOfficerModel.findOne({ userId }).populate('userId hospitalId').exec();
  },

  findById(id: string): Promise<HydratedHealthOfficer | null> {
    return HealthOfficerModel.findById(id).populate('userId hospitalId').exec();
  },

  async findMany(query: ListHealthOfficersQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: Record<string, unknown> = {};
    if (query.hospitalId) filter.hospitalId = query.hospitalId;

    const [items, total] = await Promise.all([
      HealthOfficerModel.find(filter)
        .populate('userId hospitalId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      HealthOfficerModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  updateByUserId(
    userId: string,
    input: UpdateHealthOfficerProfileInput,
  ): Promise<HydratedHealthOfficer | null> {
    return HealthOfficerModel.findOneAndUpdate(
      { userId },
      { $set: input },
      { new: true, upsert: true },
    ).exec();
  },

  updateById(id: string, input: UpdateHealthOfficerProfileInput): Promise<HydratedHealthOfficer | null> {
    return HealthOfficerModel.findByIdAndUpdate(id, { $set: input }, { new: true }).exec();
  },

  deleteById(id: string): Promise<HydratedHealthOfficer | null> {
    return HealthOfficerModel.findByIdAndDelete(id).exec();
  },
};

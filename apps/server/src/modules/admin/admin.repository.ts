import { AdminModel, type HydratedAdmin } from './admin.model';
import type { UpdateAdminProfileInput } from './admin.types';

export const adminRepository = {
  findByUserId(userId: string): Promise<HydratedAdmin | null> {
    return AdminModel.findOne({ userId }).populate('userId').exec();
  },

  findById(id: string): Promise<HydratedAdmin | null> {
    return AdminModel.findById(id).populate('userId').exec();
  },

  async findMany(hospitalId: string) {
    return AdminModel.find({ hospitalId }).populate('userId').sort({ createdAt: -1 }).exec();
  },

  updateByUserId(userId: string, input: UpdateAdminProfileInput): Promise<HydratedAdmin | null> {
    return AdminModel.findOneAndUpdate(
      { userId },
      { $set: input },
      { new: true, upsert: true },
    ).exec();
  },

  deleteById(id: string): Promise<HydratedAdmin | null> {
    return AdminModel.findByIdAndDelete(id).exec();
  },
};

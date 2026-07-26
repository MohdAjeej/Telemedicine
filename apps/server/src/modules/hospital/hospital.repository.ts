import { HospitalModel, type HydratedHospital } from './hospital.model';
import type { CreateHospitalInput, ListHospitalsQuery, UpdateHospitalInput } from './hospital.types';

function toHospitalDoc(input: CreateHospitalInput | UpdateHospitalInput) {
  return {
    ...('name' in input ? { name: input.name } : {}),
    ...('registrationNumber' in input ? { registrationNumber: input.registrationNumber } : {}),
    ...('type' in input ? { type: input.type } : {}),
    ...(input.phone || input.email || input.website
      ? {
          contact: {
            ...(input.phone ? { phone: input.phone } : {}),
            ...(input.email ? { email: input.email } : {}),
            ...(input.website ? { website: input.website } : {}),
          },
        }
      : {}),
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
    ...(input.departments ? { departments: input.departments } : {}),
  };
}

export const hospitalRepository = {
  create(input: CreateHospitalInput): Promise<HydratedHospital> {
    return HospitalModel.create({
      name: input.name,
      registrationNumber: input.registrationNumber,
      type: input.type,
      contact: { phone: input.phone, email: input.email, website: input.website },
      address: {
        street: input.street,
        city: input.city,
        state: input.state,
        zipCode: input.zipCode,
        country: input.country,
      },
      departments: input.departments ?? [],
    });
  },

  findById(id: string): Promise<HydratedHospital | null> {
    return HospitalModel.findById(id).exec();
  },

  async findMany(query: ListHospitalsQuery) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.search) filter.$text = { $search: query.search };

    const [items, total] = await Promise.all([
      HospitalModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      HospitalModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  update(id: string, input: UpdateHospitalInput): Promise<HydratedHospital | null> {
    const update: Record<string, unknown> = toHospitalDoc(input);
    if (input.status) update.status = input.status;
    return HospitalModel.findByIdAndUpdate(id, { $set: update }, { new: true }).exec();
  },

  delete(id: string): Promise<HydratedHospital | null> {
    return HospitalModel.findByIdAndDelete(id).exec();
  },
};

import { ApiError } from '../../helpers/ApiError';
import { hospitalRepository } from './hospital.repository';
import type { CreateHospitalInput, ListHospitalsQuery, UpdateHospitalInput } from './hospital.types';

const DUPLICATE_KEY_ERROR_CODE = 11000;

export const hospitalService = {
  async create(input: CreateHospitalInput) {
    try {
      return await hospitalRepository.create(input);
    } catch (error) {
      if ((error as { code?: number }).code === DUPLICATE_KEY_ERROR_CODE) {
        throw ApiError.conflict('A hospital with this registration number already exists');
      }
      throw error;
    }
  },

  async list(query: ListHospitalsQuery) {
    return hospitalRepository.findMany(query);
  },

  async getById(id: string) {
    const hospital = await hospitalRepository.findById(id);
    if (!hospital) throw ApiError.notFound('Hospital not found');
    return hospital;
  },

  async update(id: string, input: UpdateHospitalInput) {
    const hospital = await hospitalRepository.update(id, input);
    if (!hospital) throw ApiError.notFound('Hospital not found');
    return hospital;
  },

  async remove(id: string) {
    const hospital = await hospitalRepository.delete(id);
    if (!hospital) throw ApiError.notFound('Hospital not found');
  },
};

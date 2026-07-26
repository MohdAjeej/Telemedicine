import { ApiError } from '../../helpers/ApiError';
import { authService } from '../auth/auth.service';
import { healthOfficerRepository } from './healthOfficer.repository';
import type {
  CreateHealthOfficerInput,
  ListHealthOfficersQuery,
  UpdateHealthOfficerProfileInput,
} from './healthOfficer.types';

export const healthOfficerService = {
  async create(input: CreateHealthOfficerInput) {
    const user = await authService.provisionAccount({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'health_officer',
    });

    try {
      return await healthOfficerRepository.updateByUserId(user.id, {
        hospitalId: input.hospitalId,
        employeeId: input.employeeId,
      });
    } catch (error) {
      await authService.deleteAccount(user.id);
      throw error;
    }
  },

  async list(query: ListHealthOfficersQuery) {
    return healthOfficerRepository.findMany(query);
  },

  async getById(id: string) {
    const officer = await healthOfficerRepository.findById(id);
    if (!officer) throw ApiError.notFound('Health officer not found');
    return officer;
  },

  async getByUserId(userId: string) {
    const officer = await healthOfficerRepository.findByUserId(userId);
    if (!officer) throw ApiError.notFound('Health officer profile not found');
    return officer;
  },

  async updateOwnProfile(userId: string, input: UpdateHealthOfficerProfileInput) {
    return healthOfficerRepository.updateByUserId(userId, input);
  },

  async updateById(id: string, input: UpdateHealthOfficerProfileInput) {
    const officer = await healthOfficerRepository.updateById(id, input);
    if (!officer) throw ApiError.notFound('Health officer not found');
    return officer;
  },

  async remove(id: string) {
    const officer = await healthOfficerRepository.deleteById(id);
    if (!officer) throw ApiError.notFound('Health officer not found');
    await authService.deleteAccount(officer.userId.toString());
  },
};

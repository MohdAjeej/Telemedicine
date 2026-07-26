import { ApiError } from '../../helpers/ApiError';
import { authService } from '../auth/auth.service';
import { patientRepository } from './patient.repository';
import type { CreatePatientInput, ListPatientsQuery, UpdatePatientProfileInput } from './patient.types';

export const patientService = {
  /** Used by Health Officer "Register Patient" front-desk intake as well as Admin. */
  async create(input: CreatePatientInput) {
    const user = await authService.provisionAccount({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'patient',
    });

    try {
      return await patientRepository.updateByUserId(user.id, {
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
      });
    } catch (error) {
      await authService.deleteAccount(user.id);
      throw error;
    }
  },

  async list(query: ListPatientsQuery) {
    return patientRepository.findMany(query);
  },

  async getById(id: string) {
    const patient = await patientRepository.findById(id);
    if (!patient) throw ApiError.notFound('Patient not found');
    return patient;
  },

  async getByUserId(userId: string) {
    const patient = await patientRepository.findByUserId(userId);
    if (!patient) throw ApiError.notFound('Patient profile not found');
    return patient;
  },

  async updateOwnProfile(userId: string, input: UpdatePatientProfileInput) {
    return patientRepository.updateByUserId(userId, input);
  },

  async updateById(id: string, input: UpdatePatientProfileInput) {
    const patient = await patientRepository.updateById(id, input);
    if (!patient) throw ApiError.notFound('Patient not found');
    return patient;
  },

  async remove(id: string) {
    const patient = await patientRepository.deleteById(id);
    if (!patient) throw ApiError.notFound('Patient not found');
    await authService.deleteAccount(patient.userId.toString());
  },
};

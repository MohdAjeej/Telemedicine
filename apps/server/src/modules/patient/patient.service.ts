import { ApiError } from '../../helpers/ApiError';
import { authService } from '../auth/auth.service';
import { patientRepository } from './patient.repository';
import type { CreatePatientInput, ListPatientsQuery, UpdatePatientProfileInput } from './patient.types';

export const patientService = {
  /** Health Officer "Register Patient" front-desk intake — hospital is the officer's own hospital, never chosen by them. */
  async create(input: CreatePatientInput, hospitalId: string) {
    const user = await authService.provisionAccount({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'patient',
      hospitalId,
    });

    try {
      return await patientRepository.create({
        userId: user.id,
        hospitalId,
        age: input.age,
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

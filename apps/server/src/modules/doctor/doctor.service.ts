import { ApiError } from '../../helpers/ApiError';
import { authService } from '../auth/auth.service';
import { doctorRepository } from './doctor.repository';
import type { CreateDoctorInput, ListDoctorsQuery, UpdateDoctorProfileInput } from './doctor.types';

export const doctorService = {
  /** Admin-only. hospitalId is always the creating admin's own hospital, never chosen by the caller. */
  async create(input: CreateDoctorInput, hospitalId: string) {
    const user = await authService.provisionAccount({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'doctor',
      hospitalId,
    });

    try {
      return await doctorRepository.create({
        userId: user.id,
        hospitalId,
        specialization: input.specialization,
        licenseNumber: input.licenseNumber,
      });
    } catch (error) {
      await authService.deleteAccount(user.id);
      throw error;
    }
  },

  async list(query: ListDoctorsQuery) {
    return doctorRepository.findMany(query);
  },

  async getById(id: string) {
    const doctor = await doctorRepository.findById(id);
    if (!doctor) throw ApiError.notFound('Doctor not found');
    return doctor;
  },

  async getByUserId(userId: string) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) throw ApiError.notFound('Doctor profile not found');
    return doctor;
  },

  async updateOwnProfile(userId: string, input: UpdateDoctorProfileInput) {
    return doctorRepository.updateByUserId(userId, input);
  },

  async updateById(id: string, input: UpdateDoctorProfileInput) {
    const doctor = await doctorRepository.updateById(id, input);
    if (!doctor) throw ApiError.notFound('Doctor not found');
    return doctor;
  },

  async remove(id: string) {
    const doctor = await doctorRepository.deleteById(id);
    if (!doctor) throw ApiError.notFound('Doctor not found');
    await authService.deleteAccount(doctor.userId.toString());
  },
};

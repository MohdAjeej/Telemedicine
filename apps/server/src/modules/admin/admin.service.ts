import type { Role } from '@telemedicine/constants';
import { ApiError } from '../../helpers/ApiError';
import { authService } from '../auth/auth.service';
import { adminRepository } from './admin.repository';

export const adminService = {
  async list(hospitalId: string) {
    return adminRepository.findMany(hospitalId);
  },

  /** Each hospital has exactly one admin — never let a caller fetch another hospital's. */
  async getById(id: string, hospitalId: string) {
    const admin = await adminRepository.findById(id);
    if (!admin || admin.hospitalId.toString() !== hospitalId) {
      throw ApiError.notFound('Admin not found');
    }
    return admin;
  },

  async getByUserId(userId: string) {
    const admin = await adminRepository.findByUserId(userId);
    if (!admin) throw ApiError.notFound('Admin profile not found');
    return admin;
  },

  async remove(id: string, hospitalId: string) {
    const admin = await adminRepository.findById(id);
    if (!admin || admin.hospitalId.toString() !== hospitalId) {
      throw ApiError.notFound('Admin not found');
    }
    await adminRepository.deleteById(id);
    await authService.deleteAccount(admin.userId.toString());
  },

  /** Hospital-scoped user directory — every role within the caller's own hospital, used by the "User Management" screen. */
  async listUsers(query: {
    page?: number;
    limit?: number;
    role?: Role;
    status?: 'active' | 'suspended';
    search?: string;
    hospitalId: string;
  }) {
    return authService.listUsers(query);
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended') {
    return authService.setAccountStatus(userId, status);
  },

  /**
   * Tag-editing only — no code currently enforces fine-grained permissions,
   * `authorize('admin')` role checks are the real gate. This lets an admin
   * annotate another admin's intended scope for future use.
   */
  async updatePermissions(userId: string, permissions: string[]) {
    const admin = await adminRepository.updateByUserId(userId, { permissions });
    if (!admin) throw ApiError.notFound('Admin profile not found for this user');
    return admin;
  },
};

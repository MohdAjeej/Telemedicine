import type { Role } from '@telemedicine/constants';
import { ApiError } from '../../helpers/ApiError';
import { authService } from '../auth/auth.service';
import { adminRepository } from './admin.repository';
import type { CreateAdminInput } from './admin.types';

export const adminService = {
  async create(input: CreateAdminInput) {
    const user = await authService.provisionAccount({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      role: 'admin',
    });

    try {
      return await adminRepository.updateByUserId(user.id, {
        permissions: input.permissions,
        department: input.department,
      });
    } catch (error) {
      await authService.deleteAccount(user.id);
      throw error;
    }
  },

  async list() {
    return adminRepository.findMany();
  },

  async getById(id: string) {
    const admin = await adminRepository.findById(id);
    if (!admin) throw ApiError.notFound('Admin not found');
    return admin;
  },

  async getByUserId(userId: string) {
    const admin = await adminRepository.findByUserId(userId);
    if (!admin) throw ApiError.notFound('Admin profile not found');
    return admin;
  },

  async remove(id: string) {
    const admin = await adminRepository.deleteById(id);
    if (!admin) throw ApiError.notFound('Admin not found');
    await authService.deleteAccount(admin.userId.toString());
  },

  /** Platform-wide user directory — every role, used by the "User Management" screen. */
  async listUsers(query: {
    page?: number;
    limit?: number;
    role?: Role;
    status?: 'pending' | 'active' | 'suspended';
    search?: string;
  }) {
    return authService.listUsers(query);
  },

  async updateUserStatus(userId: string, status: 'pending' | 'active' | 'suspended') {
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

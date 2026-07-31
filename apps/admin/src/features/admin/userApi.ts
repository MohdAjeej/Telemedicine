import type { UserRole } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

/**
 * Matches the server's `SanitizedUser` DTO (apps/server/.../auth.types.ts)
 * exactly — NOT the shared `@telemedicine/types` `User` interface, which
 * models a raw Mongo document (`_id`, timestamps) that these endpoints
 * never actually return.
 */
export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: 'pending' | 'active' | 'suspended';
}

export interface UserListResult {
  items: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  status?: 'pending' | 'active' | 'suspended';
  search?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<UserListResult, UserListParams | void>({
      query: (params) => ({ url: '/admin/users', params: params ?? {} }),
      transformResponse: (response: { data: AdminUser[]; meta: Record<string, number> }) => ({
        items: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((user) => ({ type: 'User' as const, id: user.id })),
              { type: 'User' as const, id: 'LIST' },
            ]
          : [{ type: 'User' as const, id: 'LIST' }],
    }),
    updateUserStatus: builder.mutation<
      AdminUser,
      { userId: string; status: 'pending' | 'active' | 'suspended' }
    >({
      query: ({ userId, status }) => ({ url: `/admin/users/${userId}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'User', id: userId }, { type: 'User', id: 'LIST' }],
    }),
    updateAdminPermissions: builder.mutation<unknown, { userId: string; permissions: string[] }>({
      query: ({ userId, permissions }) => ({
        url: `/admin/users/${userId}/permissions`,
        method: 'PATCH',
        body: { permissions },
      }),
      invalidatesTags: (_result, _error, { userId }) => [{ type: 'User', id: userId }],
    }),
  }),
});

export const { useListUsersQuery, useUpdateUserStatusMutation, useUpdateAdminPermissionsMutation } = userApi;

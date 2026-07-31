import type { LoginPayload, User } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; accessToken: string }, LoginPayload>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: { data: { user: User; accessToken: string } }) =>
        response.data,
      invalidatesTags: ['User'],
    }),
    refresh: builder.mutation<{ user: User; accessToken: string }, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      transformResponse: (response: { data: { user: User; accessToken: string } }) => response.data,
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: { data: User }) => response.data,
      providesTags: ['User'],
    }),
    updateMe: builder.mutation<User, { firstName?: string; lastName?: string; phone?: string }>({
      query: (body) => ({ url: '/auth/me', method: 'PATCH', body }),
      transformResponse: (response: { data: User }) => response.data,
      invalidatesTags: ['User'],
    }),
    changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
      query: (body) => ({ url: '/auth/password', method: 'PATCH', body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useLogoutMutation,
  useGetMeQuery,
  useUpdateMeMutation,
  useChangePasswordMutation,
} = authApi;

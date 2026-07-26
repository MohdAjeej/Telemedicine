import type { AuthTokens, LoginPayload, RegisterPayload, User } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<{ user: User; accessToken: string }, LoginPayload>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: { data: { user: User; accessToken: string } }) =>
        response.data,
      invalidatesTags: ['User'],
    }),
    register: builder.mutation<{ user: User }, RegisterPayload>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (response: { data: { user: User } }) => response.data,
    }),
    refresh: builder.mutation<AuthTokens, void>({
      query: () => ({ url: '/auth/refresh', method: 'POST' }),
      transformResponse: (response: { data: AuthTokens }) => response.data,
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: ({ token, password }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: { password },
      }),
    }),
    verifyEmail: builder.mutation<void, { token: string }>({
      query: ({ token }) => ({ url: `/auth/verify-email/${token}`, method: 'POST' }),
    }),
    getMe: builder.query<User, void>({
      query: () => '/auth/me',
      transformResponse: (response: { data: User }) => response.data,
      providesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useGetMeQuery,
} = authApi;

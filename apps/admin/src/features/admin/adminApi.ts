import type { Admin } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAdminProfile: builder.query<Admin, void>({
      query: () => '/admin/me',
      transformResponse: (response: { data: Admin }) => response.data,
    }),
  }),
});

export const { useGetMyAdminProfileQuery } = adminApi;

import type { HealthOfficer, PaginatedResult } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const healthOfficerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listHealthOfficers: builder.query<PaginatedResult<HealthOfficer>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/health-officers', params: params ?? {} }),
      transformResponse: (response: { data: HealthOfficer[]; meta: Record<string, number> }) => ({
        items: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((officer) => ({ type: 'HealthOfficer' as const, id: officer._id })),
              { type: 'HealthOfficer' as const, id: 'LIST' },
            ]
          : [{ type: 'HealthOfficer' as const, id: 'LIST' }],
    }),
    getMyHealthOfficerProfile: builder.query<HealthOfficer, void>({
      query: () => '/health-officers/me',
      transformResponse: (response: { data: HealthOfficer }) => response.data,
      providesTags: [{ type: 'HealthOfficer', id: 'ME' }],
    }),
    updateMyHealthOfficerProfile: builder.mutation<HealthOfficer, Record<string, unknown>>({
      query: (body) => ({ url: '/health-officers/me', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'HealthOfficer', id: 'ME' }],
    }),
    createHealthOfficer: builder.mutation<HealthOfficer, Record<string, unknown>>({
      query: (body) => ({ url: '/health-officers', method: 'POST', body }),
      invalidatesTags: [{ type: 'HealthOfficer', id: 'LIST' }],
    }),
    deleteHealthOfficer: builder.mutation<void, string>({
      query: (id) => ({ url: `/health-officers/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'HealthOfficer', id: 'LIST' }],
    }),
  }),
});

export const {
  useListHealthOfficersQuery,
  useGetMyHealthOfficerProfileQuery,
  useUpdateMyHealthOfficerProfileMutation,
  useCreateHealthOfficerMutation,
  useDeleteHealthOfficerMutation,
} = healthOfficerApi;

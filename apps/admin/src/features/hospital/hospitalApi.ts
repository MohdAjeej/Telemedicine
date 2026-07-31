import type { Hospital, PaginatedResult } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface HospitalListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
}

export const hospitalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listHospitals: builder.query<PaginatedResult<Hospital>, HospitalListParams | void>({
      query: (params) => ({ url: '/hospitals', params: params ?? {} }),
      transformResponse: (response: { data: Hospital[]; meta: Record<string, number> }) => ({
        items: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((hospital) => ({ type: 'Hospital' as const, id: hospital._id })),
              { type: 'Hospital' as const, id: 'LIST' },
            ]
          : [{ type: 'Hospital' as const, id: 'LIST' }],
    }),
    getHospital: builder.query<Hospital, string>({
      query: (id) => `/hospitals/${id}`,
      transformResponse: (response: { data: Hospital }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Hospital', id }],
    }),
    createHospital: builder.mutation<Hospital, Record<string, unknown>>({
      query: (body) => ({ url: '/hospitals', method: 'POST', body }),
      invalidatesTags: [{ type: 'Hospital', id: 'LIST' }],
    }),
    updateHospital: builder.mutation<Hospital, { id: string; body: Record<string, unknown> }>({
      query: ({ id, body }) => ({ url: `/hospitals/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Hospital', id }, { type: 'Hospital', id: 'LIST' }],
    }),
    deleteHospital: builder.mutation<void, string>({
      query: (id) => ({ url: `/hospitals/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Hospital', id: 'LIST' }],
    }),
  }),
});

export const {
  useListHospitalsQuery,
  useGetHospitalQuery,
  useCreateHospitalMutation,
  useUpdateHospitalMutation,
  useDeleteHospitalMutation,
} = hospitalApi;

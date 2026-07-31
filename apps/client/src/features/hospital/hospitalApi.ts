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
  }),
});

export const { useListHospitalsQuery } = hospitalApi;

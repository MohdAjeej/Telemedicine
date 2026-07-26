import type { Doctor, PaginatedResult } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface DoctorListParams {
  page?: number;
  limit?: number;
  hospitalId?: string;
  specialization?: string;
}

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listDoctors: builder.query<PaginatedResult<Doctor>, DoctorListParams | void>({
      query: (params) => ({ url: '/doctors', params: params ?? {} }),
      transformResponse: (response: { data: Doctor[]; meta: Record<string, number> }) => ({
        items: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((doctor) => ({ type: 'Doctor' as const, id: doctor._id })),
              { type: 'Doctor' as const, id: 'LIST' },
            ]
          : [{ type: 'Doctor' as const, id: 'LIST' }],
    }),
    getDoctor: builder.query<Doctor, string>({
      query: (id) => `/doctors/${id}`,
      transformResponse: (response: { data: Doctor }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Doctor', id }],
    }),
    getMyDoctorProfile: builder.query<Doctor, void>({
      query: () => '/doctors/me',
      transformResponse: (response: { data: Doctor }) => response.data,
      providesTags: [{ type: 'Doctor', id: 'ME' }],
    }),
    updateMyDoctorProfile: builder.mutation<Doctor, Record<string, unknown>>({
      query: (body) => ({ url: '/doctors/me', method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Doctor', id: 'ME' }],
    }),
    createDoctor: builder.mutation<Doctor, Record<string, unknown>>({
      query: (body) => ({ url: '/doctors', method: 'POST', body }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),
    deleteDoctor: builder.mutation<void, string>({
      query: (id) => ({ url: `/doctors/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),
  }),
});

export const {
  useListDoctorsQuery,
  useGetDoctorQuery,
  useGetMyDoctorProfileQuery,
  useUpdateMyDoctorProfileMutation,
  useCreateDoctorMutation,
  useDeleteDoctorMutation,
} = doctorApi;

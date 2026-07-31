import type { PaginatedResult, Patient } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface PatientListParams {
  page?: number;
  limit?: number;
  hospitalId?: string;
  assignedDoctorId?: string;
}

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPatients: builder.query<PaginatedResult<Patient>, PatientListParams | void>({
      query: (params) => ({ url: '/patients', params: params ?? {} }),
      transformResponse: (response: { data: Patient[]; meta: Record<string, number> }) => ({
        items: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((patient) => ({ type: 'Patient' as const, id: patient._id })),
              { type: 'Patient' as const, id: 'LIST' },
            ]
          : [{ type: 'Patient' as const, id: 'LIST' }],
    }),
    getPatient: builder.query<Patient, string>({
      query: (id) => `/patients/${id}`,
      transformResponse: (response: { data: Patient }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Patient', id }],
    }),
    deletePatient: builder.mutation<void, string>({
      query: (id) => ({ url: `/patients/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }],
    }),
  }),
});

export const { useListPatientsQuery, useGetPatientQuery, useDeletePatientMutation } = patientApi;

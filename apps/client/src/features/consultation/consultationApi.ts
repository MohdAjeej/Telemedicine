import type { Consultation, PaginatedResult } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface StartConsultationBody {
  appointmentId: string;
  chiefComplaint: string;
}

export interface UpdateConsultationBody {
  diagnosis?: string;
  notes?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
}

export const consultationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listConsultations: builder.query<PaginatedResult<Consultation>, { page?: number; limit?: number } | void>({
      query: (params) => ({ url: '/consultations', params: params ?? {} }),
      transformResponse: (response: { data: Consultation[]; meta?: Record<string, number> }) => ({
        items: response.data,
        total: response.meta?.total ?? response.data.length,
        page: response.meta?.page ?? 1,
        limit: response.meta?.limit ?? response.data.length,
        totalPages: response.meta?.totalPages ?? 1,
      }),
      providesTags: ['Consultation'],
    }),
    getConsultation: builder.query<Consultation, string>({
      query: (id) => `/consultations/${id}`,
      transformResponse: (response: { data: Consultation }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Consultation', id }],
    }),
    startConsultation: builder.mutation<Consultation, StartConsultationBody>({
      query: (body) => ({ url: '/consultations', method: 'POST', body }),
      transformResponse: (response: { data: Consultation }) => response.data,
      invalidatesTags: ['Consultation'],
    }),
    updateConsultation: builder.mutation<Consultation, { id: string; body: UpdateConsultationBody }>({
      query: ({ id, body }) => ({ url: `/consultations/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Consultation', id }, 'Consultation'],
    }),
    completeConsultation: builder.mutation<Consultation, string>({
      query: (id) => ({ url: `/consultations/${id}/complete`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Consultation', id }, 'Consultation'],
    }),
  }),
});

export const {
  useListConsultationsQuery,
  useGetConsultationQuery,
  useStartConsultationMutation,
  useUpdateConsultationMutation,
  useCompleteConsultationMutation,
} = consultationApi;

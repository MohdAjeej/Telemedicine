import type { Appointment, AppointmentStatus, PaginatedResult } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface AppointmentListParams {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export interface BookAppointmentBody {
  doctorId: string;
  hospitalId: string;
  patientId?: string;
  scheduledStart: string;
  type: 'in_person' | 'video';
  reasonForVisit: string;
}

export const appointmentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listAppointments: builder.query<PaginatedResult<Appointment>, AppointmentListParams | void>({
      query: (params) => ({ url: '/appointments', params: params ?? {} }),
      transformResponse: (response: { data: Appointment[]; meta: Record<string, number> }) => ({
        items: response.data,
        total: response.meta.total,
        page: response.meta.page,
        limit: response.meta.limit,
        totalPages: response.meta.totalPages,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((appointment) => ({
                type: 'Appointment' as const,
                id: appointment._id,
              })),
              { type: 'Appointment' as const, id: 'LIST' },
            ]
          : [{ type: 'Appointment' as const, id: 'LIST' }],
    }),
    getAppointment: builder.query<Appointment, string>({
      query: (id) => `/appointments/${id}`,
      transformResponse: (response: { data: Appointment }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Appointment', id }],
    }),
    bookAppointment: builder.mutation<Appointment, BookAppointmentBody>({
      query: (body) => ({ url: '/appointments', method: 'POST', body }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),
    confirmAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({ url: `/appointments/${id}/confirm`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }],
    }),
    completeAppointment: builder.mutation<Appointment, string>({
      query: (id) => ({ url: `/appointments/${id}/complete`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }],
    }),
    markAppointmentNoShow: builder.mutation<Appointment, string>({
      query: (id) => ({ url: `/appointments/${id}/no-show`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }],
    }),
    cancelAppointment: builder.mutation<Appointment, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/appointments/${id}/cancel`, method: 'POST', body: { reason } }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }],
    }),
  }),
});

export const {
  useListAppointmentsQuery,
  useGetAppointmentQuery,
  useBookAppointmentMutation,
  useConfirmAppointmentMutation,
  useCompleteAppointmentMutation,
  useMarkAppointmentNoShowMutation,
  useCancelAppointmentMutation,
} = appointmentApi;

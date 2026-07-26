import type { Prescription } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const prescriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPrescriptions: builder.query<Prescription[], void>({
      query: () => '/prescriptions',
      transformResponse: (response: { data: Prescription[] }) => response.data,
      providesTags: [{ type: 'Prescription', id: 'LIST' }],
    }),
  }),
});

export const { useListPrescriptionsQuery } = prescriptionApi;

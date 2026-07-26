import type { Vital } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const vitalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listVitals: builder.query<Vital[], { patientId?: string } | void>({
      query: (params) => ({ url: '/vitals', params: params ?? {} }),
      transformResponse: (response: { data: Vital[] }) => response.data,
      providesTags: [{ type: 'Vital', id: 'LIST' }],
    }),
  }),
});

export const { useListVitalsQuery } = vitalApi;

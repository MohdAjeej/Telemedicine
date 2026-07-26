import type { MedicalRecord } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const medicalRecordApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMedicalRecords: builder.query<MedicalRecord[], { patientId?: string } | void>({
      query: (params) => ({ url: '/medical-records', params: params ?? {} }),
      transformResponse: (response: { data: MedicalRecord[] }) => response.data,
      providesTags: [{ type: 'MedicalRecord', id: 'LIST' }],
    }),
  }),
});

export const { useListMedicalRecordsQuery } = medicalRecordApi;

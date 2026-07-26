import type { LabReport } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const labReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listLabReports: builder.query<LabReport[], { patientId?: string } | void>({
      query: (params) => ({ url: '/lab-reports', params: params ?? {} }),
      transformResponse: (response: { data: LabReport[] }) => response.data,
      providesTags: [{ type: 'LabReport', id: 'LIST' }],
    }),
  }),
});

export const { useListLabReportsQuery } = labReportApi;

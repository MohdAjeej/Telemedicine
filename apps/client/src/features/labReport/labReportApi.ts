import type { LabReport, LabReportStatus } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface RequestLabReportBody {
  patientId: string;
  testType: string;
}

export interface UpdateLabReportBody {
  id: string;
  status: LabReportStatus;
  resultSummary?: string;
}

export const labReportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listLabReports: builder.query<LabReport[], { patientId?: string }>({
      query: (params) => ({ url: '/lab-reports', params }),
      transformResponse: (response: { data: LabReport[] }) => response.data,
      providesTags: ['LabReport'],
    }),
    getLabReport: builder.query<LabReport, string>({
      query: (id) => `/lab-reports/${id}`,
      transformResponse: (response: { data: LabReport }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'LabReport', id }],
    }),
    requestLabReport: builder.mutation<LabReport, RequestLabReportBody>({
      query: (body) => ({ url: '/lab-reports', method: 'POST', body }),
      transformResponse: (response: { data: LabReport }) => response.data,
      invalidatesTags: ['LabReport'],
    }),
    updateLabReport: builder.mutation<LabReport, UpdateLabReportBody>({
      query: ({ id, ...body }) => ({ url: `/lab-reports/${id}`, method: 'PATCH', body }),
      transformResponse: (response: { data: LabReport }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'LabReport', id }, 'LabReport'],
    }),
    deleteLabReport: builder.mutation<void, string>({
      query: (id) => ({ url: `/lab-reports/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'LabReport', id }, 'LabReport'],
    }),
    uploadLabReportFile: builder.mutation<LabReport, { id: string; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('report', file);
        return { url: `/lab-reports/${id}/report`, method: 'POST', body: formData };
      },
      transformResponse: (response: { data: LabReport }) => response.data,
      invalidatesTags: (_result, _error, { id }) => [{ type: 'LabReport', id }, 'LabReport'],
    }),
    uploadOwnLabReport: builder.mutation<LabReport, { testType: string; file: File }>({
      query: ({ testType, file }) => {
        const formData = new FormData();
        formData.append('testType', testType);
        formData.append('report', file);
        return { url: '/lab-reports/self-upload', method: 'POST', body: formData };
      },
      transformResponse: (response: { data: LabReport }) => response.data,
      invalidatesTags: ['LabReport'],
    }),
  }),
});

export const {
  useListLabReportsQuery,
  useGetLabReportQuery,
  useRequestLabReportMutation,
  useUpdateLabReportMutation,
  useDeleteLabReportMutation,
  useUploadLabReportFileMutation,
  useUploadOwnLabReportMutation,
} = labReportApi;

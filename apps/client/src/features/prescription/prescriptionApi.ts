import type { Prescription, Medication } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface CreatePrescriptionBody {
  consultationId: string;
  medications: Medication[];
  comorbidity?: string;
  complaints?: string;
  allergy?: string;
  otherIllness?: string;
  chiefComplaints?: string;
  symptoms?: string;
  advice?: string;
  provisionalDiagnosis?: string;
  finalDiagnosis?: string;
  clinicalFindings?: string;
  labTests?: string[];
  followUpDate?: string;
}

export interface ListPrescriptionsParams {
  patientId?: string;
  page?: number;
  limit?: number;
}

export const prescriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPrescriptions: builder.query<Prescription[], ListPrescriptionsParams | void>({
      query: (params) => ({ url: '/prescriptions', params: params ?? undefined }),
      transformResponse: (response: { data: Prescription[] }) => response.data,
      providesTags: [{ type: 'Prescription', id: 'LIST' }],
    }),
    getPrescription: builder.query<Prescription, string>({
      query: (id) => `/prescriptions/${id}`,
      transformResponse: (response: { data: Prescription }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Prescription', id }],
    }),
    createPrescription: builder.mutation<Prescription, CreatePrescriptionBody>({
      query: (body) => ({ url: '/prescriptions', method: 'POST', body }),
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }],
    }),
    cancelPrescription: builder.mutation<Prescription, string>({
      query: (id) => ({ url: `/prescriptions/${id}/cancel`, method: 'POST' }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Prescription', id }, { type: 'Prescription', id: 'LIST' }],
    }),
  }),
});

export const {
  useListPrescriptionsQuery,
  useGetPrescriptionQuery,
  useCreatePrescriptionMutation,
  useCancelPrescriptionMutation,
} = prescriptionApi;

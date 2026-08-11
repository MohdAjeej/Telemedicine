import type { Vital } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export interface RecordVitalBody {
  patientId: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bloodSugar?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  hemoglobin?: number;
  comorbidity?: string;
  complaints?: string;
  symptoms?: string;
  notes?: string;
}

export const vitalApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listVitals: builder.query<Vital[], { patientId?: string }>({
      query: (params) => ({ url: '/vitals', params }),
      transformResponse: (response: { data: Vital[] }) => response.data,
      providesTags: ['Vital'],
    }),
    getVital: builder.query<Vital, string>({
      query: (id) => `/vitals/${id}`,
      transformResponse: (response: { data: Vital }) => response.data,
      providesTags: (_result, _error, id) => [{ type: 'Vital', id }],
    }),
    recordVital: builder.mutation<Vital, RecordVitalBody>({
      query: (body) => ({ url: '/vitals', method: 'POST', body }),
      invalidatesTags: ['Vital'],
    }),
  }),
});

export const { useListVitalsQuery, useGetVitalQuery, useRecordVitalMutation } = vitalApi;

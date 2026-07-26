import { baseApi } from '../../store/api/baseApi';

export interface ReportSummary {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  statusBreakdown: Array<{ status: string; count: number }>;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface DoctorUtilization {
  doctorId: string;
  appointmentCount: number;
  firstName: string;
  lastName: string;
}

export interface GenderCount {
  gender: string;
  count: number;
}

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReportSummary: builder.query<ReportSummary, void>({
      query: () => '/reports/summary',
      transformResponse: (response: { data: ReportSummary }) => response.data,
    }),
    getAppointmentsByStatus: builder.query<StatusCount[], void>({
      query: () => '/reports/appointments-by-status',
      transformResponse: (response: { data: StatusCount[] }) => response.data,
    }),
    getAppointmentsOverTime: builder.query<DateCount[], { days?: number } | void>({
      query: (params) => ({ url: '/reports/appointments-over-time', params: params ?? {} }),
      transformResponse: (response: { data: DateCount[] }) => response.data,
    }),
    getDoctorUtilization: builder.query<DoctorUtilization[], { hospitalId?: string } | void>({
      query: (params) => ({ url: '/reports/doctor-utilization', params: params ?? {} }),
      transformResponse: (response: { data: DoctorUtilization[] }) => response.data,
    }),
    getPatientDemographics: builder.query<GenderCount[], void>({
      query: () => '/reports/patient-demographics',
      transformResponse: (response: { data: GenderCount[] }) => response.data,
    }),
  }),
});

export const {
  useGetReportSummaryQuery,
  useGetAppointmentsByStatusQuery,
  useGetAppointmentsOverTimeQuery,
  useGetDoctorUtilizationQuery,
  useGetPatientDemographicsQuery,
} = reportApi;

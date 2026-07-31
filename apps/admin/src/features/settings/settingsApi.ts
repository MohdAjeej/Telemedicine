import type { PlatformSettings } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<PlatformSettings, void>({
      query: () => '/settings',
      transformResponse: (response: { data: PlatformSettings }) => response.data,
      providesTags: ['Settings'],
    }),
    updateSettings: builder.mutation<PlatformSettings, Partial<PlatformSettings>>({
      query: (body) => ({ url: '/settings', method: 'PATCH', body }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;

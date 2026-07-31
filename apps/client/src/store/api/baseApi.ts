import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import type { User } from '@telemedicine/types';
import type { RootState } from '../../app/store';
import { logout, setCredentials } from '../../features/auth/authSlice';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wraps fetchBaseQuery with the standard RTK Query re-auth pattern: on a 401
 * it calls the refresh endpoint once (the refresh token itself travels as an
 * httpOnly cookie, never touched by JS), retries the original request with
 * the new access token, and logs the user out if the refresh also fails.
 */
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    const refreshData = refreshResult.data as
      | { data?: { user?: User; accessToken?: string } }
      | undefined;

    if (refreshData?.data?.accessToken) {
      // Also apply `user` here, not just the token — a silent refresh can come back
      // for a different account than the one currently in state (e.g. the shared,
      // browser-wide refresh cookie was overwritten by a login in another tab), and
      // leaving state.auth.user stale would let role-gated UI keep rendering even
      // though the server will reject the actual role's requests.
      api.dispatch(
        setCredentials({ user: refreshData.data.user, accessToken: refreshData.data.accessToken }),
      );
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Hospital',
    'Doctor',
    'Patient',
    'HealthOfficer',
    'Appointment',
    'Consultation',
    'Prescription',
    'Vital',
    'LabReport',
    'Notification',
    'Conversation',
    'Message',
    'Invoice',
    'Payment',
    'AuditLog',
    'Settings',
  ],
  endpoints: () => ({}),
});

import type { Notification } from '@telemedicine/types';
import { baseApi } from '../../store/api/baseApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listNotifications: builder.query<Notification[], void>({
      query: () => '/notifications',
      transformResponse: (response: { data: Notification[] }) => response.data,
      providesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    unreadNotificationCount: builder.query<number, void>({
      query: () => '/notifications/unread-count',
      transformResponse: (response: { data: { count: number } }) => response.data.count,
      providesTags: [{ type: 'Notification', id: 'COUNT' }],
    }),
    markNotificationRead: builder.mutation<void, string>({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'POST' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'COUNT' }],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({ url: '/notifications/read-all', method: 'POST' }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }, { type: 'Notification', id: 'COUNT' }],
    }),
  }),
});

export const {
  useListNotificationsQuery,
  useUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi;

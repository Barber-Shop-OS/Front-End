// Central de notificações in-app (BE-51): lista paginada com contador de não lidas e marcação de leitura.
import { baseApi } from '@/services/baseApi';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPage {
  items: AppNotification[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  unread_count: number;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listNotifications: build.query<NotificationPage, { page?: number; unread?: boolean } | void>({
      query: (params) => ({ url: '/me/notifications', params: { page: params?.page, unread: params?.unread ? 'true' : undefined } }),
      providesTags: ['Notification'],
    }),
    markNotificationRead: build.mutation<void, number>({
      query: (id) => ({ url: `/me/notifications/${id}/read`, method: 'PATCH' }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({ url: '/me/notifications/read-all', method: 'POST' }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const { useListNotificationsQuery, useMarkNotificationReadMutation, useMarkAllNotificationsReadMutation } = notificationsApi;

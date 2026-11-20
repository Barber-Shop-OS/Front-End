// Conta do próprio usuário: perfil, senha, e-mail, sessões, LGPD (BE-20, 27, 29, 30, 40).
import { baseApi } from '@/services/baseApi';
import type { Session } from '@/types/api';

export const accountApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<unknown, { name?: string; phone?: string | null }>({
      query: (body) => ({ url: '/me', method: 'PATCH', body }),
      invalidatesTags: ['Me'],
    }),
    changePassword: build.mutation<{ message: string; token: string }, { current_password?: string; new_password: string }>({
      query: (body) => ({ url: '/me/password', method: 'POST', body }),
    }),
    requestEmailChange: build.mutation<{ message: string }, { new_email: string; password: string }>({
      query: (body) => ({ url: '/me/email', method: 'POST', body }),
    }),
    listSessions: build.query<Session[], void>({
      query: () => '/me/sessions',
      transformResponse: (response: { items: Session[] }) => response.items,
      providesTags: ['Session'],
    }),
    revokeSession: build.mutation<void, string>({
      query: (id) => ({ url: `/me/sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Session'],
    }),
    exportData: build.query<unknown, void>({
      query: () => '/me/export',
    }),
    deleteAccount: build.mutation<{ message: string }, { password?: string }>({
      query: (body) => ({ url: '/me/delete', method: 'POST', body }),
    }),
  }),
});

export const {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRequestEmailChangeMutation,
  useListSessionsQuery,
  useRevokeSessionMutation,
  useLazyExportDataQuery,
  useDeleteAccountMutation,
} = accountApi;

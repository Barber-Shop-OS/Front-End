// Conta do próprio usuário: perfil, senha, e-mail, sessões, LGPD (BE-20, 27, 29, 30, 40).
import { baseApi } from '@/services/baseApi';
import type { Session, User } from '@/types/api';

export const accountApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<{ message: string; user: Partial<User> }, { name?: string; phone?: string | null }>({
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
    /** Encerra todas as sessões (inclusive esta) — rota de sessão em /api/v1/auth (alias de /api/auth). */
    logoutAllSessions: build.mutation<void, void>({
      query: () => ({ url: '/auth/logout-all', method: 'POST', body: {} }),
      invalidatesTags: ['Session'],
    }),
    exportData: build.query<unknown, void>({
      query: () => '/me/export',
      keepUnusedDataFor: 0,
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
  useLogoutAllSessionsMutation,
  useLazyExportDataQuery,
  useDeleteAccountMutation,
} = accountApi;

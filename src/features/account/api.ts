// Conta do próprio usuário: perfil, senha, e-mail, sessões, LGPD (BE-20, 27, 29, 30, 40).
import { baseApi } from '@/services/baseApi';
import type { Session, User } from '@/types/api';

export interface TwoFactorStatus {
  enabled: boolean;
  enabled_at: string | null;
  /** Obrigatório (admin). */
  required: boolean;
  recovery_codes_left: number;
}

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
    // SEC-27: verificação em duas etapas (TOTP).
    twoFactorStatus: build.query<TwoFactorStatus, void>({
      query: () => '/me/2fa',
      providesTags: ['TwoFactor'],
    }),
    twoFactorSetup: build.mutation<{ secret: string; otpauth_url: string }, void>({
      query: () => ({ url: '/me/2fa/setup', method: 'POST', body: {} }),
    }),
    twoFactorEnable: build.mutation<{ enabled: true; recovery_codes: string[] }, { code: string }>({
      query: (body) => ({ url: '/me/2fa/enable', method: 'POST', body }),
      invalidatesTags: ['TwoFactor', 'Me'],
    }),
    twoFactorDisable: build.mutation<{ enabled: false }, { password: string; code?: string; recovery_code?: string }>({
      query: (body) => ({ url: '/me/2fa/disable', method: 'POST', body }),
      invalidatesTags: ['TwoFactor', 'Me'],
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
  useTwoFactorStatusQuery,
  useTwoFactorSetupMutation,
  useTwoFactorEnableMutation,
  useTwoFactorDisableMutation,
} = accountApi;

// Admin da plataforma (BE-41): métricas de SaaS, barbearias (suspender/reativar/estender trial) e usuários.
import { baseApi } from '@/services/baseApi';
import type { BackendRole, Paginated, Plan, SubscriptionStatus, User } from '@/types/api';

export interface AdminMetrics {
  mrr: string;
  mrr_cents: number;
  subscriptions_by_status: Partial<Record<SubscriptionStatus, number>>;
  paying_by_plan: Partial<Record<Plan['code'], number>>;
  paying: number;
  trials: number;
  new_barbershops_30d: number;
  churned_30d: number;
  churn_rate_30d: number;
}

export interface AdminBarbershop {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'deleted';
  created_at: string;
  owner: { id: number; name: string; email: string; email_verified_at: string | null } | null;
  subscription: {
    plan_code: Plan['code'];
    status: SubscriptionStatus;
    access: string;
    trial_ends_at: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
  } | null;
}

export interface AdminBarbershopFilters {
  q?: string;
  status?: AdminBarbershop['status'];
  subscription_status?: SubscriptionStatus;
  page?: number;
  pageSize?: number;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    adminMetrics: build.query<AdminMetrics, void>({
      query: () => '/admin/metrics',
      providesTags: [{ type: 'Admin', id: 'METRICS' }],
    }),
    adminBarbershops: build.query<Paginated<AdminBarbershop>, AdminBarbershopFilters>({
      query: (params) => ({ url: '/admin/barbershops', params: { ...params } }),
      providesTags: [{ type: 'Admin', id: 'SHOPS' }],
    }),
    adminSuspend: build.mutation<unknown, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/admin/barbershops/${id}/suspend`, method: 'POST', body: reason ? { reason } : {} }),
      invalidatesTags: [{ type: 'Admin', id: 'SHOPS' }],
    }),
    adminReactivate: build.mutation<unknown, number>({
      query: (id) => ({ url: `/admin/barbershops/${id}/reactivate`, method: 'POST', body: {} }),
      invalidatesTags: [{ type: 'Admin', id: 'SHOPS' }],
    }),
    adminExtendTrial: build.mutation<unknown, { id: number; days: number }>({
      query: ({ id, days }) => ({ url: `/admin/barbershops/${id}/extend-trial`, method: 'POST', body: { days } }),
      invalidatesTags: [{ type: 'Admin', id: 'SHOPS' }, { type: 'Admin', id: 'METRICS' }],
    }),
    adminUsers: build.query<Paginated<User>, { q?: string; role?: BackendRole; page?: number; pageSize?: number }>({
      query: (params) => ({ url: '/admin/users', params: { ...params } }),
      providesTags: [{ type: 'Admin', id: 'USERS' }],
    }),
    adminChangeRole: build.mutation<unknown, { id: number; role: BackendRole }>({
      query: ({ id, role }) => ({ url: `/admin/users/${id}/role`, method: 'PATCH', body: { role } }),
      invalidatesTags: [{ type: 'Admin', id: 'USERS' }],
    }),
  }),
});

export const {
  useAdminMetricsQuery,
  useAdminBarbershopsQuery,
  useAdminSuspendMutation,
  useAdminReactivateMutation,
  useAdminExtendTrialMutation,
  useAdminUsersQuery,
  useAdminChangeRoleMutation,
} = adminApi;

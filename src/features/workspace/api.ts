// Dados do painel: barbearia, filiais, horários, assinatura.
import { baseApi } from '@/services/baseApi';
import type { Barbershop, Branch, BranchClosure, OpeningHour, Paginated, Subscription, Plan } from '@/types/api';

export interface BranchInput {
  name: string;
  barbershop_id?: number;
  timezone?: string;
  phone?: string | null;
  whatsapp?: string | null;
  active?: boolean;
  cep?: string;
  street?: string | null;
  number?: number | string;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string;
  state?: string;
}

export const workspaceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBarbershop: build.query<Barbershop, number>({
      query: (id) => `/barbershop/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Barbershop', id }],
    }),
    updateBarbershop: build.mutation<Barbershop, { id: number } & Partial<Barbershop>>({
      query: ({ id, ...body }) => ({ url: `/barbershop/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Barbershop', id }, 'Me'],
    }),
    createBarbershop: build.mutation<{ barbershop: Barbershop } & Barbershop, { name: string; slug?: string }>({
      query: (body) => ({ url: '/barbershop', method: 'POST', body }),
      invalidatesTags: ['Me'],
    }),
    listBranches: build.query<Paginated<Branch>, { barbershop_id: number; include_inactive?: boolean }>({
      query: (params) => ({ url: '/branch', params: { ...params, pageSize: 100 } }),
      providesTags: (result) => [...(result?.items ?? []).map((branch) => ({ type: 'Branch' as const, id: branch.id })), { type: 'Branch', id: 'LIST' }],
    }),
    getBranch: build.query<Branch, number>({
      query: (id) => `/branch/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Branch', id }],
    }),
    createBranch: build.mutation<{ branch: Branch }, BranchInput>({
      query: (body) => ({ url: '/branch', method: 'POST', body }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }, 'Subscription'],
    }),
    updateBranch: build.mutation<{ branch: Branch }, { id: number } & BranchInput>({
      query: ({ id, ...body }) => ({ url: `/branch/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Branch', id }, { type: 'Branch', id: 'LIST' }],
    }),
    deleteBranch: build.mutation<void, number>({
      query: (id) => ({ url: `/branch/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Branch', id: 'LIST' }, 'Subscription'],
    }),
    getOpeningHours: build.query<OpeningHour[], number>({
      query: (id) => `/branch/${id}/opening-hours`,
      transformResponse: (response: OpeningHour[] | { items?: OpeningHour[]; opening_hours?: OpeningHour[] }) =>
        Array.isArray(response) ? response : response.opening_hours ?? response.items ?? [],
      providesTags: (_r, _e, id) => [{ type: 'Schedule', id: `branch-${id}` }],
    }),
    replaceOpeningHours: build.mutation<unknown, { id: number; opening_hours: OpeningHour[] }>({
      query: ({ id, opening_hours }) => ({ url: `/branch/${id}/opening-hours`, method: 'PUT', body: { opening_hours } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Schedule', id: `branch-${id}` }],
    }),
    listClosures: build.query<BranchClosure[], number>({
      query: (id) => `/branch/${id}/closures`,
      transformResponse: (response: BranchClosure[] | { items?: BranchClosure[] }) => (Array.isArray(response) ? response : response.items ?? []),
      providesTags: (_r, _e, id) => [{ type: 'Schedule', id: `closures-${id}` }],
    }),
    createClosure: build.mutation<unknown, { id: number; date: string; all_day: boolean; start_time?: string; end_time?: string; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/branch/${id}/closures`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Schedule', id: `closures-${id}` }],
    }),
    deleteClosure: build.mutation<unknown, { id: number; closureId: number }>({
      query: ({ id, closureId }) => ({ url: `/branch/${id}/closures/${closureId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Schedule', id: `closures-${id}` }],
    }),
    getSubscription: build.query<Subscription, number>({
      query: (barbershopId) => `/barbershop/${barbershopId}/subscription`,
      providesTags: (_r, _e, id) => [{ type: 'Subscription', id }],
    }),
    listPlans: build.query<Plan[], void>({
      query: () => '/plans',
      transformResponse: (response: { items: Plan[] }) => response.items,
      providesTags: ['Plan'],
    }),
  }),
});

export const {
  useGetBarbershopQuery,
  useUpdateBarbershopMutation,
  useCreateBarbershopMutation,
  useListBranchesQuery,
  useGetBranchQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetOpeningHoursQuery,
  useReplaceOpeningHoursMutation,
  useListClosuresQuery,
  useCreateClosureMutation,
  useDeleteClosureMutation,
  useGetSubscriptionQuery,
  useListPlansQuery,
} = workspaceApi;

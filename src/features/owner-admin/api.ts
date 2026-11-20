// Grupo E — gestão do dono: barbeiros, convites, serviços, equipe, uploads e billing.
// (Barbearia, filiais, horários e assinatura vêm de features/workspace/api.ts.)
import { baseApi } from '@/services/baseApi';
import type { ApiError } from '@/services/http';
import type { Barber, Branch, Paginated, Service, Subscription } from '@/types/api';

import type {
  BarberTimeOff,
  BarberWorkingHours,
  CheckoutResponse,
  Invitation,
  ManagedBarber,
  MemberRole,
  PlanCode,
  PresignResponse,
  RawBranchBarber,
  TeamMember,
  UploadKind,
} from './types';
import { mergeBarbers } from './utils';

export interface ServiceInput {
  name: string;
  description: string;
  price: number;
  duration: number;
  active?: boolean;
}

export const ownerAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ---------------------------------------------------------------- barbeiros
    /** Barbeiros (ativos e inativos) de uma ou mais filiais. */
    ownerListBarbers: build.query<ManagedBarber[], number[]>({
      async queryFn(branchIds, _api, _extra, baseQuery) {
        const all: ManagedBarber[] = [];
        for (const branchId of branchIds) {
          const [detail, list] = await Promise.all([
            baseQuery({ url: `/branch/${branchId}` }),
            baseQuery({ url: '/barber', params: { branch_id: branchId, pageSize: 100 } }),
          ]);
          if (detail.error) return { error: detail.error as ApiError };
          if (list.error) return { error: list.error as ApiError };
          const raw = ((detail.data as Branch & { Barbers?: RawBranchBarber[] }).Barbers ?? []) as RawBranchBarber[];
          all.push(...mergeBarbers(raw, (list.data as Paginated<Barber>).items ?? []));
        }
        return { data: all };
      },
      providesTags: (result) => [...(result ?? []).map((b) => ({ type: 'Barber' as const, id: b.id })), { type: 'Barber', id: 'LIST' }],
    }),
    ownerGetBarber: build.query<Barber, number>({
      query: (id) => `/barber/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Barber', id }],
    }),
    ownerUpdateBarber: build.mutation<{ barber: Barber }, { id: number; display_name?: string | null; bio?: string; branch_id?: number; photo_url?: string | null }>({
      query: ({ id, ...body }) => ({ url: `/barber/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Barber', id }, { type: 'Barber', id: 'LIST' }],
    }),
    ownerDeactivateBarber: build.mutation<void, { id: number; force?: boolean }>({
      query: ({ id, force }) => ({ url: `/barber/${id}`, method: 'DELETE', params: force ? { force: 'cancel' } : undefined }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Barber', id }, { type: 'Barber', id: 'LIST' }, 'Subscription', 'Appointment'],
    }),
    /** Vincula conta existente (user_id/e-mail) ou cria convite (202) — também reativa barbeiro inativo. */
    ownerAddBarberToBranch: build.mutation<
      { barber?: Barber; invitation?: Invitation; message?: string },
      { branchId: number; email?: string; user_id?: number; display_name?: string; bio?: string; photo_url?: string | null }
    >({
      query: ({ branchId, ...body }) => ({ url: `/branch/${branchId}/barbers`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { branchId }) => [{ type: 'Barber', id: 'LIST' }, { type: 'Branch', id: `invitations-${branchId}` }, 'Subscription'],
    }),
    ownerSetBarberServices: build.mutation<{ barber: Barber }, { id: number; service_ids: number[] }>({
      query: ({ id, service_ids }) => ({ url: `/barber/${id}/services`, method: 'PUT', body: { service_ids } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Barber', id }, { type: 'Barber', id: 'LIST' }],
    }),
    ownerGetBarberHours: build.query<BarberWorkingHours, number>({
      query: (id) => `/barber/${id}/working-hours`,
      providesTags: (_r, _e, id) => [{ type: 'Schedule', id: `barber-${id}` }],
    }),
    ownerReplaceBarberHours: build.mutation<BarberWorkingHours, { id: number; working_hours: { weekday: number; start_time: string; end_time: string }[] }>({
      query: ({ id, working_hours }) => ({ url: `/barber/${id}/working-hours`, method: 'PUT', body: { working_hours } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Schedule', id: `barber-${id}` }],
    }),
    ownerListTimeOff: build.query<BarberTimeOff[], { id: number; from?: string }>({
      query: ({ id, from }) => ({ url: `/barber/${id}/time-off`, params: { from } }),
      transformResponse: (response: { items?: BarberTimeOff[] } | BarberTimeOff[]) => (Array.isArray(response) ? response : response.items ?? []),
      providesTags: (_r, _e, { id }) => [{ type: 'Schedule', id: `timeoff-${id}` }],
    }),
    ownerCreateTimeOff: build.mutation<unknown, { id: number; start_at: string; end_at: string; reason?: string }>({
      query: ({ id, ...body }) => ({ url: `/barber/${id}/time-off`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Schedule', id: `timeoff-${id}` }],
    }),
    ownerDeleteTimeOff: build.mutation<void, { id: number; timeOffId: number }>({
      query: ({ id, timeOffId }) => ({ url: `/barber/${id}/time-off/${timeOffId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Schedule', id: `timeoff-${id}` }],
    }),

    // ---------------------------------------------------------------- convites
    ownerListInvitations: build.query<Invitation[], number>({
      query: (branchId) => `/branch/${branchId}/invitations`,
      transformResponse: (response: { items?: Invitation[] }) => response.items ?? [],
      providesTags: (_r, _e, branchId) => [{ type: 'Branch', id: `invitations-${branchId}` }],
    }),
    ownerResendInvitation: build.mutation<unknown, { branchId: number; invitationId: number }>({
      query: ({ branchId, invitationId }) => ({ url: `/branch/${branchId}/invitations/${invitationId}/resend`, method: 'POST' }),
      invalidatesTags: (_r, _e, { branchId }) => [{ type: 'Branch', id: `invitations-${branchId}` }],
    }),
    ownerRevokeInvitation: build.mutation<void, { branchId: number; invitationId: number }>({
      query: ({ branchId, invitationId }) => ({ url: `/branch/${branchId}/invitations/${invitationId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { branchId }) => [{ type: 'Branch', id: `invitations-${branchId}` }],
    }),

    // ---------------------------------------------------------------- serviços
    ownerListServices: build.query<Service[], number>({
      query: (barbershopId) => ({ url: '/services', params: { barbershop_id: barbershopId, include_inactive: true, pageSize: 100 } }),
      transformResponse: (response: Paginated<Service> | Service[]) => (Array.isArray(response) ? response : response.items ?? []),
      providesTags: (result) => [...(result ?? []).map((s) => ({ type: 'Service' as const, id: s.id })), { type: 'Service', id: 'LIST' }],
    }),
    ownerCreateService: build.mutation<{ service: Service }, ServiceInput & { barbershop_id: number }>({
      query: (body) => ({ url: '/services', method: 'POST', body }),
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'Barber', id: 'LIST' }],
    }),
    ownerUpdateService: build.mutation<{ service: Service }, { id: number } & Partial<ServiceInput>>({
      query: ({ id, ...body }) => ({ url: `/services/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Service', id }, { type: 'Service', id: 'LIST' }, { type: 'Barber', id: 'LIST' }],
    }),
    ownerDeleteService: build.mutation<void, number>({
      query: (id) => ({ url: `/services/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Service', id: 'LIST' }, { type: 'Barber', id: 'LIST' }],
    }),

    // ---------------------------------------------------------------- equipe (gerentes e atendimento)
    ownerListMembers: build.query<TeamMember[], number>({
      query: (barbershopId) => `/barbershop/${barbershopId}/members`,
      transformResponse: (response: { items?: TeamMember[] }) => response.items ?? [],
      providesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    ownerAddMember: build.mutation<{ member: TeamMember }, { barbershopId: number; email: string; role: MemberRole; branch_ids?: number[] | null; branch_id?: number }>({
      query: ({ barbershopId, ...body }) => ({ url: `/barbershop/${barbershopId}/members`, method: 'POST', body }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    ownerUpdateMember: build.mutation<{ member: TeamMember }, { barbershopId: number; memberId: number; branch_ids?: number[] | null; branch_id?: number }>({
      query: ({ barbershopId, memberId, ...body }) => ({ url: `/barbershop/${barbershopId}/members/${memberId}`, method: 'PATCH', body }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),
    ownerRemoveMember: build.mutation<void, { barbershopId: number; memberId: number }>({
      query: ({ barbershopId, memberId }) => ({ url: `/barbershop/${barbershopId}/members/${memberId}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Member', id: 'LIST' }],
    }),

    // ---------------------------------------------------------------- uploads
    ownerPresignUpload: build.mutation<PresignResponse, { kind: UploadKind; content_type: string; size: number; barbershop_id?: number; barber_id?: number }>({
      query: (body) => ({ url: '/uploads/presign', method: 'POST', body }),
    }),
    ownerConfirmUpload: build.mutation<{ url: string; kind: UploadKind; target_id: number }, { upload_id: number; kind: UploadKind; target_id: number }>({
      query: ({ upload_id }) => ({ url: '/uploads/confirm', method: 'POST', body: { upload_id } }),
      invalidatesTags: (_r, _e, { kind, target_id }) =>
        kind === 'barber_photo'
          ? [{ type: 'Barber', id: target_id }, { type: 'Barber', id: 'LIST' }]
          : [{ type: 'Barbershop', id: target_id }, 'Me'],
    }),

    // ---------------------------------------------------------------- billing
    ownerBillingCheckout: build.mutation<CheckoutResponse, { barbershop_id: number; plan_code: PlanCode; tax_id: string; cellphone?: string }>({
      query: (body) => ({ url: '/billing/checkout', method: 'POST', body }),
      invalidatesTags: ['Subscription'],
    }),
    ownerChangePlan: build.mutation<{ subscription: Subscription; effective_at: string | null }, { barbershop_id: number; plan_code: PlanCode }>({
      query: (body) => ({ url: '/billing/change-plan', method: 'POST', body }),
      invalidatesTags: ['Subscription', 'Me'],
    }),
    ownerCancelSubscription: build.mutation<{ subscription: Subscription }, { barbershop_id: number }>({
      query: (body) => ({ url: '/billing/cancel', method: 'POST', body }),
      invalidatesTags: ['Subscription', 'Me'],
    }),
    ownerResumeSubscription: build.mutation<{ subscription: Subscription }, { barbershop_id: number }>({
      query: (body) => ({ url: '/billing/resume', method: 'POST', body }),
      invalidatesTags: ['Subscription', 'Me'],
    }),
    ownerBillingPortal: build.mutation<{ portal_url: string }, { barbershop_id: number }>({
      query: (body) => ({ url: '/billing/portal', method: 'POST', body }),
    }),
  }),
});

export const {
  useOwnerListBarbersQuery,
  useOwnerGetBarberQuery,
  useOwnerUpdateBarberMutation,
  useOwnerDeactivateBarberMutation,
  useOwnerAddBarberToBranchMutation,
  useOwnerSetBarberServicesMutation,
  useOwnerGetBarberHoursQuery,
  useOwnerReplaceBarberHoursMutation,
  useOwnerListTimeOffQuery,
  useOwnerCreateTimeOffMutation,
  useOwnerDeleteTimeOffMutation,
  useOwnerListInvitationsQuery,
  useOwnerResendInvitationMutation,
  useOwnerRevokeInvitationMutation,
  useOwnerListServicesQuery,
  useOwnerCreateServiceMutation,
  useOwnerUpdateServiceMutation,
  useOwnerDeleteServiceMutation,
  useOwnerListMembersQuery,
  useOwnerAddMemberMutation,
  useOwnerUpdateMemberMutation,
  useOwnerRemoveMemberMutation,
  useOwnerPresignUploadMutation,
  useOwnerConfirmUploadMutation,
  useOwnerBillingCheckoutMutation,
  useOwnerChangePlanMutation,
  useOwnerCancelSubscriptionMutation,
  useOwnerResumeSubscriptionMutation,
  useOwnerBillingPortalMutation,
} = ownerAdminApi;

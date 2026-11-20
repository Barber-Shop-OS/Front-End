// Grupo D — operação do dono/gerente: métricas (BE-24/BE-53), financeiro (FE-16), clientes (BE-23),
// pagamento presencial (BE-07) e listas auxiliares (barbeiros/serviços) usadas na agenda e no balcão.
import { baseApi } from '@/services/baseApi';
import type { ApiError } from '@/services/http';
import type {
  Barber,
  Client,
  ClientDetail,
  DashboardSummary,
  Paginated,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PaymentTotals,
  Service,
} from '@/types/api';

/**
 * Resumo do dashboard. Campos de BE-53 (série semanal, comparação com o período anterior e receita por
 * serviço) são opcionais: a UI calcula o equivalente a partir de `revenue_by_day` quando não vierem.
 */
export interface OwnerSummary extends DashboardSummary {
  revenue_by_service?: { service_id: number; name: string; count?: number; appointments?: number; revenue: string }[];
  previous_period?: { from: string; to: string; revenue?: { total: string }; appointments?: { total: number } } | null;
}

export interface SummaryParams {
  barbershop_id: number;
  branch_id?: number;
  from: string;
  to: string;
}

/** Item de GET /payment: o agendamento vem com o barbeiro e o cliente com conta. */
export interface PaymentRow extends Omit<Payment, 'appointment'> {
  Appointment?: {
    id: number;
    start_at: string;
    end_at: string;
    service_name_snapshot: string;
    price_snapshot: string;
    status: string;
    branch_id: number;
    barber_id: number;
    user_id: number | null;
    Barber?: { id: number; display_name: string | null; user_id: number } | null;
    client?: { id: number; name: string } | null;
  } | null;
}

export interface PaymentListParams {
  barbershop_id: number;
  branch_id?: number;
  status?: PaymentStatus;
  method?: PaymentMethod;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export type PaymentList = Paginated<PaymentRow> & { totals: PaymentTotals };

export interface ClientListParams {
  barbershopId: number;
  search?: string;
  sortBy?: 'name' | 'last_visit' | 'visits' | 'total_spent' | 'created_at';
  page?: number;
  pageSize?: number;
}

export type ClientList = Paginated<Client> & { crm?: boolean };

export interface ClientInput {
  name: string;
  phone: string;
  email?: string | null;
  notes?: string | null;
}

export const ownerOpsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    ownerOpsSummary: build.query<OwnerSummary, SummaryParams>({
      query: (params) => ({ url: '/dashboard/summary', params: { ...params } }),
      providesTags: ['Dashboard'],
    }),
    ownerOpsPayments: build.query<PaymentList, PaymentListParams>({
      query: (params) => ({ url: '/payment', params: { ...params } }),
      providesTags: (result) => [...(result?.items ?? []).map((item) => ({ type: 'Payment' as const, id: item.id })), { type: 'Payment', id: 'LIST' }],
    }),
    ownerOpsAppointmentPayment: build.query<Payment | null, number>({
      // 404 = agendamento ainda sem pagamento registrado.
      async queryFn(appointmentId, _api, _extra, baseQuery) {
        const result = await baseQuery(`/payment/appointment/${appointmentId}`);
        if (result.error) {
          const error = result.error as ApiError;
          return error.status === 404 ? { data: null } : { error };
        }
        return { data: result.data as Payment };
      },
      providesTags: (_r, _e, id) => [{ type: 'Payment', id: `appointment-${id}` }],
    }),
    ownerOpsRegisterPayment: build.mutation<unknown, { appointment_id: number; method: PaymentMethod; amount?: number; status: 'PAID' | 'PENDING' }>({
      query: (body) => ({ url: '/payment', method: 'POST', body }),
      invalidatesTags: (_r, _e, { appointment_id }) => [
        { type: 'Payment', id: 'LIST' },
        { type: 'Payment', id: `appointment-${appointment_id}` },
        { type: 'Appointment', id: appointment_id },
        'Dashboard',
        'Client',
      ],
    }),
    ownerOpsUpdatePaymentStatus: build.mutation<unknown, { id: number; status: 'PAID' | 'FAILED' }>({
      query: ({ id, status }) => ({ url: `/payment/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Payment', id }, { type: 'Payment', id: 'LIST' }, 'Dashboard', 'Client'],
    }),
    ownerOpsClients: build.query<ClientList, ClientListParams>({
      query: ({ barbershopId, ...params }) => ({ url: `/barbershop/${barbershopId}/clients`, params: { ...params } }),
      providesTags: (result) => [...(result?.items ?? []).map((item) => ({ type: 'Client' as const, id: item.id })), { type: 'Client', id: 'LIST' }],
    }),
    ownerOpsClient: build.query<ClientDetail, { barbershopId: number; clientId: number }>({
      query: ({ barbershopId, clientId }) => `/barbershop/${barbershopId}/clients/${clientId}`,
      providesTags: (_r, _e, { clientId }) => [{ type: 'Client', id: clientId }],
    }),
    ownerOpsCreateClient: build.mutation<Client, { barbershopId: number } & ClientInput>({
      query: ({ barbershopId, ...body }) => ({ url: `/barbershop/${barbershopId}/clients`, method: 'POST', body }),
      invalidatesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    ownerOpsUpdateClient: build.mutation<Client, { barbershopId: number; clientId: number } & Partial<ClientInput>>({
      query: ({ barbershopId, clientId, ...body }) => ({ url: `/barbershop/${barbershopId}/clients/${clientId}`, method: 'PATCH', body }),
      invalidatesTags: (_r, _e, { clientId }) => [{ type: 'Client', id: clientId }, { type: 'Client', id: 'LIST' }],
    }),
    ownerOpsBarbers: build.query<Barber[], { branch_id: number; service_id?: number }>({
      query: (params) => ({ url: '/barber', params: { ...params, pageSize: 100, sortBy: 'display_name', sortDir: 'ASC' } }),
      transformResponse: (response: Paginated<Barber>) => response.items,
      providesTags: (result) => [...(result ?? []).map((item) => ({ type: 'Barber' as const, id: item.id })), { type: 'Barber', id: 'LIST' }],
    }),
    ownerOpsServices: build.query<Service[], number>({
      query: (barbershopId) => ({ url: '/services', params: { barbershop_id: barbershopId, pageSize: 100, sortBy: 'name', sortDir: 'ASC' } }),
      transformResponse: (response: Paginated<Service>) => response.items,
      providesTags: (result) => [...(result ?? []).map((item) => ({ type: 'Service' as const, id: item.id })), { type: 'Service', id: 'LIST' }],
    }),
  }),
});

export const {
  useOwnerOpsSummaryQuery,
  useOwnerOpsPaymentsQuery,
  useOwnerOpsAppointmentPaymentQuery,
  useOwnerOpsRegisterPaymentMutation,
  useOwnerOpsUpdatePaymentStatusMutation,
  useOwnerOpsClientsQuery,
  useOwnerOpsClientQuery,
  useOwnerOpsCreateClientMutation,
  useOwnerOpsUpdateClientMutation,
  useOwnerOpsBarbersQuery,
  useOwnerOpsServicesQuery,
} = ownerOpsApi;

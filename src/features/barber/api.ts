// Área do barbeiro: métricas próprias (BE-24/BE-53), clientes atendidos, jornada, bloqueios e pagamento presencial.
import { baseApi } from '@/services/baseApi';
import type { Client, Paginated, Payment, PaymentMethod } from '@/types/api';

import type { BarberClient, BarberClientFilters, BarberDashboard, BarberPaymentsPage, BarberTimeOff, BarberWorkingHours } from './types';

export const barberApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /** Métricas do barbeiro logado (todos os perfis dele). Período em datas locais, inclusive. */
    getBarberDashboard: build.query<BarberDashboard, { from?: string; to?: string }>({
      query: (params) => ({ url: '/dashboard/barber', params: { ...params } }),
      providesTags: ['Dashboard'],
    }),
    /** BE-53: clientes atendidos pelo barbeiro (concluídos). */
    listBarberOwnClients: build.query<Paginated<BarberClient>, BarberClientFilters>({
      query: (params) => ({ url: '/dashboard/barber/clients', params: { ...params } }),
      providesTags: [{ type: 'Client', id: 'BARBER' }],
    }),
    /** Fallback enquanto o BE-53 não estiver no ar: clientes da barbearia (barbeiro ativo tem leitura). */
    listBarberShopClients: build.query<Paginated<Client>, { barbershopId: number; search?: string; sortBy?: string; page?: number; pageSize?: number }>({
      query: ({ barbershopId, ...params }) => ({ url: `/barbershop/${barbershopId}/clients`, params: { ...params } }),
      providesTags: [{ type: 'Client', id: 'LIST' }],
    }),
    getBarberWorkingHours: build.query<BarberWorkingHours, number>({
      query: (id) => `/barber/${id}/working-hours`,
      providesTags: (_r, _e, id) => [{ type: 'Schedule', id: `barber-${id}` }],
    }),
    listBarberTimeOff: build.query<BarberTimeOff[], { barberId: number; from?: string; to?: string }>({
      query: ({ barberId, ...params }) => ({ url: `/barber/${barberId}/time-off`, params: { ...params } }),
      transformResponse: (response: { items?: BarberTimeOff[] } | BarberTimeOff[]) => (Array.isArray(response) ? response : response.items ?? []),
      providesTags: (_r, _e, { barberId }) => [{ type: 'Schedule', id: `time-off-${barberId}` }],
    }),
    createBarberTimeOff: build.mutation<{ time_off: BarberTimeOff }, { barberId: number; start_at: string; end_at: string; reason?: string | null }>({
      query: ({ barberId, ...body }) => ({ url: `/barber/${barberId}/time-off`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { barberId }) => [{ type: 'Schedule', id: `time-off-${barberId}` }, 'Dashboard'],
    }),
    deleteBarberTimeOff: build.mutation<void, { barberId: number; timeOffId: number }>({
      query: ({ barberId, timeOffId }) => ({ url: `/barber/${barberId}/time-off/${timeOffId}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, { barberId }) => [{ type: 'Schedule', id: `time-off-${barberId}` }, 'Dashboard'],
    }),
    /** Pagamentos dos próprios atendimentos (mais recentes primeiro). */
    listBarberPayments: build.query<BarberPaymentsPage, { page?: number; pageSize?: number; status?: string }>({
      query: (params) => ({ url: '/payment', params: { ...params } }),
      providesTags: [{ type: 'Payment', id: 'LIST' }],
    }),
    /** Pagamento do agendamento; null quando ainda não há registro (404). */
    getBarberAppointmentPayment: build.query<Payment | null, number>({
      queryFn: async (appointmentId, _api, _extra, baseQuery) => {
        const result = await baseQuery(`/payment/appointment/${appointmentId}`);
        if (result.error) {
          const status = (result.error as { status?: number }).status;
          return status === 404 ? { data: null } : { error: result.error };
        }
        return { data: result.data as Payment };
      },
      providesTags: (_r, _e, id) => [{ type: 'Payment', id: `appointment-${id}` }],
    }),
    createBarberPayment: build.mutation<{ payment: Payment }, { appointment_id: number; method: PaymentMethod; status: 'PAID' | 'PENDING'; amount?: number }>({
      query: (body) => ({ url: '/payment', method: 'POST', body }),
      invalidatesTags: (_r, _e, { appointment_id }) => [
        { type: 'Payment', id: `appointment-${appointment_id}` },
        { type: 'Payment', id: 'LIST' },
        'Dashboard',
        'Client',
      ],
    }),
    updateBarberPaymentStatus: build.mutation<unknown, { id: number; appointmentId: number; status: 'PAID' | 'FAILED' }>({
      query: ({ id, status }) => ({ url: `/payment/${id}/status`, method: 'PUT', body: { status } }),
      invalidatesTags: (_r, _e, { appointmentId }) => [
        { type: 'Payment', id: `appointment-${appointmentId}` },
        { type: 'Payment', id: 'LIST' },
        'Dashboard',
        'Client',
      ],
    }),
  }),
});

export const {
  useGetBarberDashboardQuery,
  useListBarberOwnClientsQuery,
  useListBarberShopClientsQuery,
  useGetBarberWorkingHoursQuery,
  useListBarberTimeOffQuery,
  useCreateBarberTimeOffMutation,
  useDeleteBarberTimeOffMutation,
  useListBarberPaymentsQuery,
  useGetBarberAppointmentPaymentQuery,
  useCreateBarberPaymentMutation,
  useUpdateBarberPaymentStatusMutation,
} = barberApi;

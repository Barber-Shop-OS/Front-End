// Agendamentos (BE-12..15): lista, detalhe, criação com Idempotency-Key e ciclo de vida.
import { baseApi } from '@/services/baseApi';
import type { Appointment, AppointmentStatus, Paginated } from '@/types/api';

export interface AppointmentFilters {
  branch_id?: number;
  barber_id?: number;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'start_at' | 'status' | 'created_at';
  sortDir?: 'ASC' | 'DESC';
}

export interface CreateAppointmentInput {
  branch_id: number;
  service_id: number;
  barber_id?: number;
  start_at: string;
  notes?: string;
  source?: 'web' | 'balcao';
  client_id?: number;
  user_id?: number;
  idempotencyKey: string;
}

const listTags = (result?: Paginated<Appointment>) => [
  ...(result?.items ?? []).map((item) => ({ type: 'Appointment' as const, id: item.id })),
  { type: 'Appointment' as const, id: 'LIST' },
];

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    listAppointments: build.query<Paginated<Appointment>, AppointmentFilters>({
      query: (params) => ({ url: '/appointment', params: { ...params } }),
      providesTags: listTags,
    }),
    myAppointments: build.query<Paginated<Appointment>, { scope: 'upcoming' | 'past'; page?: number; pageSize?: number }>({
      query: (params) => ({ url: '/me/appointments', params: { ...params } }),
      providesTags: listTags,
    }),
    getAppointment: build.query<Appointment, number>({
      query: (id) => `/appointment/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Appointment', id }],
    }),
    createAppointment: build.mutation<{ appointment: Appointment }, CreateAppointmentInput>({
      query: ({ idempotencyKey, ...body }) => ({ url: '/appointment', method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey } }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }, 'Dashboard', 'Client'],
    }),
    cancelAppointment: build.mutation<Appointment, { id: number; reason?: string }>({
      query: ({ id, reason }) => ({ url: `/appointment/${id}/cancel`, method: 'POST', body: reason ? { reason } : {} }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }, 'Dashboard'],
    }),
    rescheduleAppointment: build.mutation<Appointment, { id: number; start_at: string; barber_id?: number }>({
      query: ({ id, ...body }) => ({ url: `/appointment/${id}/reschedule`, method: 'POST', body }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }],
    }),
    completeAppointment: build.mutation<Appointment, number>({
      query: (id) => ({ url: `/appointment/${id}/complete`, method: 'POST', body: {} }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }, 'Dashboard', 'Client'],
    }),
    noShowAppointment: build.mutation<Appointment, number>({
      query: (id) => ({ url: `/appointment/${id}/no-show`, method: 'POST', body: {} }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }, 'Dashboard', 'Client'],
    }),
  }),
});

export const {
  useListAppointmentsQuery,
  useMyAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useCompleteAppointmentMutation,
  useNoShowAppointmentMutation,
} = appointmentsApi;

/** Chave de idempotência por tentativa de criação (BE-14). */
export const newIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

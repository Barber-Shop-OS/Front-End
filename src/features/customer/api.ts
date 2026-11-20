// Área do cliente: agendamentos tipados com o formato real da API e barbearia pública por id.
// Usa as mesmas tags de cache de `features/appointments` — cancelar/reagendar (mutations de lá)
// invalida estas listas e detalhes automaticamente.
import { baseApi } from '@/services/baseApi';
import type { Paginated } from '@/types/api';

import type { CustomerAppointment, CustomerBarbershop } from './types';

export const customerApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    customerAppointments: build.query<Paginated<CustomerAppointment>, { scope: 'upcoming' | 'past'; page?: number; pageSize?: number }>({
      query: (params) => ({ url: '/me/appointments', params: { ...params } }),
      providesTags: (result) => [
        ...(result?.items ?? []).map((item) => ({ type: 'Appointment' as const, id: item.id })),
        { type: 'Appointment' as const, id: 'LIST' },
      ],
    }),
    customerAppointment: build.query<CustomerAppointment, number>({
      query: (id) => `/appointment/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Appointment', id }],
    }),
    customerBarbershop: build.query<CustomerBarbershop, number>({
      query: (id) => `/barbershop/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Barbershop', id }],
    }),
  }),
});

export const { useCustomerAppointmentsQuery, useCustomerAppointmentQuery, useCustomerBarbershopQuery } = customerApi;

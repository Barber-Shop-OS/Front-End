// Atendimento (BE-50): resumo do dia da filial para o balcão.
import { baseApi } from '@/services/baseApi';
import type { AppointmentAction, AppointmentStatus } from '@/types/api';

export interface FrontDeskUpcoming {
  id: number;
  start_at: string;
  end_at: string;
  time: string;
  status: AppointmentStatus;
  client: { id: number; user_id: number | null; name: string; phone: string | null } | null;
  services: { id: number; name: string; duration_min: number; price: string }[];
  barber: { id: number; name: string } | null;
  allowed_actions: AppointmentAction[];
}

export interface FrontDeskSummary {
  date: string;
  timezone: string;
  branch: { id: number; name: string };
  total_today: number;
  attended: number;
  pending: number;
  cancelled: number;
  no_show: number;
  upcoming: FrontDeskUpcoming[];
}

export const frontDeskApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    frontDeskSummary: build.query<FrontDeskSummary, { branch_id: number; date?: string }>({
      query: (params) => ({ url: '/dashboard/front-desk', params: { ...params } }),
      providesTags: ['Dashboard', { type: 'Appointment', id: 'LIST' }],
    }),
  }),
});

export const { useFrontDeskSummaryQuery } = frontDeskApi;

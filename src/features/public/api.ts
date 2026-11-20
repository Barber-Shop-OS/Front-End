// Dados públicos: busca de filiais, perfil por slug, disponibilidade e configuração (BE-13, 18, 25, 48).
import { baseApi } from '@/services/baseApi';
import type { AppConfig, Paginated, PublicBarbershop, SearchBranch, Slot } from '@/types/api';

export interface SearchParams {
  q?: string;
  city?: string;
  /** Restringe a quem oferece um serviço com esse nome (BE-25). */
  service?: string;
  lat?: number;
  lng?: number;
  page?: number;
  pageSize?: number;
}

export const publicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchBranches: build.query<Paginated<SearchBranch>, SearchParams>({
      query: (params) => ({ url: '/search/branches', params: { ...params } }),
    }),
    getPublicBarbershop: build.query<PublicBarbershop, string>({
      query: (slug) => `/barbershop/slug/${encodeURIComponent(slug)}`,
      providesTags: (_r, _e, slug) => [{ type: 'Barbershop', id: `slug-${slug}` }],
    }),
    getAvailability: build.query<Slot[], { branch_id: number; service_id: number; date: string; barber_id?: number }>({
      query: (params) => ({ url: '/availability', params: { ...params } }),
      keepUnusedDataFor: 15,
    }),
    getAppConfig: build.query<AppConfig, void>({
      query: () => '/app-config',
    }),
  }),
});

export const { useSearchBranchesQuery, useGetPublicBarbershopQuery, useGetAvailabilityQuery, useGetAppConfigQuery } = publicApi;

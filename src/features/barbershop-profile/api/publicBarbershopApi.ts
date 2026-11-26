import { useEffect, useState } from 'react';

import http, { type ApiError } from '@/services/http';

/**
 * Perfil público da barbearia — GET /api/barbershop/slug/:slug (BE-18).
 * Tipos espelham o DTO público do backend (sem e-mails nem dados do dono).
 */
export interface PublicAddress {
  street: string | null;
  number: number | null;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  cep: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PublicOpeningHour {
  /** 0 = domingo … 6 = sábado */
  weekday: number;
  opens_at: string;
  closes_at: string;
}

export interface PublicBranch {
  id: number;
  name: string;
  timezone: string;
  phone: string | null;
  whatsapp: string | null;
  address: PublicAddress | null;
  opening_hours: PublicOpeningHour[];
  open_now: boolean;
}

export interface PublicService {
  id: number;
  name: string;
  description: string | null;
  /** DECIMAL vindo como string ("29.90") */
  price: string | number;
  duration: number;
}

export interface PublicBarber {
  id: number;
  display_name: string | null;
  bio: string | null;
  photo_url: string | null;
  branch_id: number;
  services: { id: number; name: string }[];
}

export interface PublicBarbershop {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
  branches: PublicBranch[];
  services: PublicService[];
  barbers: PublicBarber[];
}

export const getPublicBarbershop = async (slug: string): Promise<PublicBarbershop> => {
  const response = await http.get<PublicBarbershop>(
    `/barbershop/slug/${encodeURIComponent(slug)}`
  );
  return response.data;
};

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
}

/** Carrega o perfil público pelo slug da rota. */
export const usePublicBarbershop = (slug: string | undefined): AsyncState<PublicBarbershop> => {
  const [state, setState] = useState<AsyncState<PublicBarbershop>>({
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!slug) {
      setState({ data: null, loading: false, error: { status: 404, message: 'Barbearia não encontrada' } });
      return;
    }

    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    getPublicBarbershop(slug)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error: ApiError) => {
        if (!cancelled) setState({ data: null, loading: false, error });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
};

/* ---------- formatação ---------- */

export const toNumberPrice = (price: string | number): number => Number(price) || 0;

export const formatAddressLine = (address: PublicAddress | null): string => {
  if (!address) return 'Endereço não informado';
  const street = [address.street, address.number].filter(Boolean).join(', ');
  return street || address.neighborhood || address.city;
};

export const formatCityState = (address: PublicAddress | null): string =>
  address ? `${address.city} - ${address.state}` : '';

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

/** Agrupa os horários por dia da semana (segunda → domingo). */
export const formatOpeningHours = (
  hours: PublicOpeningHour[]
): { label: string; hours: string; closed?: boolean }[] => {
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((weekday) => {
    const rows = hours
      .filter((row) => row.weekday === weekday)
      .sort((a, b) => a.opens_at.localeCompare(b.opens_at));
    if (rows.length === 0) return { label: WEEKDAYS[weekday], hours: 'Fechado', closed: true };
    return {
      label: WEEKDAYS[weekday],
      hours: rows.map((row) => `${row.opens_at.slice(0, 5)} - ${row.closes_at.slice(0, 5)}`).join(' · ')
    };
  });
};

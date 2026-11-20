// Perfil de barbeiro ativo (user.barber_profiles). Com mais de um perfil (filiais diferentes), o barbeiro escolhe
// num seletor local; a escolha fica lembrada neste navegador.
import { useCallback, useEffect, useState } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { useAuth } from '@/features/auth/hooks';
import { useGetBranchQuery } from '@/features/workspace/api';
import type { MeBarberProfile } from '@/types/api';
import { DEFAULT_TIMEZONE } from '@/utils/date';

const STORAGE_KEY = 'barberos.barber.profileId';
const EVENT = 'barberos:barber-profile';

const readStored = (): number | null => {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value ? Number(value) : null;
  } catch {
    return null;
  }
};

export interface BarberProfileContext {
  profiles: MeBarberProfile[];
  profile: MeBarberProfile | null;
  setProfileId: (id: number) => void;
  timezone: string;
  barbershopId: number | null;
}

export const useBarberProfile = (): BarberProfileContext => {
  const { user } = useAuth();
  const profiles = user?.barber_profiles ?? [];
  const [selectedId, setSelectedId] = useState<number | null>(readStored);

  // Mantém páginas abertas em sincronia quando o seletor muda.
  useEffect(() => {
    const onChange = () => setSelectedId(readStored());
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
  }, []);

  const setProfileId = useCallback((id: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
      // sem storage: vale só para esta página
    }
    setSelectedId(id);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const profile = profiles.find((item) => item.id === selectedId) ?? profiles[0] ?? null;
  const { data: branch } = useGetBranchQuery(profile ? profile.branch_id : skipToken);

  return {
    profiles,
    profile,
    setProfileId,
    timezone: branch?.timezone || DEFAULT_TIMEZONE,
    barbershopId: profile?.branch?.barbershop_id ?? branch?.barbershop_id ?? null,
  };
};

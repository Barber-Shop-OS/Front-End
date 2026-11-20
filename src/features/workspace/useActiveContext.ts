// FE-09: barbearia/filial ativas. Valida os ids guardados contra o /me (barbearias do dono ou
// gerenciadas) e restringe as filiais às que o gerente administra (BE-47).
import { useEffect, useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { useAuth } from '@/features/auth/hooks';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import type { Branch, MeBarbershop } from '@/types/api';

import { setActiveBarbershop, setActiveBranch } from './activeContextSlice';
import { useListBranchesQuery } from './api';

export interface ActiveContext {
  barbershops: MeBarbershop[];
  barbershop: MeBarbershop | null;
  isOwner: boolean;
  branches: Branch[];
  branch: Branch | null;
  branchesLoading: boolean;
  setBarbershop: (id: number) => void;
  setBranch: (id: number | null) => void;
}

export const useActiveContext = (): ActiveContext => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const stored = useAppSelector((state) => state.activeContext);
  const barbershops = useMemo(() => user?.barbershops ?? [], [user]);

  const barbershop = barbershops.find((shop) => shop.id === stored.barbershopId) ?? barbershops[0] ?? null;
  const { data, isLoading } = useListBranchesQuery(barbershop ? { barbershop_id: barbershop.id, include_inactive: true } : skipToken);

  const branches = useMemo(() => {
    const all = data?.items ?? [];
    return barbershop?.branch_ids ? all.filter((branch) => barbershop.branch_ids?.includes(branch.id)) : all;
  }, [data, barbershop]);
  const branch = branches.find((item) => item.id === stored.branchId) ?? branches.find((item) => item.active) ?? branches[0] ?? null;

  useEffect(() => {
    if (barbershop && barbershop.id !== stored.barbershopId) dispatch(setActiveBarbershop(barbershop.id));
  }, [barbershop, stored.barbershopId, dispatch]);

  return {
    barbershops,
    barbershop,
    isOwner: barbershop?.membership === 'owner' || user?.role === 'admin',
    branches,
    branch,
    branchesLoading: isLoading,
    setBarbershop: (id) => dispatch(setActiveBarbershop(id)),
    setBranch: (id) => dispatch(setActiveBranch(id)),
  };
};

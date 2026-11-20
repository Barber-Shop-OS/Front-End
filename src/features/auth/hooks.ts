// FE-01: hooks de sessão — usuário atual, papel/área inicial e logout único.
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import type { Me } from '@/types/api';

import { logout } from './authSlice';

export type Area = 'owner' | 'barber' | 'customer' | 'admin';

/** Áreas a que o usuário tem acesso (dono/gerente, barbeiro, cliente, admin). */
export const areasOf = (user: Me | null): Area[] => {
  if (!user) return [];
  const areas: Area[] = [];
  if (user.role === 'admin') areas.push('admin');
  if (user.role === 'owner' || user.barbershops.length > 0) areas.push('owner');
  if (user.role === 'barbeiro' || user.barber_profiles.length > 0) areas.push('barber');
  areas.push('customer');
  return areas;
};

/** Página inicial por perfil (FE-01). */
export const homePathFor = (user: Me | null): string => {
  const areas = areasOf(user);
  if (areas.includes('admin')) return '/admin';
  if (areas.includes('owner')) return '/dashboard';
  if (areas.includes('barber')) return '/barbeiro';
  return '/cliente';
};

export const useAuth = () => {
  const status = useAppSelector((state) => state.auth.status);
  const user = useAppSelector((state) => state.auth.user);
  return { status, user, isAuthenticated: status === 'authenticated', areas: areasOf(user) };
};

/** Logout único: revoga a sessão no servidor, limpa cache e vai para /login. */
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return useCallback(async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  }, [dispatch, navigate]);
};

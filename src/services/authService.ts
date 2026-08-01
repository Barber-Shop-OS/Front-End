import http from '@/services/http';
import type { AuthUser, UserRole } from '@/types';

/**
 * Tipos do backend (roles em português). O frontend usa roles normalizadas.
 */
type BackendUser = {
  id: number;
  name: string;
  email: string;
  role: 'cliente' | 'barbeiro' | 'owner' | 'admin' | string;
};

interface RegisterResponse {
  message: string;
  user: BackendUser;
}

interface LoginResponse {
  message: string;
  token: string;
  user: BackendUser;
}

/** Mapeia as roles do backend para as roles do frontend. */
const mapRole = (role: string): UserRole | undefined => {
  switch (role) {
    case 'cliente':
      return 'customer';
    case 'barbeiro':
      return 'barber';
    case 'owner':
    case 'admin':
      return 'owner';
    default:
      return undefined;
  }
};

/** Converte o usuário do backend para o formato do frontend (id string). */
const mapUser = (user: BackendUser): AuthUser => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: mapRole(user.role)
});

/**
 * Cadastra um novo usuário.
 * O backend não retorna token no register; apenas o usuário criado.
 */
export const register = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> => {
  const response = await http.post<RegisterResponse>('/auth/register', payload);
  return mapUser(response.data.user);
};

/**
 * Autentica o usuário e retorna o token + dados do usuário.
 */
export const login = async (payload: {
  email: string;
  password: string;
}): Promise<{ token: string; user: AuthUser }> => {
  const response = await http.post<LoginResponse>('/auth/login', payload);
  return {
    token: response.data.token,
    user: mapUser(response.data.user)
  };
};

/**
 * Busca os dados do usuário autenticado (sessão via token).
 */
export const getMe = async (): Promise<AuthUser> => {
  const response = await http.get<BackendUser>('/auth/me');
  return mapUser(response.data);
};


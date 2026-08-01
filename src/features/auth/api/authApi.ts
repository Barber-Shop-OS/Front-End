import { USE_MOCK_AUTH } from '@/config/api';
import { getMe, login, register } from '@/services/authService';
import type {
  GoogleLoginRequestPayload,
  GoogleSignupRequestPayload,
  LoginRequestPayload,
  LoginSuccessPayload,
  SignupRequestPayload
} from '@/types';

/**
 * Camada de API da feature de autenticação.
 *
 * Usa `authService` (que por sua vez usa o cliente HTTP centralizado em
 * `src/services/http.ts`). Quando `VITE_USE_MOCK_AUTH=true`, devolve dados
 * simulados no mesmo formato normalizado para não quebrar o fluxo.
 */

const createMockUser = (
  payload: Pick<SignupRequestPayload, 'name' | 'email'>
): LoginSuccessPayload => ({
  user: {
    id: 'u-' + Date.now(),
    email: payload.email,
    name: payload.name
  },
  tokens: {
    accessToken: 'mock-access-token'
  }
});

const mockLogin = async (
  payload: LoginRequestPayload
): Promise<LoginSuccessPayload> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 700);
  });

  if (!payload.email || payload.password.length < 4) {
    throw new Error('Credenciais invalidas.');
  }

  return createMockUser({ name: 'Usuario SaaS', email: payload.email });
};

export const authApi = {
  login: async (payload: LoginRequestPayload): Promise<LoginSuccessPayload> => {
    if (USE_MOCK_AUTH) {
      return mockLogin(payload);
    }

    const result = await login(payload);
    return {
      user: result.user,
      tokens: { accessToken: result.token }
    };
  },
  loginWithGoogle: async (
    _payload: GoogleLoginRequestPayload
  ): Promise<LoginSuccessPayload> => {
    if (USE_MOCK_AUTH) {
      return createMockUser({
        name: 'Google User',
        email: 'google.user@saas.com'
      });
    }

    // O backend atual não possui endpoint de Google OAuth.
    // Mantido para não quebrar o fluxo da UI até o backend disponibilizar.
    throw new Error('Login com Google indisponível no backend atual.');
  },
  signup: async (payload: SignupRequestPayload): Promise<LoginSuccessPayload> => {
    if (USE_MOCK_AUTH) {
      await new Promise((resolve) => {
        setTimeout(resolve, 700);
      });

      if (!payload.name || !payload.email || payload.password.length < 4) {
        throw new Error('Dados invalidos para cadastro.');
      }

      return createMockUser({ name: payload.name, email: payload.email });
    }

    // O backend não retorna token no register. Após cadastrar, faz login
    // automático para iniciar a sessão.
    const user = await register(payload);
    const result = await login({ email: payload.email, password: payload.password });

    return {
      user: { ...user, role: result.user.role },
      tokens: { accessToken: result.token }
    };
  },
  signupWithGoogle: async (
    _payload: GoogleSignupRequestPayload
  ): Promise<LoginSuccessPayload> => {
    if (USE_MOCK_AUTH) {
      return createMockUser({
        name: 'Google User',
        email: 'google.signup@saas.com'
      });
    }

    throw new Error('Cadastro com Google indisponível no backend atual.');
  },
  getMe: async (): Promise<LoginSuccessPayload> => {
    if (USE_MOCK_AUTH) {
      return createMockUser({ name: 'Usuario SaaS', email: 'mock@saas.com' });
    }

    const user = await getMe();
    return {
      user,
      tokens: { accessToken: '' }
    };
  }
};

export default authApi;


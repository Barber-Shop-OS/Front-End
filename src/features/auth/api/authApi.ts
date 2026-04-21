import type { LoginRequestPayload, LoginSuccessPayload } from '@/types';

// Mock de login para demonstrar fluxo Action -> Saga -> API -> Reducer.
export const authApi = {
  login: async (payload: LoginRequestPayload): Promise<LoginSuccessPayload> => {
    await new Promise((resolve) => {
      setTimeout(resolve, 700);
    });

    if (!payload.email || payload.password.length < 4) {
      throw new Error('Credenciais invalidas.');
    }

    return {
      user: {
        id: 'u-1000',
        email: payload.email,
        name: 'Usuario SaaS'
      },
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      }
    };
  }
};

export default authApi;

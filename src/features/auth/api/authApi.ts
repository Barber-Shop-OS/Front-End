import api from '@/services/api';
import type {
  GoogleLoginRequestPayload,
  GoogleSignupRequestPayload,
  LoginRequestPayload,
  LoginSuccessPayload,
  SignupRequestPayload
} from '@/types';

const AUTH_LOGIN_ENDPOINT = '/auth/login';
const AUTH_GOOGLE_LOGIN_ENDPOINT = '/auth/google/login';
const AUTH_SIGNUP_ENDPOINT = '/auth/signup';
const AUTH_GOOGLE_SIGNUP_ENDPOINT = '/auth/google/signup';

const useMockAuth = import.meta.env.VITE_USE_MOCK_AUTH === 'true';

const mockLogin = async (
  payload: LoginRequestPayload
): Promise<LoginSuccessPayload> => {
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
};

export const authApi = {
  login: async (payload: LoginRequestPayload): Promise<LoginSuccessPayload> => {
    if (useMockAuth) {
      return mockLogin(payload);
    }

    const response = await api.post<LoginSuccessPayload>(AUTH_LOGIN_ENDPOINT, payload);
    return response.data;
  },
  loginWithGoogle: async (
    payload: GoogleLoginRequestPayload
  ): Promise<LoginSuccessPayload> => {
    if (useMockAuth) {
      return mockLogin({ email: 'google.user@saas.com', password: 'mock-google-login' });
    }

    const response = await api.post<LoginSuccessPayload>(
      AUTH_GOOGLE_LOGIN_ENDPOINT,
      payload
    );
    return response.data;
  },
  signup: async (payload: SignupRequestPayload): Promise<LoginSuccessPayload> => {
    if (useMockAuth) {
      await new Promise((resolve) => {
        setTimeout(resolve, 700);
      });

      if (!payload.name || !payload.email || payload.password.length < 4) {
        throw new Error('Dados invalidos para cadastro.');
      }

      return {
        user: {
          id: 'u-' + Date.now(),
          email: payload.email,
          name: payload.name
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };
    }

    const response = await api.post<LoginSuccessPayload>(
      AUTH_SIGNUP_ENDPOINT,
      payload
    );
    return response.data;
  },
  signupWithGoogle: async (
    payload: GoogleSignupRequestPayload
  ): Promise<LoginSuccessPayload> => {
    if (useMockAuth) {
      return {
        user: {
          id: 'u-' + Date.now(),
          email: 'google.signup@saas.com',
          name: 'Google User'
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token'
        }
      };
    }

    const response = await api.post<LoginSuccessPayload>(
      AUTH_GOOGLE_SIGNUP_ENDPOINT,
      payload
    );
    return response.data;
  }
};

export default authApi;

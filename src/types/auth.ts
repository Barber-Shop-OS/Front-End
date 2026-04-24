export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequestPayload {
  email: string;
  password: string;
}

export interface GoogleLoginRequestPayload {
  provider: 'google';
  authorizationCode: string;
  redirectUri: string;
  source: 'web';
}

export interface SignupRequestPayload {
  name: string;
  email: string;
  password: string;
}

export interface GoogleSignupRequestPayload {
  provider: 'google';
  authorizationCode: string;
  redirectUri: string;
  source: 'web';
}

export interface LoginSuccessPayload {
  user: AuthUser;
  tokens: AuthTokens;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  status: AuthStatus;
  error: string | null;
}

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type {
  AuthState,
  GoogleLoginRequestPayload,
  GoogleSignupRequestPayload,
  LoginRequestPayload,
  LoginSuccessPayload,
  SignupRequestPayload
} from '@/types';

const initialState: AuthState = {
  user: null,
  tokens: null,
  status: 'idle',
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Bootstrap de sessão: chamado no carregamento do app para validar o
     * token persistido via GET /auth/me.
     */
    bootstrapSessionRequest: (state) => {
      state.status = 'loading';
      state.error = null;
    },
    bootstrapSessionSuccess: (state, action: PayloadAction<AuthState['user']>) => {
      state.status = 'authenticated';
      state.user = action.payload;
      state.error = null;
    },
    bootstrapSessionFailure: (state, action: PayloadAction<string>) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.tokens = null;
      state.error = action.payload;
    },
    loginRequest: (state, _action: PayloadAction<LoginRequestPayload>) => {
      state.status = 'loading';
      state.error = null;
    },
    loginWithGoogleRequest: (
      state,
      _action: PayloadAction<GoogleLoginRequestPayload>
    ) => {
      state.status = 'loading';
      state.error = null;
    },
    signupRequest: (state, _action: PayloadAction<SignupRequestPayload>) => {
      state.status = 'loading';
      state.error = null;
    },
    signupWithGoogleRequest: (
      state,
      _action: PayloadAction<GoogleSignupRequestPayload>
    ) => {
      state.status = 'loading';
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<LoginSuccessPayload>) => {
      state.status = 'authenticated';
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.tokens = null;
      state.error = action.payload;
    },
    signupFailure: (state, action: PayloadAction<string>) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.tokens = null;
      state.error = action.payload;
    },
    logout: (state) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.tokens = null;
      state.error = null;
    }
  }
});

export const {
  bootstrapSessionRequest,
  bootstrapSessionSuccess,
  bootstrapSessionFailure,
  loginRequest,
  loginWithGoogleRequest,
  signupRequest,
  signupWithGoogleRequest,
  loginSuccess,
  loginFailure,
  signupFailure,
  logout
} = authSlice.actions;

export default authSlice.reducer;


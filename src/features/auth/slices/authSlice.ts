import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { AuthState, LoginRequestPayload, LoginSuccessPayload } from '@/types';

const initialState: AuthState = {
  user: null,
  tokens: null,
  status: 'unauthenticated',
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state, _action: PayloadAction<LoginRequestPayload>) => {
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
    logout: (state) => {
      state.status = 'unauthenticated';
      state.user = null;
      state.tokens = null;
      state.error = null;
    }
  }
});

export const { loginRequest, loginSuccess, loginFailure, logout } = authSlice.actions;

export default authSlice.reducer;

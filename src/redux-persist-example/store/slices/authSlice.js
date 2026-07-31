import { createSlice } from '@reduxjs/toolkit';

/**
 * Slice de autenticação — EXEMPLO ISOLADO
 *
 * Este slice é uma demonstração independente (Redux Toolkit + Redux Persist),
 * isolado em `src/redux-persist-example/` para NÃO conflitar com a estrutura
 * TypeScript existente do projeto (src/features/auth/slices/authSlice.ts).
 */
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

export default authSlice.reducer;


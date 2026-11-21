// Sessão do usuário. O access token fica só em memória (services/http); aqui fica o perfil (/me).
// FE-37: sem localStorage — ao recarregar, a sessão volta pelo refresh token (cookie httpOnly).
import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import http, { authHttp, normalizeApiError, refreshAccessToken, setAccessToken, type ApiError } from '@/services/http';
import { baseApi } from '@/services/baseApi';
import { TERMS_VERSION } from '@/config/env';
import type { Me, MeBarbershop } from '@/types/api';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: Me | null;
}

const initialState: AuthState = { status: 'idle', user: null };

/**
 * A API lista dono/gerente em `barbershops` e a recepção em `front_desk` (uma linha por filial). O app trata
 * tudo como barbearias com `membership`; aqui as filiais de atendimento viram entradas 'receptionist'.
 */
export const normalizeMe = (me: Me): Me => {
  const extra = new Map<number, MeBarbershop>();
  for (const desk of me.front_desk ?? []) {
    if (me.barbershops.some((shop) => shop.id === desk.barbershop_id && shop.membership === 'receptionist')) continue;
    const current = extra.get(desk.barbershop_id);
    if (current) current.branch_ids = [...(current.branch_ids ?? []), desk.branch_id];
    else
      extra.set(desk.barbershop_id, {
        id: desk.barbershop_id,
        name: desk.barbershop.name,
        slug: desk.barbershop.slug,
        status: desk.barbershop.status,
        logo_url: desk.barbershop.logo_url,
        membership: 'receptionist',
        branch_ids: [desk.branch_id],
      });
  }
  return extra.size ? { ...me, barbershops: [...(me.barbershops ?? []), ...extra.values()] } : me;
};

const fetchMe = async (): Promise<Me> => normalizeMe((await http.get<Me>('/me')).data);

/** Carregamento do app: tenta renovar a sessão pelo cookie de refresh. */
export const bootstrapSession = createAsyncThunk<Me | null>('auth/bootstrap', async () => {
  const token = await refreshAccessToken();
  if (!token) return null;
  try {
    return await fetchMe();
  } catch {
    setAccessToken(null);
    return null;
  }
});

/** Abre a sessão com um token já emitido (login, cadastro do dono, Google, troca de senha). */
export const startSession = createAsyncThunk<Me, string, { rejectValue: ApiError }>(
  'auth/start',
  async (token, { rejectWithValue }) => {
    setAccessToken(token);
    try {
      return await fetchMe();
    } catch (error) {
      setAccessToken(null);
      return rejectWithValue(normalizeApiError(error));
    }
  }
);

export const login = createAsyncThunk<Me, { email: string; password: string }, { rejectValue: ApiError }>(
  'auth/login',
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await authHttp.post<{ token: string }>('/login', credentials);
      return await dispatch(startSession(data.token)).unwrap();
    } catch (error) {
      return rejectWithValue(normalizeApiError(error));
    }
  }
);

export const loginWithGoogle = createAsyncThunk<
  { me: Me; created: boolean },
  { id_token: string; intent?: 'login' | 'signup-client' | 'signup-owner'; phone?: string; barbershop?: { name: string } },
  { rejectValue: ApiError }
>('auth/google', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await authHttp.post<{ token: string; created: boolean }>('/google', { ...payload, terms_version: TERMS_VERSION });
    const me = await dispatch(startSession(data.token)).unwrap();
    return { me, created: data.created };
  } catch (error) {
    return rejectWithValue(normalizeApiError(error));
  }
});

/** Recarrega o perfil (após criar barbearia, verificar e-mail etc.). */
export const refreshMe = createAsyncThunk<Me>('auth/refreshMe', fetchMe);

/** Encerra a sessão no servidor (revoga o refresh) e limpa tudo localmente. */
export const logout = createAsyncThunk('auth/logout', async (_arg, { dispatch }) => {
  try {
    await authHttp.post('/logout');
  } catch {
    // Sessão já inválida no servidor: segue limpando localmente.
  }
  setAccessToken(null);
  dispatch(baseApi.util.resetApiState());
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionExpired: (state) => {
      state.status = 'unauthenticated';
      state.user = null;
    },
    userUpdated: (state, action: PayloadAction<Partial<Me>>) => {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? 'authenticated' : 'unauthenticated';
      })
      .addCase(bootstrapSession.rejected, (state) => {
        state.status = 'unauthenticated';
        state.user = null;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'authenticated';
      })
      .addCase(refreshMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'unauthenticated';
      });
  },
});

export const { sessionExpired, userUpdated } = authSlice.actions;
export default authSlice.reducer;

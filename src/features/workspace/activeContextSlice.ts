// FE-09: barbearia e filial ativas no painel. Só ids (não sensíveis) ficam no localStorage, para o
// dono voltar ao mesmo contexto. A validação contra o /me acontece em useActiveContext.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

const KEY = 'barberos.activeContext';

interface ActiveContextState {
  barbershopId: number | null;
  branchId: number | null;
}

const load = (): ActiveContextState => {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    const parsed = raw ? (JSON.parse(raw) as Partial<ActiveContextState>) : {};
    return {
      barbershopId: typeof parsed.barbershopId === 'number' ? parsed.barbershopId : null,
      branchId: typeof parsed.branchId === 'number' ? parsed.branchId : null,
    };
  } catch {
    return { barbershopId: null, branchId: null };
  }
};

const save = (state: ActiveContextState) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Armazenamento indisponível (modo privado): segue só em memória.
  }
};

const slice = createSlice({
  name: 'activeContext',
  initialState: load,
  reducers: {
    setActiveBarbershop: (state, action: PayloadAction<number | null>) => {
      if (state.barbershopId !== action.payload) state.branchId = null;
      state.barbershopId = action.payload;
      save({ ...state });
    },
    setActiveBranch: (state, action: PayloadAction<number | null>) => {
      state.branchId = action.payload;
      save({ ...state });
    },
  },
});

export const { setActiveBarbershop, setActiveBranch } = slice.actions;
export const activeContextReducer = slice.reducer;

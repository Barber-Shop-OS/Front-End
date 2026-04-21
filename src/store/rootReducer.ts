import { combineReducers } from '@reduxjs/toolkit';

import authReducer from '@/features/auth/slices/authSlice';

const rootReducer = combineReducers({
  auth: authReducer
});

export type RootReducerState = ReturnType<typeof rootReducer>;

export default rootReducer;

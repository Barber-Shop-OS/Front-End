import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';

import authApi from '@/features/auth/api/authApi';
import {
  bootstrapSessionFailure,
  bootstrapSessionRequest,
  bootstrapSessionSuccess,
  loginFailure,
  loginRequest,
  loginSuccess,
  loginWithGoogleRequest,
  signupFailure,
  signupRequest,
  signupWithGoogleRequest
} from '@/features/auth/slices/authSlice';
import type {
  GoogleLoginRequestPayload,
  GoogleSignupRequestPayload,
  LoginRequestPayload,
  LoginSuccessPayload,
  SignupRequestPayload
} from '@/types';

const getErrorMessage = (error: unknown, fallback: string): string => {
  return error instanceof Error ? error.message : fallback;
};

function* loginWorker(action: PayloadAction<LoginRequestPayload>): SagaIterator {
  try {
    const response = (yield call(authApi.login, action.payload)) as LoginSuccessPayload;
    yield put(loginSuccess(response));
  } catch (error) {
    yield put(loginFailure(getErrorMessage(error, 'Falha no login')));
  }
}

function* loginWithGoogleWorker(
  action: PayloadAction<GoogleLoginRequestPayload>
): SagaIterator {
  try {
    const response = (yield call(
      authApi.loginWithGoogle,
      action.payload
    )) as LoginSuccessPayload;
    yield put(loginSuccess(response));
  } catch (error) {
    yield put(
      loginFailure(getErrorMessage(error, 'Falha no login com Google'))
    );
  }
}

function* signupWorker(action: PayloadAction<SignupRequestPayload>): SagaIterator {
  try {
    const response = (yield call(authApi.signup, action.payload)) as LoginSuccessPayload;
    yield put(loginSuccess(response));
  } catch (error) {
    yield put(signupFailure(getErrorMessage(error, 'Falha no cadastro')));
  }
}

function* signupWithGoogleWorker(
  action: PayloadAction<GoogleSignupRequestPayload>
): SagaIterator {
  try {
    const response = (yield call(
      authApi.signupWithGoogle,
      action.payload
    )) as LoginSuccessPayload;
    yield put(loginSuccess(response));
  } catch (error) {
    yield put(
      signupFailure(getErrorMessage(error, 'Falha no cadastro com Google'))
    );
  }
}

/**
 * Bootstrap de sessão: valida o token persistido chamando GET /auth/me.
 * Se o token for inválido/expirado (401), o interceptor do http limpa a
 * sessão e o status vai para 'unauthenticated'.
 */
function* bootstrapSessionWorker(): SagaIterator {
  try {
    const response = (yield call(authApi.getMe)) as LoginSuccessPayload;
    yield put(bootstrapSessionSuccess(response.user));
  } catch (error) {
    yield put(
      bootstrapSessionFailure(getErrorMessage(error, 'Sessão expirada'))
    );
  }
}

export default function* authSaga(): SagaIterator {
  yield takeLatest(bootstrapSessionRequest.type, bootstrapSessionWorker);
  yield takeLatest(loginRequest.type, loginWorker);
  yield takeLatest(loginWithGoogleRequest.type, loginWithGoogleWorker);
  yield takeLatest(signupRequest.type, signupWorker);
  yield takeLatest(signupWithGoogleRequest.type, signupWithGoogleWorker);
}


import { call, put, takeLatest } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';
import type { PayloadAction } from '@reduxjs/toolkit';

import authApi from '@/features/auth/api/authApi';
import {
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

function* loginWorker(action: PayloadAction<LoginRequestPayload>): SagaIterator {
  try {
    const response = (yield call(authApi.login, action.payload)) as LoginSuccessPayload;
    yield put(loginSuccess(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha no login';
    yield put(loginFailure(message));
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
    const message = error instanceof Error ? error.message : 'Falha no login com Google';
    yield put(loginFailure(message));
  }
}

function* signupWorker(action: PayloadAction<SignupRequestPayload>): SagaIterator {
  try {
    const response = (yield call(authApi.signup, action.payload)) as LoginSuccessPayload;
    yield put(loginSuccess(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha no cadastro';
    yield put(signupFailure(message));
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
    const message = error instanceof Error ? error.message : 'Falha no cadastro com Google';
    yield put(signupFailure(message));
  }
}

export default function* authSaga(): SagaIterator {
  yield takeLatest(loginRequest.type, loginWorker);
  yield takeLatest(loginWithGoogleRequest.type, loginWithGoogleWorker);
  yield takeLatest(signupRequest.type, signupWorker);
  yield takeLatest(signupWithGoogleRequest.type, signupWithGoogleWorker);
}

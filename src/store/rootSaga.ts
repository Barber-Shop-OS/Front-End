import { all, fork } from 'redux-saga/effects';
import type { SagaIterator } from 'redux-saga';

import authSaga from '@/features/auth/sagas/authSaga';

export default function* rootSaga(): SagaIterator {
  yield all([fork(authSaga)]);
}

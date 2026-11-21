import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';

import { normalizeApiError } from './http';

const axiosError = (status: number, data: unknown) =>
  new AxiosError(`Request failed with status code ${status}`, 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
    statusText: '',
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  });

describe('normalizeApiError', () => {
  it('usa mensagem e código da API mesmo o AxiosError tendo `status` (axios ≥ 1.7)', () => {
    expect(normalizeApiError(axiosError(409, { message: 'Horário ocupado', code: 'SLOT_TAKEN' }))).toEqual({
      status: 409,
      message: 'Horário ocupado',
      code: 'SLOT_TAKEN',
      details: undefined,
    });
  });

  it('sem resposta vira NETWORK_ERROR', () => {
    expect(normalizeApiError(new AxiosError('Network Error', 'ERR_NETWORK')).code).toBe('NETWORK_ERROR');
  });

  it('ApiError já normalizado passa direto', () => {
    const error = { status: 403, message: 'x', code: 'CLIENT_BLOCKED' };
    expect(normalizeApiError(error)).toBe(error);
  });
});

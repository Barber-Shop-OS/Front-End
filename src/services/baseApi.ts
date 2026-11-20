// FE-05: RTK Query sobre o Axios (reaproveita token, refresh e normalização de erro).
import { createApi, type BaseQueryFn } from '@reduxjs/toolkit/query/react';
import type { AxiosRequestConfig } from 'axios';

import http, { normalizeApiError, type ApiError } from './http';

export interface QueryArgs {
  url: string;
  method?: AxiosRequestConfig['method'];
  body?: unknown;
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const axiosBaseQuery: BaseQueryFn<QueryArgs | string, unknown, ApiError> = async (args) => {
  const { url, method = 'GET', body, params, headers } = typeof args === 'string' ? { url: args } : args;
  try {
    const cleanParams = params
      ? Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ''))
      : undefined;
    const result = await http.request({ url, method, data: body, params: cleanParams, headers });
    return { data: result.data };
  } catch (error) {
    return { error: normalizeApiError(error) };
  }
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery,
  tagTypes: [
    'Me',
    'Barbershop',
    'Branch',
    'Barber',
    'Service',
    'Appointment',
    'Payment',
    'Client',
    'Dashboard',
    'Subscription',
    'Plan',
    'Schedule',
    'Member',
    'Session',
    'Admin',
  ],
  endpoints: () => ({}),
});

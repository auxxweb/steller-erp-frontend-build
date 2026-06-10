import axios from 'axios';
import { resolveApiBaseUrl } from '../config/env.js';

/**
 * Standalone client for token refresh — avoids interceptor loops.
 */
const refreshClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const postRefresh = async (refreshToken) => {
  const { data } = await refreshClient.post('/auth/refresh', { refreshToken });
  return data.data;
};

export default refreshClient;

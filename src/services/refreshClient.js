import axios from 'axios';

/**
 * Standalone client for token refresh — avoids interceptor loops.
 */
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export const postRefresh = async (refreshToken) => {
  const { data } = await refreshClient.post('/auth/refresh', { refreshToken });
  return data.data;
};

export default refreshClient;

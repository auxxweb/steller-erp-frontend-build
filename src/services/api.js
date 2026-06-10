import axios from 'axios';
import { resolveApiBaseUrl } from '../config/env.js';

/**
 * Shared API client — interceptors registered in setupApiInterceptors.js
 * @see providers/AuthSessionProvider.jsx
 */
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

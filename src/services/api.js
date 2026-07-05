import axios from 'axios';
import { resolveApiBaseUrl } from '../config/env.js';
import { API_TIMEOUT_MS } from '../config/apiTimeouts.js';

/**
 * Shared API client — interceptors registered in setupApiInterceptors.js
 * @see providers/AuthSessionProvider.jsx
 */
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  timeout: API_TIMEOUT_MS,
});

export default api;

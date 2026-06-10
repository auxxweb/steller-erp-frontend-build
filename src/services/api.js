import axios from 'axios';

/**
 * Shared API client — interceptors registered in setupApiInterceptors.js
 * @see providers/AuthSessionProvider.jsx
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

import useAuthStore from '../store/authStore.js';
import api from './api.js';

const SKIP_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/reset-password',
];

let isRefreshing = false;
let refreshQueue = [];

const shouldSkipRefresh = (url = '') => {
  return SKIP_REFRESH_PATHS.some((path) => url.includes(path));
};

const processQueue = (error, token = null) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  refreshQueue = [];
};

export const AUTH_LOGOUT_EVENT = 'stellar:auth-logout';

export const dispatchAuthLogout = (reason = 'session_expired') => {
  window.dispatchEvent(
    new CustomEvent(AUTH_LOGOUT_EVENT, { detail: { reason } }),
  );
};

let interceptorsRegistered = false;

/**
 * Register axios interceptors once for token attach + refresh + 401 handling.
 */
export const setupApiInterceptors = () => {
  if (interceptorsRegistered) return;
  interceptorsRegistered = true;

  api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.message ||
        'Something went wrong. Please try again.';

      if (
        status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !shouldSkipRefresh(originalRequest.url)
      ) {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          useAuthStore.getState().clearSession();
          dispatchAuthLogout('no_refresh_token');
          return Promise.reject(new Error(message));
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newAccessToken = await useAuthStore.getState().refreshSession();
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          useAuthStore.getState().clearSession();
          dispatchAuthLogout('refresh_failed');
          return Promise.reject(
            refreshError instanceof Error
              ? refreshError
              : new Error('Session expired. Please sign in again.'),
          );
        } finally {
          isRefreshing = false;
        }
      }

      if (status === 401 && !shouldSkipRefresh(originalRequest?.url)) {
        useAuthStore.getState().clearSession();
        dispatchAuthLogout('unauthorized');
      }

      return Promise.reject(new Error(message));
    },
  );
};

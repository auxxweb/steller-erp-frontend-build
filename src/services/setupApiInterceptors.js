import useAuthStore from '../store/authStore.js';
import {
  decrementLoader,
  incrementLoader,
  resetGlobalLoader,
  shouldTrackLoader,
} from '../lib/loadingStore.js';
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
  resetGlobalLoader();
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

    // FormData must not use application/json — browser sets multipart boundary.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    } else if (
      config.headers &&
      !config.headers['Content-Type'] &&
      !config.headers['content-type']
    ) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (shouldTrackLoader(config)) {
      incrementLoader();
      config._loaderTracked = true;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => {
      if (response.config?._loaderTracked) {
        decrementLoader();
      }
      return response;
    },
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
          if (originalRequest?._loaderTracked) decrementLoader();
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
            .catch((err) => {
              if (originalRequest?._loaderTracked) decrementLoader();
              return Promise.reject(err);
            });
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

      if (originalRequest?._loaderTracked) {
        decrementLoader();
      }

      return Promise.reject(new Error(message));
    },
  );
};

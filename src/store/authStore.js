import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  login as loginRequest,
  logout as logoutRequest,
  getProfile,
  refreshTokens as refreshTokensRequest,
  forgotPassword as forgotPasswordRequest,
  resetPassword as resetPasswordRequest,
} from '../services/authService.js';

export const AUTH_SESSION_KEY = 'stellar-auth';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isHydrated: false,
      sessionExpired: false,

      setHydrated: () => set({ isHydrated: true }),

      setSessionExpired: (expired) => set({ sessionExpired: expired }),

      clearSession: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          sessionExpired: true,
          isLoading: false,
        });
      },

      setTokens: ({ accessToken, refreshToken, user }) => {
        set({
          accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          user: user ?? get().user,
          sessionExpired: false,
        });
      },

      updateUser: (user) => set({ user }),

      login: async (credentials) => {
        set({ isLoading: true, sessionExpired: false });
        try {
          const data = await loginRequest(credentials);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isLoading: false,
            sessionExpired: false,
          });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async (options = {}) => {
        const { silent = false } = options;
        const { refreshToken } = get();

        if (!silent) set({ isLoading: true });

        try {
          if (refreshToken) {
            await logoutRequest(refreshToken);
          }
        } catch {
          // Clear local session even if API fails
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoading: false,
            sessionExpired: false,
          });
        }
      },

      refreshSession: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const data = await refreshTokensRequest(refreshToken);

        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          sessionExpired: false,
        });

        return data.accessToken;
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const result = await forgotPasswordRequest(email);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (payload) => {
        set({ isLoading: true });
        try {
          const result = await resetPasswordRequest(payload);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      fetchProfile: async () => {
        const { accessToken, refreshToken } = get();

        if (!accessToken) {
          set({ isHydrated: true });
          return;
        }

        try {
          const user = await getProfile();
          set({ user, sessionExpired: false });
        } catch {
          if (refreshToken) {
            try {
              await get().refreshSession();
              const user = await getProfile();
              set({ user, sessionExpired: false });
            } catch {
              get().clearSession();
            }
          } else {
            get().clearSession();
          }
        } finally {
          set({ isHydrated: true });
        }
      },
    }),
    {
      name: AUTH_SESSION_KEY,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) {
          useAuthStore.getState().setHydrated();
          return;
        }
        if (state.accessToken) {
          state.fetchProfile();
        } else {
          state.setHydrated();
        }
      },
    },
  ),
);

export default useAuthStore;

import useAuthStore from '../store/authStore.js';

/**
 * Auth hook — exposes store state and actions.
 */
function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    accessToken: store.accessToken,
    refreshToken: store.refreshToken,
    isAuthenticated: Boolean(store.accessToken),
    isLoading: store.isLoading,
    isHydrated: store.isHydrated,
    sessionExpired: store.sessionExpired,
    login: store.login,
    logout: store.logout,
    refreshSession: store.refreshSession,
    clearSession: store.clearSession,
    forgotPassword: store.forgotPassword,
    resetPassword: store.resetPassword,
    updateUser: store.updateUser,
  };
}

export default useAuth;

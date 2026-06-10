import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupApiInterceptors, AUTH_LOGOUT_EVENT } from '../services/setupApiInterceptors.js';
import useAuthStore from '../store/authStore.js';
import { msUntilExpiry } from '../utils/jwtClient.js';

/**
 * Wires API interceptors, token expiry timers, and session logout events.
 */
function AuthSessionProvider({ children }) {
  const navigate = useNavigate();
  const expiryTimerRef = useRef(null);

  useEffect(() => {
    setupApiInterceptors();
  }, []);

  useEffect(() => {
    const scheduleExpiryCheck = () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }

      const { accessToken } = useAuthStore.getState();
      if (!accessToken) return;

      const ms = msUntilExpiry(accessToken, 15_000);

      expiryTimerRef.current = setTimeout(async () => {
        const state = useAuthStore.getState();

        if (!state.accessToken) return;

        if (state.refreshToken) {
          try {
            await state.refreshSession();
            scheduleExpiryCheck();
            return;
          } catch {
            state.clearSession();
            navigate('/auth?expired=1', { replace: true });
            return;
          }
        }

        state.clearSession();
        navigate('/auth?expired=1', { replace: true });
      }, ms || 0);
    };

    scheduleExpiryCheck();

    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.accessToken !== prev.accessToken) {
        scheduleExpiryCheck();
      }
    });

    return () => {
      unsub();
      if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    };
  }, [navigate]);

  useEffect(() => {
    const onLogout = (event) => {
      const reason = event.detail?.reason;
      const params = reason === 'session_expired' || reason === 'refresh_failed' ? '?expired=1' : '';
      navigate(`/auth${params}`, { replace: true });
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout);
  }, [navigate]);

  return children;
}

export default AuthSessionProvider;

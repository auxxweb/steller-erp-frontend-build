import { registerSW } from 'virtual:pwa-register';

let updateSW = null;

/**
 * Register the service worker and wire lifecycle callbacks.
 * @param {{ onNeedRefresh?: () => void, onOfflineReady?: () => void, onRegistered?: () => void }} callbacks
 */
export function registerAppSW(callbacks = {}) {
  if (!import.meta.env.PROD) {
    return () => {};
  }

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      callbacks.onNeedRefresh?.();
    },
    onOfflineReady() {
      callbacks.onOfflineReady?.();
    },
    onRegistered(registration) {
      callbacks.onRegistered?.(registration);
      // Check for updates every hour when app is open
      if (registration) {
        setInterval(
          () => registration.update().catch(() => {}),
          60 * 60 * 1000,
        );
      }
    },
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed:', error);
    },
  });

  return () => updateSW?.(true);
}

/** Apply pending service worker update (reloads the page). */
export function applyPWAUpdate() {
  updateSW?.(true);
}

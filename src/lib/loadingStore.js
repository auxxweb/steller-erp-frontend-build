/**
 * Global API loader — ref-counted, debounced visibility.
 * Wired from axios interceptors; mount <GlobalLoader /> once in the app shell.
 */

const SHOW_DELAY_MS = 80;

let pendingCount = 0;
let visible = false;
let showTimer = null;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

function syncBodyScroll() {
  if (typeof document === 'undefined') return;
  document.body.style.overflow = visible ? 'hidden' : '';
  document.body.setAttribute('aria-busy', visible ? 'true' : 'false');
}

export function getLoaderSnapshot() {
  return visible;
}

export function subscribeLoader(onStoreChange) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function incrementLoader() {
  pendingCount += 1;
  if (pendingCount === 1) {
    clearTimeout(showTimer);
    showTimer = setTimeout(() => {
      if (pendingCount > 0 && !visible) {
        visible = true;
        syncBodyScroll();
        emit();
      }
    }, SHOW_DELAY_MS);
  }
}

export function decrementLoader() {
  pendingCount = Math.max(0, pendingCount - 1);
  if (pendingCount === 0) {
    clearTimeout(showTimer);
    if (visible) {
      visible = false;
      syncBodyScroll();
      emit();
    }
  }
}

/** Reset on session logout or hard navigation edge cases. */
export function resetGlobalLoader() {
  pendingCount = 0;
  clearTimeout(showTimer);
  if (visible) {
    visible = false;
    syncBodyScroll();
    emit();
  }
}

export function shouldTrackLoader(config = {}) {
  if (!config) return false;
  if (config.skipGlobalLoader) return false;
  if (config._retry) return false;
  return true;
}

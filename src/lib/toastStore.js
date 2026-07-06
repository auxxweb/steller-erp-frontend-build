/**
 * Imperative toast queue — works outside React (API hooks, interceptors).
 * Mount <ToastViewport /> once in the app shell.
 */

let seq = 0;
/** @type {Array<{ id: string, message: string, variant: 'success' | 'error' | 'info' }>} */
let items = [];
const listeners = new Set();
let lastPush = { message: '', variant: '', at: 0, id: null };

function emit() {
  listeners.forEach((fn) => fn());
}

export function getToastSnapshot() {
  return items;
}

export function subscribeToasts(onStoreChange) {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

export function dismissToast(id) {
  const next = items.filter((t) => t.id !== id);
  if (next.length === items.length) return;
  items = next;
  emit();
}

/**
 * @param {string} message
 * @param {{ variant?: 'success'|'error'|'info', duration?: number }} [options]
 */
export function pushToast(message, options = {}) {
  if (!message?.trim()) return null;
  const trimmed = message.trim();
  const variant = options.variant || 'info';
  const now = Date.now();

  if (
    lastPush.message === trimmed &&
    lastPush.variant === variant &&
    now - lastPush.at < 500
  ) {
    return lastPush.id;
  }

  const duration =
    options.duration !== undefined
      ? options.duration
      : variant === 'error'
        ? 8000
        : 5000;

  const id = `toast-${++seq}`;
  items = [{ id, message: trimmed, variant }];
  lastPush = { message: trimmed, variant, at: now, id };
  emit();

  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }
  return id;
}

export const toast = {
  success: (message, opts) => pushToast(message, { ...opts, variant: 'success' }),
  error: (message, opts) => pushToast(message, { ...opts, variant: 'error' }),
  info: (message, opts) => pushToast(message, { ...opts, variant: 'info' }),
};

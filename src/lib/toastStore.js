/**
 * Imperative toast queue — works outside React (API hooks, interceptors).
 * Mount <ToastViewport /> once in the app shell.
 */

let seq = 0;
/** @type {Array<{ id: string, message: string, variant: 'success' | 'error' | 'info' }>} */
let items = [];
const listeners = new Set();

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
  const id = `toast-${++seq}`;
  const variant = options.variant || 'info';
  const duration =
    options.duration !== undefined
      ? options.duration
      : variant === 'error'
        ? 8000
        : 5000;

  items = [...items, { id, message: message.trim(), variant }];
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

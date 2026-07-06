import { useSyncExternalStore } from 'react';
import {
  dismissToast,
  getToastSnapshot,
  subscribeToasts,
} from '../../lib/toastStore.js';
import { cn } from '../../utils/cn.js';

const variantStyles = {
  success:
    'border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100',
  error: 'border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-100',
  info: 'border-stellar-border bg-stellar-surface-muted text-stellar-text',
};

function ToastViewport() {
  const toasts = useSyncExternalStore(subscribeToasts, getToastSnapshot, getToastSnapshot);

  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed top-4 right-0 z-[10000] flex w-full max-w-md flex-col gap-2 overflow-y-auto p-4 sm:right-4"
      aria-live="polite"
      aria-relevant="additions text"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto animate-fade-up rounded-stellar-lg border px-stellar-4 py-stellar-3 text-sm shadow-lg backdrop-blur-sm',
            variantStyles[t.variant] || variantStyles.info,
          )}
        >
          <div className="flex items-start justify-between gap-stellar-3">
            <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              className="shrink-0 rounded-md px-1.5 py-0.5 text-xs font-medium text-current opacity-70 hover:opacity-100"
              onClick={() => dismissToast(t.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;

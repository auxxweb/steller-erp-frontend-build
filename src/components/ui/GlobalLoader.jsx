import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Spinner from './Spinner.jsx';
import { getLoaderSnapshot, subscribeLoader } from '../../lib/loadingStore.js';

function GlobalLoader() {
  const active = useSyncExternalStore(subscribeLoader, getLoaderSnapshot, getLoaderSnapshot);

  if (!active) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-stellar-bg/40 backdrop-blur-md"
      role="presentation"
      aria-hidden="false"
    >
      <div
        className="flex flex-col items-center gap-stellar-3 rounded-stellar-lg bg-stellar-surface/90 px-stellar-8 py-stellar-6 shadow-xl ring-1 ring-stellar-border/60"
        role="status"
        aria-live="polite"
        aria-label="Loading"
      >
        <Spinner size="lg" />
        <p className="text-sm font-medium text-stellar-text-muted">Please wait…</p>
      </div>
    </div>,
    document.body,
  );
}

export default GlobalLoader;

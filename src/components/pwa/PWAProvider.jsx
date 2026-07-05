import { useCallback, useEffect, useState } from 'react';
import { applyPWAUpdate, registerAppSW } from '../../pwa/registerPWA.js';
import InstallPWA from './InstallPWA.jsx';
import OfflineIndicator from './OfflineIndicator.jsx';
import PWAUpdatePrompt from './PWAUpdatePrompt.jsx';

function PWAProvider({ children }) {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    let toastTimer;

    registerAppSW({
      onNeedRefresh: () => setNeedRefresh(true),
      onOfflineReady: () => {
        setShowOfflineToast(true);
        toastTimer = setTimeout(() => setShowOfflineToast(false), 4000);
      },
    });

    return () => clearTimeout(toastTimer);
  }, []);

  const handleUpdate = useCallback(() => {
    setNeedRefresh(false);
    applyPWAUpdate();
  }, []);

  const dismissUpdate = useCallback(() => setNeedRefresh(false), []);

  return (
    <>
      {children}
      <OfflineIndicator />
      <InstallPWA />
      {needRefresh && (
        <PWAUpdatePrompt onUpdate={handleUpdate} onDismiss={dismissUpdate} />
      )}
      {showOfflineToast && !needRefresh && (
        <div
          className="fixed bottom-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))] left-1/2 z-[100] -translate-x-1/2 animate-fade-up opacity-0-start safe-area-x"
          role="status"
        >
          <p className="rounded-full border border-stellar-border bg-stellar-surface px-stellar-5 py-stellar-2 text-sm font-medium text-stellar-text shadow-stellar-elevated">
            App ready for offline use
          </p>
        </div>
      )}
    </>
  );
}

export default PWAProvider;

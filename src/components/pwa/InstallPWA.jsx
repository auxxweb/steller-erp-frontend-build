import { useEffect, useState } from 'react';
import Button from '../ui/Button.jsx';
import { cn } from '../../utils/cn.js';

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    const dismissedAt = localStorage.getItem('stellar-pwa-install-dismissed');
    return Boolean(
      dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000,
    );
  });
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (isStandalone()) return undefined;

    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
      return;
    }

    if (isIos()) {
      setShowIosHint(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowIosHint(false);
    localStorage.setItem('stellar-pwa-install-dismissed', String(Date.now()));
  };

  if (isStandalone() || dismissed) return null;

  const showAndroidDesktop = Boolean(deferredPrompt);
  const showIos = isIos() && !deferredPrompt;

  if (!showAndroidDesktop && !showIos) return null;

  return (
    <div
      className={cn(
        'fixed bottom-stellar-4 left-stellar-4 right-stellar-4 z-[90] mx-auto max-w-md pwa-fixed-bottom safe-area-x',
        'animate-fade-up opacity-0-start sm:bottom-stellar-6',
        showIosHint && 'max-w-sm',
      )}
      role="region"
      aria-label="Install app"
    >
      <div className="card-elevated p-stellar-4 sm:p-stellar-5">
        {showIosHint ? (
          <>
            <p className="text-sm font-semibold text-stellar-text">Install on iPhone</p>
            <ol className="mt-stellar-2 list-inside list-decimal space-y-stellar-1 text-xs text-stellar-text-muted">
              <li>Tap the Share button in Safari</li>
              <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
              <li>Tap Add in the top right</li>
            </ol>
            <Button variant="primary" size="sm" className="mt-stellar-4 w-full" onClick={handleDismiss}>
              Got it
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-stellar-text">Install Steller Rental Software</p>
            <p className="mt-stellar-1 text-xs text-stellar-text-muted">
              {showIos
                ? 'Add to your home screen for quick access.'
                : 'Install on your device for offline access and a native feel.'}
            </p>
            <div className="mt-stellar-4 flex gap-stellar-2">
              <Button variant="primary" size="sm" className="flex-1" onClick={handleInstall}>
                {showIos ? 'How to install' : 'Install app'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InstallPWA;

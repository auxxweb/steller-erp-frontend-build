import { useEffect, useState } from 'react';
import { cn } from '../../utils/cn.js';

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className={cn(
        'fixed left-0 right-0 top-0 z-[110] flex justify-center pt-[env(safe-area-inset-top)]',
        'animate-fade-in',
      )}
      role="alert"
    >
      <p className="w-full bg-stellar-accent px-stellar-4 py-stellar-2 text-center text-xs font-medium text-stellar-accent-fg">
        You&apos;re offline — cached content is still available
      </p>
    </div>
  );
}

export default OfflineIndicator;

/**
 * Prefer portrait for the installed PWA.
 * Note: browsers cannot read the phone's system auto-rotate toggle.
 * Manifest `orientation: portrait` keeps the installed app in portrait;
 * this lock reinforces that when the Screen Orientation API is available.
 */
export function preferPortraitOrientation() {
  if (typeof window === 'undefined') return () => {};

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (!isStandalone) return () => {};

  const lockPortrait = () => {
    const orientation = window.screen?.orientation;
    if (!orientation?.lock) return;
    orientation.lock('portrait').catch(() => {
      // Not all browsers allow lock without fullscreen / user gesture.
    });
  };

  lockPortrait();

  const onChange = () => lockPortrait();
  window.addEventListener('orientationchange', onChange);
  window.screen?.orientation?.addEventListener?.('change', onChange);

  return () => {
    window.removeEventListener('orientationchange', onChange);
    window.screen?.orientation?.removeEventListener?.('change', onChange);
    window.screen?.orientation?.unlock?.();
  };
}

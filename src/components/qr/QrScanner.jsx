import { useEffect, useId, useRef, useState } from 'react';
import Button from '../ui/Button.jsx';

async function stopScanner(instance) {
  if (!instance) return;
  try {
    if (instance.isScanning) {
      await instance.stop();
    }
  } catch {
    // already stopped
  }
  try {
    await instance.clear();
  } catch {
    // ignore
  }
}

function clearRegionElement(regionId) {
  const el = document.getElementById(regionId);
  if (el) el.innerHTML = '';
}

/**
 * Single camera QR scanner — one video feed only.
 */
function QrScanner({ onScan, onError, paused = false, className = '' }) {
  const regionId = useId().replace(/:/g, '');
  const scannerRef = useRef(null);
  const [active, setActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const lastScanRef = useRef('');
  const onScanRef = useRef(onScan);
  const pausedRef = useRef(paused);
  const startingRef = useRef(false);

  onScanRef.current = onScan;
  pausedRef.current = paused;

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (startingRef.current) return;
      startingRef.current = true;
      clearRegionElement(regionId);

      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode(regionId, { verbose: false });
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1,
            disableFlip: true,
          },
          (decodedText) => {
            if (pausedRef.current) return;
            if (decodedText === lastScanRef.current) return;
            lastScanRef.current = decodedText;
            onScanRef.current?.(decodedText);
          },
          () => {},
        );

        const el = document.getElementById(regionId);
        const videos = el?.querySelectorAll('video') || [];
        videos.forEach((video, index) => {
          if (index > 0) video.remove();
        });

        if (!cancelled) {
          setActive(true);
          setCameraError('');
        } else {
          await stopScanner(scanner);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = err?.message || 'Camera access denied or unavailable';
          setCameraError(msg);
          onError?.(msg);
        }
      } finally {
        startingRef.current = false;
      }
    };

    start();

    return () => {
      cancelled = true;
      startingRef.current = false;
      const instance = scannerRef.current;
      scannerRef.current = null;
      setActive(false);
      stopScanner(instance).finally(() => clearRegionElement(regionId));
    };
  }, [regionId, onError]);

  const handleManualRestart = async () => {
    lastScanRef.current = '';
    const instance = scannerRef.current;
    if (!instance) return;
    await stopScanner(instance);
    clearRegionElement(regionId);
    setCameraError('');
    try {
      await instance.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, disableFlip: true },
        (text) => {
          if (pausedRef.current) return;
          onScanRef.current?.(text);
        },
        () => {},
      );
      setActive(true);
    } catch (err) {
      setCameraError(err?.message || 'Failed to start camera');
    }
  };

  return (
    <div className={className}>
      <div
        id={regionId}
        className="relative mx-auto aspect-square max-h-[min(50vh,320px)] w-full max-w-sm overflow-hidden rounded-stellar-xl border border-stellar-border bg-black [&_canvas]:hidden [&_video]:!h-full [&_video]:!w-full [&_video]:object-cover"
      />
      {cameraError && (
        <div className="mt-stellar-3 space-y-stellar-2">
          <p className="text-sm text-stellar-danger" role="alert">
            {cameraError}
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={handleManualRestart}>
            Retry camera
          </Button>
        </div>
      )}
      {active && !cameraError && (
        <p className="mt-stellar-2 text-center text-xs text-stellar-text-muted">
          Point camera at unit QR code
        </p>
      )}
    </div>
  );
}

export default QrScanner;

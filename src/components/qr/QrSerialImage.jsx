import { useEffect, useState } from 'react';

/**
 * Renders a QR image for a unit scan payload (stellar://unit/{id}) or legacy serial text.
 * Loads the qrcode library on demand to keep the main bundle smaller.
 */
function QrSerialImage({ payload, serialNumber, size = 140, className = '' }) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState(false);
  const value = (payload || serialNumber || '').trim();

  useEffect(() => {
    if (!value) {
      setDataUrl('');
      setError(true);
      return undefined;
    }

    let cancelled = false;
    import('qrcode')
      .then(({ default: QRCode }) =>
        QRCode.toDataURL(value, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: size,
          color: { dark: '#0a0a0a', light: '#ffffff' },
        }),
      )
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl('');
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (error || !dataUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-stellar-md border border-dashed border-stellar-border bg-stellar-surface-muted text-xs text-stellar-text-muted ${className}`}
        style={{ width: size, height: size }}
      >
        No QR
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code for ${value}`}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`rounded-stellar-md border border-stellar-border bg-white ${className}`}
    />
  );
}

export default QrSerialImage;

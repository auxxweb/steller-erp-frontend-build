import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

function QrSerialImage({ serialNumber, size = 140, className = '' }) {
  const [dataUrl, setDataUrl] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!serialNumber?.trim()) {
      setDataUrl('');
      setError(true);
      return undefined;
    }

    let cancelled = false;
    QRCode.toDataURL(serialNumber.trim(), {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size,
      color: { dark: '#0a0a0a', light: '#ffffff' },
    })
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
  }, [serialNumber, size]);

  if (error || !dataUrl) {
    return (
      <div
        className={`flex items-center justify-center rounded-stellar-md border border-dashed border-stellar-border bg-stellar-surface-muted text-xs text-stellar-text-muted ${className}`}
        style={{ width: size, height: size }}
      >
        No serial
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code for ${serialNumber}`}
      width={size}
      height={size}
      className={`rounded-stellar-md border border-stellar-border bg-white ${className}`}
    />
  );
}

export default QrSerialImage;

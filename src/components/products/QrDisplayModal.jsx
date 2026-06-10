import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

function QrDisplayModal({ unit, qr, open, onClose }) {
  if (!open) return null;

  const dataUrl = qr?.dataUrl || unit?.qrCode;
  const payload = qr?.payload || unit?.qrPayload;
  const serial = unit?.serialNumber;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-stellar-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <Card variant="elevated" className="relative z-10 w-full max-w-sm !p-stellar-6">
        <h2 id="qr-modal-title" className="text-lg font-semibold text-stellar-text">
          Unit QR code
        </h2>
        {serial && (
          <p className="mt-stellar-1 font-mono text-sm text-stellar-text-muted">{serial}</p>
        )}
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR for ${serial}`}
            className="mx-auto mt-stellar-4 w-full max-w-[240px] rounded-stellar-lg"
          />
        ) : (
          <p className="mt-stellar-4 text-sm text-stellar-text-muted">QR not available</p>
        )}
        {payload && (
          <p className="mt-stellar-3 break-all text-center text-xs text-stellar-text-subtle">
            {payload}
          </p>
        )}
        <div className="mt-stellar-6 flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default QrDisplayModal;

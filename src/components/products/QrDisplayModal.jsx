import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { ModalShell } from '../ui/Modal.jsx';

function QrDisplayModal({ unit, qr, open, onClose }) {
  if (!open) return null;

  const dataUrl = qr?.dataUrl || unit?.qrCode;
  const payload = qr?.payload || unit?.qrPayload;
  const serial = unit?.serialNumber;

  return (
    <ModalShell onClose={onClose} aria-labelledby="qr-modal-title" overlayClassName="p-stellar-4">
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
    </ModalShell>
  );
}

export default QrDisplayModal;

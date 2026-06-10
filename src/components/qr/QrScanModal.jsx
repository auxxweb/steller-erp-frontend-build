import { useEffect, useState } from 'react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import QrScanner from './QrScanner.jsx';

/**
 * Single-camera QR scan dialog. Scanner mounts only while open.
 */
function QrScanModal({ open, title = 'Scan QR code', hint, onClose, onScan }) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) setBusy(false);
  }, [open]);

  if (!open) return null;

  const handleScan = async (value) => {
    if (busy) return;
    setBusy(true);
    try {
      await onScan?.(value);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open title={title} onClose={onClose} className="max-w-md">
      <div className="mt-stellar-4 space-y-stellar-4">
        {hint && <p className="text-sm text-stellar-text-muted">{hint}</p>}
        <QrScanner key="qr-scan-modal" onScan={handleScan} paused={busy} />
        <Button type="button" variant="secondary" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}

export default QrScanModal;

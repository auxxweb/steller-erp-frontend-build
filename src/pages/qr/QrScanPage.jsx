import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useCallback, useState } from 'react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import QrScanner from '../../components/qr/QrScanner.jsx';
import QrVerifyCard from '../../components/qr/QrVerifyCard.jsx';
import QrActionPanel from '../../components/qr/QrActionPanel.jsx';
import { verifyQr, executeQrScan } from '../../services/qrService.js';
import useProductBasePath from '../../hooks/useProductBasePath.js';

const SCAN_COOLDOWN_MS = 2500;

function QrScanPage() {
  const productBasePath = useProductBasePath();
  const [mode, setMode] = useState('camera');
  const [manualValue, setManualValue] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [paused, setPaused] = useState(false);
      const [notes, setNotes] = useState('');
  const [lastScanned, setLastScanned] = useState('');

  const runVerify = useCallback(async (scannedValue) => {
    if (!scannedValue?.trim()) return;
    setLastScanned(scannedValue.trim());
    setLoading(true);
    setPaused(true);
    try {
      const { data } = await verifyQr(scannedValue.trim());
      setVerifyResult(data.data);
    } catch (err) {
      setVerifyResult(null);
      toast.error(err.response?.data?.message || 'QR verification failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleScan = useCallback(
    (value) => {
      runVerify(value);
      setTimeout(() => setPaused(false), SCAN_COOLDOWN_MS);
    },
    [runVerify],
  );

  const handleManualVerify = (e) => {
    e.preventDefault();
    runVerify(manualValue);
  };

  const handleAction = async (action) => {
    const value =
      lastScanned ||
      manualValue.trim() ||
      verifyResult?.unit?.qrPayload ||
      (verifyResult?.unit?.id ? `stellar://unit/${verifyResult.unit.id}` : '');

    if (!value) {
      toast.error('Scan or enter a code first');
      return;
    }

    setActionLoading(true);
    try {
      const { data } = await executeQrScan(value, action, { notes: notes.trim() || undefined });
      toast.success(data.message);
      setVerifyResult((prev) =>
        prev
          ? {
              ...prev,
              unit: data.data.unit,
              allowedActions: data.data.allowedActions,
            }
          : null,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const resetScan = () => {
    setVerifyResult(null);
    setManualValue('');
    setLastScanned('');
    setNotes('');
    setPaused(false);
  };

  return (
    <div className="animate-fade-up opacity-0-start mx-auto max-w-lg space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">QR scan</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Scan unit labels for pickup, return, transfer, or maintenance.
        </p>
      </div>
            <div className="flex gap-stellar-2 rounded-full bg-stellar-surface-muted p-1">
        <button
          type="button"
          className={`flex-1 rounded-full py-stellar-2 text-sm font-medium transition-stellar ${
            mode === 'camera' ? 'bg-stellar-accent text-stellar-accent-fg' : 'text-stellar-text-muted'
          }`}
          onClick={() => setMode('camera')}
        >
          Camera
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full py-stellar-2 text-sm font-medium transition-stellar ${
            mode === 'manual' ? 'bg-stellar-accent text-stellar-accent-fg' : 'text-stellar-text-muted'
          }`}
          onClick={() => setMode('manual')}
        >
          Manual
        </button>
      </div>

      {!verifyResult && mode === 'camera' && (
        <QrScanner onScan={handleScan} paused={paused || loading} />
      )}

      {!verifyResult && mode === 'manual' && (
        <Card variant="muted" className="!p-stellar-5">
          <form onSubmit={handleManualVerify} className="space-y-stellar-4">
            <div className="form-group">
              <label htmlFor="manual-qr" className="form-label">
                QR payload or unit ID
              </label>
              <input
                id="manual-qr"
                className="input font-mono text-sm"
                placeholder="stellar://unit/… or serial"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
              />
            </div>
            <Button type="submit" isLoading={loading} className="w-full">
              Verify
            </Button>
          </form>
        </Card>
      )}

      {loading && (
        <p className="text-center text-sm text-stellar-text-muted">Verifying…</p>
      )}

      {verifyResult && (
        <>
          <QrVerifyCard result={verifyResult} productBasePath={productBasePath} />

          <div className="form-group">
            <label htmlFor="scan-notes" className="form-label">
              Notes (optional)
            </label>
            <input
              id="scan-notes"
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Rental ref, transfer note…"
            />
          </div>

          <QrActionPanel
            allowedActions={verifyResult.allowedActions}
            onAction={handleAction}
            loading={loading}
            actionLoading={actionLoading}
          />

          <Button type="button" variant="secondary" className="w-full" onClick={resetScan}>
            Scan another unit
          </Button>
        </>
      )}
    </div>
  );
}

export default QrScanPage;

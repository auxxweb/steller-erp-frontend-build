import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoiceRedirect } from '../../hooks/useInvoiceRedirect.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalQueuePicker from '../../components/rentals/RentalQueuePicker.jsx';
import RentalQrChecklist from '../../components/rentals/RentalQrChecklist.jsx';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import { fetchRentals, fetchRental, returnRental } from '../../services/rentalService.js';
import { RETURN_STATUSES } from '../../utils/rentalConstants.js';
import { formatDate } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function RentalReturnPage() {
  const basePath = useRentalBasePath();
  const { goToInvoiceAfterReturn } = useInvoiceRedirect();
  const [queue, setQueue] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scansReady, setScansReady] = useState(false);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchRentals({
        status: RETURN_STATUSES.join(','),
        limit: 50,
        sortBy: 'scheduledEndAt',
        sortOrder: 'asc',
      });
      setQueue(data.data.rentals);
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    setScansReady(false);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setSendToMaintenance(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchRental(selectedId);
        if (!cancelled) setDetail(data.data);
      } catch {
        if (!cancelled) setDetail(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleScannedChange = useCallback((_scannedIds, ready) => {
    setScansReady(Boolean(ready));
  }, []);

  const handleReturn = async () => {
    if (!selectedId || !scansReady) return;
    setSubmitting(true);
    try {
      const { data } = await returnRental(selectedId, {
        sendUnitsToMaintenance: sendToMaintenance,
      });
      toast.success(data.message || 'Return completed');
      setSelectedId('');
      setDetail(null);
      setSendToMaintenance(false);
      setScansReady(false);
      loadQueue();
      goToInvoiceAfterReturn(data, { partial: data.data?.partial });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Return failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Return</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Select an active rental from the queue, verify returned units, then confirm and open the
          invoice.
        </p>
      </div>

      <RentalNav />

      <div className="grid gap-stellar-6 lg:grid-cols-5">
        <Card className="!p-stellar-5 lg:col-span-2">
          <h2 className="mb-stellar-4 text-sm font-semibold text-stellar-text">Return queue</h2>
          <RentalQueuePicker
            rentals={queue}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            emptyMessage="No rentals due for return."
            searchPlaceholder="Search booking #, customer…"
            dateField="scheduledEndAt"
            dateLabel="Due"
          />
        </Card>

        <div className="lg:col-span-3">
          {!detail && (
            <Card className="flex min-h-[280px] flex-col items-center justify-center !p-stellar-8 text-center">
              <p className="text-sm font-medium text-stellar-text">Select a rental</p>
              <p className="mt-stellar-1 max-w-sm text-sm text-stellar-text-muted">
                Pick a booking from the return queue to check in gear and generate the invoice.
              </p>
            </Card>
          )}

          {detail && (
            <Card className="!p-stellar-5 space-y-stellar-5">
              <div className="flex items-start justify-between gap-stellar-3 border-b border-stellar-border pb-stellar-4">
                <div>
                  <Link
                    to={`${basePath}/${detail.rental.id}`}
                    className="text-lg font-semibold text-stellar-text hover:underline"
                  >
                    {detail.rental.rentalNumber}
                  </Link>
                  <p className="text-sm text-stellar-text">{detail.rental.customer?.name}</p>
                  <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                    Due {formatDate(detail.rental.scheduledEndAt)}
                  </p>
                </div>
                <RentalStatusBadge status={detail.rental.status} />
              </div>

              <RentalQrChecklist items={detail.items || []} onScannedChange={handleScannedChange} />

              <label className="flex items-center gap-stellar-2 rounded-stellar-lg border border-stellar-border bg-stellar-surface-muted/40 p-stellar-4 text-sm">
                <input
                  type="checkbox"
                  checked={sendToMaintenance}
                  onChange={(e) => setSendToMaintenance(e.target.checked)}
                  className="h-4 w-4 accent-stellar-accent"
                />
                <span>
                  Send units to maintenance after return
                  <span className="mt-0.5 block text-xs text-stellar-text-muted">
                    Use when gear needs inspection before going back on rent.
                  </span>
                </span>
              </label>

              <Button
                type="button"
                className="w-full"
                disabled={submitting || !scansReady}
                onClick={handleReturn}
              >
                {submitting
                  ? 'Processing…'
                  : scansReady
                    ? 'Confirm return & open invoice'
                    : 'Scan all units to confirm return'}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default RentalReturnPage;

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoiceRedirect } from '../../hooks/useInvoiceRedirect.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
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
    if (!selectedId) {
      setDetail(null);
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

  const handleReturn = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const { data } = await returnRental(selectedId, {
        sendUnitsToMaintenance: sendToMaintenance,
      });
      toast.success(data.message || 'Return completed');
      setSelectedId('');
      setDetail(null);
      setSendToMaintenance(false);
      loadQueue();
      goToInvoiceAfterReturn(data, { partial: data.data?.partial });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Return failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start mx-auto max-w-2xl space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Return</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Direct and prebook rentals: scan returned units, confirm return, then complete the
          invoice.
        </p>
      </div>

      <RentalNav />

      <Card className="!p-stellar-4">
        <label htmlFor="return-select" className="form-label">
          Booking to return
        </label>
        <select
          id="return-select"
          className="input"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={loading}
        >
          <option value="">Select booking…</option>
          {queue.map((r) => (
            <option key={r.id} value={r.id}>
              {r.rentalNumber} — {r.customer?.name}
            </option>
          ))}
        </select>
      </Card>

      {detail && (
        <Card className="!p-stellar-5 space-y-stellar-5">
          <div className="flex items-start justify-between gap-stellar-3">
            <div>
              <Link
                to={`${basePath}/${detail.rental.id}`}
                className="font-semibold text-stellar-text hover:underline"
              >
                {detail.rental.rentalNumber}
              </Link>
              <p className="text-sm text-stellar-text-muted">
                Due {formatDate(detail.rental.scheduledEndAt)}
              </p>
            </div>
            <RentalStatusBadge status={detail.rental.status} />
          </div>

          <RentalQrChecklist items={detail.items || []} />

          <label className="flex items-center gap-stellar-2 text-sm">
            <input
              type="checkbox"
              checked={sendToMaintenance}
              onChange={(e) => setSendToMaintenance(e.target.checked)}
              className="h-4 w-4 accent-stellar-accent"
            />
            Send units to maintenance after return
          </label>

          <Button
            type="button"
            className="w-full"
            disabled={submitting}
            onClick={handleReturn}
          >
            {submitting ? 'Processing…' : 'Confirm return & open invoice'}
          </Button>
        </Card>
      )}
    </div>
  );
}

export default RentalReturnPage;

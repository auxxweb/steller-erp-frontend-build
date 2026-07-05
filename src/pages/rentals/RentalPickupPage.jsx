import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalQueuePicker from '../../components/rentals/RentalQueuePicker.jsx';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import RentalQrChecklist from '../../components/rentals/RentalQrChecklist.jsx';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import { fetchRentals, fetchRental, pickupRental } from '../../services/rentalService.js';
import { PICKUP_STATUSES, RENTAL_STATUS, RENTAL_TYPE } from '../../utils/rentalConstants.js';
import { formatDate } from '../../utils/format.js';

function RentalPickupPage() {
  const basePath = useRentalBasePath();
  const [queue, setQueue] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scansReady, setScansReady] = useState(false);
  const [unitAssignments, setUnitAssignments] = useState([]);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchRentals({
        status: PICKUP_STATUSES.join(','),
        rentalType: RENTAL_TYPE.PREBOOK,
        limit: 50,
        sortBy: 'scheduledStartAt',
        sortOrder: 'asc',
      });
      setQueue(
        (data.data.rentals || []).filter((r) => r.rentalType === RENTAL_TYPE.PREBOOK),
      );
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
    setUnitAssignments([]);
    setScansReady(false);
  }, [selectedId]);

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

  const handleScannedChange = useCallback((_scannedIds, ready) => {
    setScansReady(Boolean(ready));
  }, []);

  const handlePickup = async () => {
    if (!selectedId || !scansReady) return;
    setSubmitting(true);
    try {
      const { data } = await pickupRental(selectedId, {
        activate: true,
        unitAssignments,
      });
      toast.success(data.message || 'Pickup completed');
      setSelectedId('');
      setDetail(null);
      loadQueue();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Pickup failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stellar-text">Prebook pickup</h1>
        <p className="mt-stellar-1 text-sm text-stellar-text-muted">
          Pick a reservation from the queue, assign serials by tapping or scanning QR, then confirm
          pickup.
        </p>
      </div>

      <RentalNav />

      <div className="grid gap-stellar-6 lg:grid-cols-5">
        <Card className="!p-stellar-5 lg:col-span-2">
          <h2 className="mb-stellar-4 text-sm font-semibold text-stellar-text">Pickup queue</h2>
          <RentalQueuePicker
            rentals={queue}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            emptyMessage="No prebook pickups pending."
            dateField="scheduledStartAt"
            dateLabel="Pickup"
          />
        </Card>

        <div className="lg:col-span-3">
          {!detail && (
            <Card className="flex min-h-[280px] flex-col items-center justify-center !p-stellar-8 text-center">
              <p className="text-sm font-medium text-stellar-text">Select a booking</p>
              <p className="mt-stellar-1 max-w-sm text-sm text-stellar-text-muted">
                Choose a reservation from the queue to assign serial numbers and complete pickup.
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
                    Scheduled pickup {formatDate(detail.rental.scheduledStartAt)}
                  </p>
                </div>
                <RentalStatusBadge status={detail.rental.status} />
              </div>

              <RentalQrChecklist
                items={detail.items || []}
                onScannedChange={handleScannedChange}
                onAssignmentsChange={setUnitAssignments}
              />

              <Button
                type="button"
                className="w-full"
                disabled={
                  submitting ||
                  !scansReady ||
                  ![RENTAL_STATUS.RESERVED, RENTAL_STATUS.CONFIRMED].includes(detail.rental.status)
                }
                onClick={handlePickup}
              >
                {submitting
                  ? 'Processing…'
                  : scansReady
                    ? 'Confirm pickup'
                    : 'Assign and scan all units first'}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default RentalPickupPage;

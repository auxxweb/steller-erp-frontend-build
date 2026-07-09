import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalListFilters from '../../components/rentals/RentalListFilters.jsx';
import RentalQueuePicker from '../../components/rentals/RentalQueuePicker.jsx';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import RentalQrChecklist from '../../components/rentals/RentalQrChecklist.jsx';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import useRentalList from '../../hooks/useRentalList.js';
import { fetchRental, pickupRental } from '../../services/rentalService.js';
import {
  PICKUP_STATUSES,
  PREBOOK_PICKUP_QUEUE_STATUSES,
  RENTAL_STATUS,
  RENTAL_STATUS_OPTIONS,
  RENTAL_TYPE,
} from '../../utils/rentalConstants.js';
import { formatDate } from '../../utils/format.js';

const PICKUP_STATUS_OPTIONS = RENTAL_STATUS_OPTIONS.filter((opt) =>
  PREBOOK_PICKUP_QUEUE_STATUSES.includes(opt.value),
);

function RentalPickupPage() {
  const basePath = useRentalBasePath();
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [scansReady, setScansReady] = useState(false);
  const [unitAssignments, setUnitAssignments] = useState([]);

  const {
    rentals: queue,
    pagination,
    page,
    setPage,
    loading,
    search,
    setSearch,
    submitSearch,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    statusFilter,
    setStatusFilter,
    resetPage,
    reload,
  } = useRentalList({
    defaultStatuses: PREBOOK_PICKUP_QUEUE_STATUSES,
    rentalType: RENTAL_TYPE.PREBOOK,
    sortBy: 'scheduledStartAt',
    sortOrder: 'asc',
    limit: 15,
    dateField: 'scheduledStartAt',
  });

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
      reload();
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
        <Card className="!p-stellar-5 lg:col-span-2 space-y-stellar-4">
          <h2 className="text-sm font-semibold text-stellar-text">Pickup queue</h2>
          <RentalListFilters
            idPrefix="rental-pickup"
            search={search}
            onSearchChange={setSearch}
            onSearchSubmit={() => {
              submitSearch();
              resetPage();
            }}
            period={period}
            onPeriodChange={(v) => {
              setPeriod(v);
              resetPage();
            }}
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            statusFilter={statusFilter}
            onStatusChange={(v) => {
              setStatusFilter(v);
              resetPage();
            }}
            statusOptions={PICKUP_STATUS_OPTIONS}
            allStatusLabel="All pickup statuses"
          />
          <RentalQueuePicker
            rentals={queue}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            emptyMessage="No prebook bookings found."
            dateField="scheduledStartAt"
            dateLabel="Pickup"
            hideSearch
          />
          <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
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

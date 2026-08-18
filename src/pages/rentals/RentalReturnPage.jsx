import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoiceRedirect } from '../../hooks/useInvoiceRedirect.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import PaginationBar from '../../components/ui/PaginationBar.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalListFilters from '../../components/rentals/RentalListFilters.jsx';
import RentalQueuePicker from '../../components/rentals/RentalQueuePicker.jsx';
import RentalReturnChecklist from '../../components/rentals/RentalReturnChecklist.jsx';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge.jsx';
import useRentalBasePath from '../../hooks/useRentalBasePath.js';
import useRentalList from '../../hooks/useRentalList.js';
import { fetchRental, returnRental } from '../../services/rentalService.js';
import { RETURN_STATUSES, RENTAL_STATUS_OPTIONS } from '../../utils/rentalConstants.js';
import { formatDate } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import Modal from '../../components/ui/Modal.jsx';

const RETURN_STATUS_OPTIONS = RENTAL_STATUS_OPTIONS.filter((opt) =>
  RETURN_STATUSES.includes(opt.value),
);

function RentalReturnPage() {
  const basePath = useRentalBasePath();
  const { goToInvoiceAfterReturn } = useInvoiceRedirect();
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [sendToMaintenance, setSendToMaintenance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState({
    allScanned: false,
    scannedCount: 0,
    total: 0,
  });
  const [notesOpen, setNotesOpen] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');

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
    defaultStatuses: RETURN_STATUSES,
    sortBy: 'scheduledEndAt',
    sortOrder: 'asc',
    limit: 15,
    dateField: 'scheduledEndAt',
    requireStarted: true,
  });

  useEffect(() => {
    setVerification({ allScanned: false, scannedCount: 0, total: 0 });
    setReturnNotes('');
    setNotesOpen(false);
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

  const handleVerificationChange = useCallback((next) => {
    setVerification(next);
  }, []);

  const submitReturn = async ({ verifiedByScan, notes }) => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const { data } = await returnRental(selectedId, {
        sendUnitsToMaintenance: sendToMaintenance,
        verifiedByScan,
        notes,
      });
      toast.success(data.message || 'Return completed');
      setSelectedId('');
      setDetail(null);
      setSendToMaintenance(false);
      setNotesOpen(false);
      setReturnNotes('');
      reload();
      goToInvoiceAfterReturn(data, { partial: data.data?.partial });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Return failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmReturn = () => {
    if (!selectedId) return;
    if (verification.allScanned) {
      submitReturn({
        verifiedByScan: true,
        notes: 'Verified by QR scan',
      });
      return;
    }
    setNotesOpen(true);
  };

  const handleManualReturn = () => {
    if (returnNotes.trim().length < 3) {
      toast.error('Enter notes to confirm manual verification');
      return;
    }
    submitReturn({
      verifiedByScan: false,
      notes: returnNotes.trim(),
    });
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
        <Card className="!p-stellar-5 lg:col-span-2 space-y-stellar-4">
          <h2 className="text-sm font-semibold text-stellar-text">Return queue</h2>
          <RentalListFilters
            idPrefix="rental-return"
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
            statusOptions={RETURN_STATUS_OPTIONS}
            allStatusLabel="All return statuses"
          />
          <RentalQueuePicker
            rentals={queue}
            selectedId={selectedId}
            onSelect={setSelectedId}
            loading={loading}
            emptyMessage="No rentals due for return."
            dateField="scheduledEndAt"
            dateLabel="Due"
            hideSearch
          />
          <PaginationBar pagination={pagination} page={page} onPageChange={setPage} />
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

              <RentalReturnChecklist
                items={detail.items || []}
                onVerificationChange={handleVerificationChange}
                startAt={detail.rental.scheduledStartAt}
                endAt={detail.rental.scheduledEndAt}
                excludeRentalId={detail.rental.id}
              />

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
                disabled={submitting}
                onClick={handleConfirmReturn}
              >
                {submitting
                  ? 'Processing…'
                  : verification.allScanned
                    ? 'Confirm scanned return'
                    : 'Return without scan'}
              </Button>
            </Card>
          )}

          <Modal
            open={notesOpen}
            title="Manually verified?"
            onClose={() => !submitting && setNotesOpen(false)}
          >
            <p className="mt-stellar-2 text-sm text-stellar-text-muted">
              Serials were not scanned. Confirm you visually checked the returned gear, then add a
              note to complete the return.
            </p>
            <textarea
              className="input mt-stellar-4 min-h-[120px] w-full"
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              placeholder="e.g. All serials checked by hand, body and lens returned…"
            />
            <div className="mt-stellar-4 flex justify-end gap-stellar-2">
              <Button
                type="button"
                variant="secondary"
                disabled={submitting}
                onClick={() => setNotesOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={submitting || returnNotes.trim().length < 3}
                onClick={handleManualReturn}
              >
                {submitting ? 'Processing…' : 'Yes, manually verified'}
              </Button>
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}

export default RentalReturnPage;

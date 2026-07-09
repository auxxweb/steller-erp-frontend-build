import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useInvoiceRedirect } from '../../hooks/useInvoiceRedirect.js';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import RentalNav from '../../components/rentals/RentalNav.jsx';
import RentalStatusBadge from '../../components/rentals/RentalStatusBadge.jsx';
import RentalTimeline from '../../components/rentals/RentalTimeline.jsx';
import useRentalBasePath, { useCanOperateRentals } from '../../hooks/useRentalBasePath.js';
import { cancelRental, fetchRental } from '../../services/rentalService.js';
import { RENTAL_STATUS, RENTAL_TYPE } from '../../utils/rentalConstants.js';
import { formatUnitSerialLabel } from '../../utils/productConstants.js';
import { formatDate } from '../../utils/format.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function formatMoney(val) {
  if (val == null) return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function RentalDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const basePath = useRentalBasePath();
  const { canOpenInvoice, invoiceBasePath } = useInvoiceRedirect();
  const canOperate = useCanOperateRentals();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state?.message]);

  const load = async () => {
    setLoading(true);
    setLoadFailed(false);
    try {
      const res = await fetchRental(id);
      setData(res.data.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Booking not found'));
      setData(null);
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading booking…</p>;
  }

  if (loadFailed || (!loading && !data)) {
    return (
      <div>
        <Link to={basePath} className="mt-stellar-4 inline-block text-sm">
          ← Rentals
        </Link>
      </div>
    );
  }

  const { rental, items = [] } = data;
  const status = rental.status;
  const isPrebook = rental.rentalType === RENTAL_TYPE.PREBOOK;
  const canCancelPrebook =
    isPrebook &&
    [RENTAL_STATUS.DRAFT, RENTAL_STATUS.RESERVED, RENTAL_STATUS.CONFIRMED].includes(status) &&
    canOperate;

  const handleCancelPrebook = async () => {
    const reason = window.prompt('Reason for cancelling this pre-booking?');
    if (!reason?.trim()) return;

    setCancelling(true);
    try {
      await cancelRental(id, reason.trim());
      toast.success('Pre-booking cancelled');
      await load();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to cancel pre-booking'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link to={basePath} className="text-sm text-stellar-text-muted">
            ← Rentals
          </Link>
          <div className="mt-stellar-2 flex flex-wrap items-center gap-stellar-3">
            <h1 className="text-xl font-semibold sm:text-2xl">{rental.rentalNumber}</h1>
            <RentalStatusBadge status={status} />
          </div>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            {rental.customer?.name} · {rental.customer?.phone}
            {isPrebook ? ' · Prebook' : ' · Direct rental'}
          </p>
        </div>
        <div className="flex flex-wrap gap-stellar-2">
          {isPrebook &&
            [RENTAL_STATUS.RESERVED, RENTAL_STATUS.CONFIRMED].includes(status) &&
            canOperate && (
              <Link to={`${basePath}/pickup`} className="btn btn-primary btn-md">
                Go to pickup
              </Link>
            )}
          {canCancelPrebook && (
            <Button
              type="button"
              variant="danger"
              className="btn-md"
              disabled={cancelling}
              onClick={handleCancelPrebook}
            >
              {cancelling ? 'Cancelling…' : 'Cancel pre-booking'}
            </Button>
          )}
          {[
            RENTAL_STATUS.ACTIVE,
            RENTAL_STATUS.OVERDUE,
            RENTAL_STATUS.PICKED_UP,
            RENTAL_STATUS.PARTIALLY_RETURNED,
          ].includes(status) &&
            canOperate && (
              <Link to={`${basePath}/return`} className="btn btn-primary btn-md">
                Go to return
              </Link>
            )}
          {rental.invoice && canOpenInvoice && (
            <Link
              to={`${invoiceBasePath}/${rental.invoice?.id || rental.invoice}`}
              className="btn btn-secondary btn-md"
            >
              {status === RENTAL_STATUS.RETURNED ? 'Complete invoice' : 'View invoice'}
            </Link>
          )}
        </div>
      </div>

      <RentalNav />

      <div className="grid gap-stellar-6 lg:grid-cols-2">
        <Card variant="muted" className="!p-stellar-5">
          <h2 className="text-sm font-semibold">Schedule</h2>
          <dl className="mt-stellar-4 space-y-stellar-2 text-sm">
            <div className="flex justify-between gap-stellar-4">
              <dt className="text-stellar-text-muted">From</dt>
              <dd>{formatDate(rental.scheduledStartAt)}</dd>
            </div>
            <div className="flex justify-between gap-stellar-4">
              <dt className="text-stellar-text-muted">Until</dt>
              <dd>{formatDate(rental.scheduledEndAt)}</dd>
            </div>
            {rental.pickedUpAt && (
              <div className="flex justify-between gap-stellar-4">
                <dt className="text-stellar-text-muted">Picked up</dt>
                <dd>{formatDate(rental.pickedUpAt)}</dd>
              </div>
            )}
            {rental.reservationExpiresAt && status === RENTAL_STATUS.RESERVED && (
              <div className="flex justify-between gap-stellar-4">
                <dt className="text-stellar-text-muted">Reservation expires</dt>
                <dd>{formatDate(rental.reservationExpiresAt)}</dd>
              </div>
            )}
          </dl>
        </Card>

        <Card variant="muted" className="!p-stellar-5">
          <h2 className="text-sm font-semibold">Amounts</h2>
          <dl className="mt-stellar-4 space-y-stellar-2 text-sm">
            <div className="flex justify-between gap-stellar-4">
              <dt className="text-stellar-text-muted">Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(rental.amounts?.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-stellar-4">
              <dt className="text-stellar-text-muted">Tax</dt>
              <dd className="tabular-nums">{formatMoney(rental.amounts?.tax)}</dd>
            </div>
            <div className="flex justify-between gap-stellar-4 font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(rental.amounts?.total)}</dd>
            </div>
            {(rental.amounts?.deposit ?? 0) > 0 && (
              <>
                <div className="flex justify-between gap-stellar-4">
                  <dt className="text-stellar-text-muted">Advance paid</dt>
                  <dd className="tabular-nums">−{formatMoney(rental.amounts.deposit)}</dd>
                </div>
                <div className="flex justify-between gap-stellar-4 font-medium text-stellar-accent">
                  <dt>Balance due</dt>
                  <dd className="tabular-nums">{formatMoney(rental.amounts?.balanceDue)}</dd>
                </div>
              </>
            )}
          </dl>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="border-b border-stellar-border p-stellar-4">
          <h2 className="text-sm font-semibold">Line items</h2>
        </div>
        <ul className="divide-y divide-stellar-border">
          {items.map((item) => (
            <li key={item.id} className="p-stellar-4">
              <div className="flex flex-col gap-stellar-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-stellar-text">{item.product?.name}</p>
                  <p className="text-xs text-stellar-text-muted">
                    {item.product?.sku}
                    {item.productUnit && ` · ${formatUnitSerialLabel(item.productUnit)}`}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="tabular-nums">{formatMoney(item.lineTotal)}</p>
                  <p className="text-xs capitalize text-stellar-text-muted">{item.status}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card variant="muted" className="!p-stellar-5">
        <h2 className="text-sm font-semibold">Workflow timeline</h2>
        <div className="mt-stellar-4">
          <RentalTimeline rentalId={id} />
        </div>
      </Card>
    </div>
  );
}

export default RentalDetailPage;

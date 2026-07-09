import { useMemo, useState } from 'react';
import SearchField from '../ui/SearchField.jsx';
import RentalStatusBadge from './RentalStatusBadge.jsx';
import { formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

function matchesSearch(rental, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const fields = [
    rental.rentalNumber,
    rental.customer?.name,
    rental.customer?.phone,
    rental.combo?.name,
    rental.combo?.code,
    rental.branch?.name,
    rental.branch?.code,
  ];
  return fields.some((f) => f && String(f).toLowerCase().includes(q));
}

function RentalQueuePicker({
  rentals = [],
  selectedId = '',
  onSelect,
  loading = false,
  emptyMessage = 'Nothing in the queue.',
  searchPlaceholder = 'Search by booking #, customer, phone…',
  dateField = 'scheduledStartAt',
  dateLabel = 'Pickup',
  hideSearch = false,
}) {
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  const filtered = useMemo(
    () => (hideSearch ? rentals : rentals.filter((r) => matchesSearch(r, appliedSearch.trim()))),
    [rentals, appliedSearch, hideSearch],
  );

  return (
    <div className="flex flex-col gap-stellar-3">
      {!hideSearch && (
        <SearchField
          id="rental-queue-search"
          label="Find booking"
          value={search}
          onChange={setSearch}
          onSearch={() => setAppliedSearch(search)}
          placeholder={searchPlaceholder}
          disabled={loading}
        />
      )}

      <div
        className="max-h-[min(420px,50vh)] overflow-y-auto rounded-stellar-xl border border-stellar-border bg-stellar-surface-muted/30"
        role="listbox"
        aria-label="Booking queue"
      >
        {loading && (
          <p className="p-stellar-5 text-center text-sm text-stellar-text-muted">Loading queue…</p>
        )}

        {!loading && rentals.length === 0 && (
          <p className="p-stellar-5 text-center text-sm text-stellar-text-muted">{emptyMessage}</p>
        )}

        {!loading && rentals.length > 0 && !hideSearch && filtered.length === 0 && (
          <p className="p-stellar-5 text-center text-sm text-stellar-text-muted">
            No bookings match &ldquo;{appliedSearch}&rdquo;
          </p>
        )}

        {!loading &&
          filtered.map((rental) => {
            const selected = rental.id === selectedId;
            const dateValue = rental[dateField];

            return (
              <button
                key={rental.id}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onSelect?.(rental.id)}
                className={cn(
                  'flex w-full flex-col gap-stellar-1 border-b border-stellar-border px-stellar-4 py-stellar-3 text-left transition-stellar last:border-b-0 sm:flex-row sm:items-center sm:justify-between',
                  selected
                    ? 'bg-stellar-accent/10 ring-1 ring-inset ring-stellar-accent/30'
                    : 'hover:bg-stellar-surface-muted/60',
                )}
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold text-stellar-text">
                    {rental.rentalNumber}
                  </p>
                  <p className="truncate text-sm text-stellar-text-muted">
                    {rental.customer?.name}
                    {rental.customer?.phone ? ` · ${rental.customer.phone}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-stellar-2">
                  <RentalStatusBadge status={rental.status} />
                  {dateValue && (
                    <span className="text-xs text-stellar-text-muted">
                      {dateLabel}: {formatDate(dateValue)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
      </div>

      {!loading && rentals.length > 0 && (
        <p className="text-xs text-stellar-text-muted">
          {hideSearch
            ? `${rentals.length} booking${rentals.length === 1 ? '' : 's'}`
            : appliedSearch.trim()
              ? `${filtered.length} of ${rentals.length} bookings`
              : `${rentals.length} booking${rentals.length === 1 ? '' : 's'}`}
        </p>
      )}
    </div>
  );
}

export default RentalQueuePicker;

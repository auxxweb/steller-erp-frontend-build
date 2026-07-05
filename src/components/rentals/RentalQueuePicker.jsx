import { useMemo, useState } from 'react';
import Input from '../ui/Input.jsx';
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
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => rentals.filter((r) => matchesSearch(r, search.trim())),
    [rentals, search],
  );

  return (
    <div className="flex flex-col gap-stellar-3">
      <Input
        label="Find booking"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={searchPlaceholder}
        disabled={loading}
        autoComplete="off"
      />

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

        {!loading && rentals.length > 0 && filtered.length === 0 && (
          <p className="p-stellar-5 text-center text-sm text-stellar-text-muted">
            No bookings match &ldquo;{search}&rdquo;
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
                onClick={() => onSelect(selected ? '' : rental.id)}
                className={cn(
                  'flex w-full items-start gap-stellar-3 border-b border-stellar-border p-stellar-4 text-left transition-stellar last:border-b-0',
                  selected
                    ? 'bg-stellar-accent/10 ring-2 ring-inset ring-stellar-accent'
                    : 'hover:bg-stellar-surface',
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    selected
                      ? 'border-stellar-accent bg-stellar-accent text-white'
                      : 'border-stellar-border bg-stellar-surface',
                  )}
                  aria-hidden
                >
                  {selected && (
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M10.28 2.28 4.5 8.06 1.72 5.28l-.94.94 3.72 3.72 6.78-6.78-.94-.94Z" />
                    </svg>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-stellar-2">
                    <span className="font-semibold text-stellar-text">{rental.rentalNumber}</span>
                    <RentalStatusBadge status={rental.status} />
                  </div>
                  <p className="mt-stellar-1 truncate text-sm text-stellar-text">
                    {rental.customer?.name || 'Customer'}
                  </p>
                  {rental.customer?.phone && (
                    <p className="text-xs text-stellar-text-muted">{rental.customer.phone}</p>
                  )}
                  <p className="mt-stellar-1 text-xs text-stellar-text-subtle">
                    {dateLabel} {formatDate(dateValue)}
                    {rental.combo?.name ? ` · ${rental.combo.name}` : ''}
                  </p>
                </div>
              </button>
            );
          })}
      </div>

      {!loading && rentals.length > 0 && (
        <p className="text-xs text-stellar-text-muted">
          {filtered.length} of {rentals.length} booking{rentals.length === 1 ? '' : 's'}
          {selectedId ? ' · tap again to deselect' : ''}
        </p>
      )}
    </div>
  );
}

export default RentalQueuePicker;

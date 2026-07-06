import { useEffect, useRef, useState } from 'react';
import Input from '../ui/Input.jsx';
import RiskBadge from '../customers/RiskBadge.jsx';
import { fetchCustomer, fetchCustomers } from '../../services/customerService.js';
import { formatCurrency } from '../../utils/format.js';

const MODES = {
  EXISTING: 'existing',
  NEW: 'new',
};

function RentalCustomerPicker({
  branchId,
  global = false,
  disabled = false,
  value,
  onChange,
  newCustomer,
  onNewCustomerChange,
  mode,
  onModeChange,
}) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchCustomer(value);
        if (!cancelled) setSelected(data.data.customer);
      } catch {
        if (!cancelled) setSelected(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [value, branchId]);

  useEffect(() => {
    if (mode !== MODES.EXISTING) return undefined;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!search.trim()) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await fetchCustomers({
          search: search.trim(),
          ...(global ? { global: true } : { branch: branchId || undefined }),
          limit: 20,
          status: 'active',
        });
        setResults(data.data.customers || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, branchId, disabled, mode, global]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    if (mode === MODES.NEW) {
      onChange?.('');
      setSelected(null);
      setSearch('');
      setResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset when mode toggles
  }, [mode]);

  const prevBranchRef = useRef(branchId);
  useEffect(() => {
    if (global) return;
    if (prevBranchRef.current !== branchId) {
      onChange?.('');
      setSelected(null);
      setSearch('');
      setResults([]);
    }
    prevBranchRef.current = branchId;
  }, [branchId, onChange, global]);

  const pickCustomer = (customer) => {
    setSelected(customer);
    setSearch('');
    setResults([]);
    setOpen(false);
    onChange?.(customer.id, customer);
  };

  const clearSelection = () => {
    setSelected(null);
    setSearch('');
    onChange?.('', null);
  };

  const handleModeSwitch = (next) => {
    onModeChange?.(next);
  };

  if (disabled) {
    return (
      <p className="text-sm text-stellar-text-muted">
        Customer selection is unavailable right now.
      </p>
    );
  }

  return (
    <div className="space-y-stellar-3" ref={containerRef}>
      <div className="flex flex-wrap gap-stellar-2">
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-sm transition-stellar ${
            mode === MODES.EXISTING
              ? 'bg-stellar-accent text-stellar-accent-fg'
              : 'bg-stellar-surface-muted text-stellar-text-muted hover:text-stellar-text'
          }`}
          onClick={() => handleModeSwitch(MODES.EXISTING)}
        >
          Select customer
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-sm transition-stellar ${
            mode === MODES.NEW
              ? 'bg-stellar-accent text-stellar-accent-fg'
              : 'bg-stellar-surface-muted text-stellar-text-muted hover:text-stellar-text'
          }`}
          onClick={() => handleModeSwitch(MODES.NEW)}
        >
          New customer
        </button>
      </div>

      {mode === MODES.EXISTING ? (
        <div className="relative">
          {selected ? (
            <div className="flex items-start justify-between gap-stellar-3 rounded-lg border border-stellar-border bg-stellar-surface-muted/50 p-stellar-3">
              <div className="min-w-0 space-y-stellar-2">
                <div>
                  <p className="font-medium text-stellar-text">{selected.name}</p>
                  <p className="text-sm text-stellar-text-muted">{selected.phone}</p>
                  {selected.email && (
                    <p className="text-xs text-stellar-text-muted">{selected.email}</p>
                  )}
                </div>
                <dl className="grid gap-stellar-2 sm:grid-cols-2 text-sm">
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stellar-text-muted">
                      Risk percentage
                    </dt>
                    <dd className="mt-0.5 flex flex-wrap items-center gap-stellar-2">
                      <span className="font-semibold tabular-nums text-stellar-text">
                        {Math.max(0, Math.min(100, Number(selected.riskScore) || 0))}%
                      </span>
                      {selected.riskLevel && <RiskBadge level={selected.riskLevel} />}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium uppercase tracking-wide text-stellar-text-muted">
                      Previous due
                    </dt>
                    <dd
                      className={`mt-0.5 font-semibold tabular-nums ${
                        (selected.outstandingBalance ?? 0) > 0
                          ? 'text-amber-700'
                          : 'text-stellar-text'
                      }`}
                    >
                      {formatCurrency(selected.outstandingBalance ?? 0)}
                    </dd>
                  </div>
                </dl>
              </div>
              <button
                type="button"
                className="shrink-0 text-sm text-stellar-accent hover:underline"
                onClick={clearSelection}
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <label htmlFor="rental-customer-search" className="form-label">
                Search by name or phone
              </label>
              <input
                id="rental-customer-search"
                type="search"
                className="input w-full"
                placeholder="Type name or phone number…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                autoComplete="off"
              />
              {open && search.trim() && (
                <ul
                  className="absolute z-20 mt-stellar-1 max-h-56 w-full overflow-auto rounded-lg border border-stellar-border bg-stellar-surface shadow-lg"
                  role="listbox"
                >
                  {searching && (
                    <li className="px-stellar-3 py-stellar-2 text-sm text-stellar-text-muted">
                      Searching…
                    </li>
                  )}
                  {!searching && results.length === 0 && (
                    <li className="px-stellar-3 py-stellar-2 text-sm text-stellar-text-muted">
                      No customers found. Try another search or create a new customer.
                    </li>
                  )}
                  {!searching &&
                    results.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          role="option"
                          className="w-full px-stellar-3 py-stellar-2 text-left text-sm hover:bg-stellar-surface-muted"
                          onClick={() => pickCustomer(c)}
                        >
                          <span className="font-medium text-stellar-text">{c.name}</span>
                          <span className="text-stellar-text-muted"> · {c.phone}</span>
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-stellar-4 sm:grid-cols-2">
          <Input
            label="Customer name"
            id="rental-new-customer-name"
            value={newCustomer.name}
            onChange={(e) =>
              onNewCustomerChange?.({ ...newCustomer, name: e.target.value })
            }
            required
            autoComplete="name"
          />
          <Input
            label="Phone number"
            id="rental-new-customer-phone"
            type="tel"
            value={newCustomer.phone}
            onChange={(e) =>
              onNewCustomerChange?.({ ...newCustomer, phone: e.target.value })
            }
            required
            autoComplete="tel"
          />
          <p className="sm:col-span-2 text-xs text-stellar-text-muted">
            Only name and phone are required. You can add address, ID proof, and other
            details later from the Customers section.
          </p>
        </div>
      )}
    </div>
  );
}

export { MODES as RENTAL_CUSTOMER_MODES };
export default RentalCustomerPicker;

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import SearchField from './SearchField.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Searchable dropdown — use for category, product, branch, serial, etc.
 * Keep native <select> for status and date period filters only.
 */
function SearchableSelect({
  id,
  name,
  label,
  hint,
  error,
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  disabled = false,
  required = false,
  className = '',
  wrapperClassName = '',
  emptyMessage = 'No matches',
}) {
  const autoId = useId();
  const controlId = id || name || autoId;
  const listboxId = `${controlId}-listbox`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const rootRef = useRef(null);

  const normalizedValue = value == null ? '' : String(value);

  const selected = useMemo(
    () => options.find((opt) => String(opt.value) === normalizedValue),
    [options, normalizedValue],
  );

  const filtered = useMemo(() => {
    const term = appliedQuery.trim().toLowerCase();
    if (!term) return options;
    return options.filter((opt) => {
      const haystack = `${opt.label ?? ''} ${opt.keywords ?? ''}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [options, appliedQuery]);

  const emitChange = (nextValue) => {
    onChange?.({
      target: { value: nextValue, name },
    });
  };

  const close = () => {
    setOpen(false);
    setQuery('');
    setAppliedQuery('');
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className={cn('form-group', wrapperClassName)} ref={rootRef}>
      {label && (
        <label htmlFor={controlId} className="form-label">
          {label}
          {required && <span className="text-stellar-danger"> *</span>}
        </label>
      )}

      <input type="hidden" name={name} value={normalizedValue} required={required} />

      <div className="relative">
        <button
          id={controlId}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          className={cn(
            'input flex w-full items-center justify-between gap-stellar-2 text-left',
            error && 'input-error',
            disabled && 'cursor-not-allowed opacity-60',
            className,
          )}
          onClick={() => {
            if (disabled) return;
            setOpen((v) => !v);
          }}
        >
          <span
            className={cn(
              'min-w-0 truncate',
              !selected && 'text-stellar-text-muted',
            )}
          >
            {selected?.label ?? placeholder}
          </span>
          <svg
            className={cn('h-4 w-4 shrink-0 text-stellar-text-muted transition', open && 'rotate-180')}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {open && (
          <div
            className="absolute z-50 mt-stellar-1 w-full overflow-hidden rounded-stellar-lg border border-stellar-border bg-stellar-surface shadow-lg"
            role="presentation"
          >
            <div className="border-b border-stellar-border p-stellar-2">
              <SearchField
                id={`${controlId}-search`}
                hideLabel
                value={query}
                onChange={setQuery}
                onSearch={() => setAppliedQuery(query)}
                placeholder={searchPlaceholder}
                inputClassName="text-sm"
                className="!mb-0"
              />
            </div>
            <ul
              id={listboxId}
              role="listbox"
              className="max-h-56 overflow-y-auto py-stellar-1"
            >
              {filtered.length === 0 ? (
                <li className="px-stellar-3 py-stellar-2 text-sm text-stellar-text-muted">
                  {emptyMessage}
                </li>
              ) : (
                filtered.map((opt) => {
                  const optValue = String(opt.value);
                  const isSelected = optValue === normalizedValue;
                  const isDisabled = Boolean(opt.disabled);
                  return (
                    <li key={optValue} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={isDisabled}
                        className={cn(
                          'w-full px-stellar-3 py-stellar-2 text-left text-sm',
                          isSelected && 'bg-stellar-accent/10 font-medium text-stellar-accent',
                          !isSelected && !isDisabled && 'hover:bg-stellar-surface-muted',
                          isDisabled && 'cursor-not-allowed opacity-50',
                        )}
                        onClick={() => {
                          if (isDisabled) return;
                          emitChange(opt.value);
                          close();
                        }}
                      >
                        {opt.label}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}
      </div>

      {hint && !error && <p className="form-hint">{hint}</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default SearchableSelect;

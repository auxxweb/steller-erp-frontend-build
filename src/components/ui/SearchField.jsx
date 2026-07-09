import { cn } from '../../utils/cn.js';

function SearchIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Search input with an explicit search button — queries run only when the button is pressed or Enter is hit.
 */
function SearchField({
  id,
  label = 'Search',
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search…',
  disabled = false,
  className = '',
  hideLabel = false,
  inputClassName = '',
}) {
  const triggerSearch = () => {
    if (!disabled) onSearch?.();
  };

  return (
    <div className={cn('form-group', className)}>
      {!hideLabel && label && (
        <label htmlFor={id} className="form-label">
          {label}
        </label>
      )}
      <div className="flex w-full overflow-hidden rounded-stellar-lg border border-stellar-border bg-stellar-surface focus-within:border-stellar-border-strong focus-within:ring-2 focus-within:ring-stellar-focus-ring">
        <input
          id={id}
          type="search"
          className={cn(
            'input min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none focus:ring-0',
            inputClassName,
          )}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              triggerSearch();
            }
          }}
          disabled={disabled}
          autoComplete="off"
        />
        <button
          type="button"
          className="flex shrink-0 items-center justify-center border-l border-stellar-border bg-stellar-surface-muted px-stellar-3 text-stellar-text-muted transition-stellar hover:bg-stellar-surface hover:text-stellar-text disabled:cursor-not-allowed disabled:opacity-50"
          onClick={triggerSearch}
          disabled={disabled}
          aria-label="Search"
        >
          <SearchIcon />
        </button>
      </div>
    </div>
  );
}

export { SearchIcon };
export default SearchField;

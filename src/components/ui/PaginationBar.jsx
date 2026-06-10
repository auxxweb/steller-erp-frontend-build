import Button from './Button.jsx';

function PaginationBar({ pagination, page, onPageChange, className = '' }) {
  if (!pagination || pagination.pages <= 1) return null;

  return (
    <div
      className={`flex flex-col gap-stellar-3 border-t border-stellar-border p-stellar-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <p className="text-sm text-stellar-text-muted">
        Page {pagination.page} of {pagination.pages} ({pagination.total} total)
      </p>
      <div className="flex gap-stellar-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pagination.pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default PaginationBar;

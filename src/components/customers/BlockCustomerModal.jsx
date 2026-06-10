import Button from '../ui/Button.jsx';

function BlockCustomerModal({ customer, open, loading, onConfirm, onCancel }) {
  if (!open || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-stellar-4 sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-labelledby="block-customer-title"
        className="relative w-full max-w-md rounded-t-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-6 shadow-stellar-lg sm:rounded-stellar-xl"
      >
        <h2 id="block-customer-title" className="text-lg font-semibold text-stellar-text">
          Block customer
        </h2>
        <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Block <strong>{customer.name}</strong>? They will not be able to rent until unblocked.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const reason = new FormData(e.currentTarget).get('reason');
            onConfirm(reason);
          }}
          className="mt-stellar-4 space-y-stellar-4"
        >
          <div className="form-group">
            <label htmlFor="block-reason" className="form-label">
              Reason <span className="text-stellar-danger">*</span>
            </label>
            <textarea
              id="block-reason"
              name="reason"
              required
              className="input min-h-[80px] w-full resize-y"
              placeholder="e.g. Repeated overdue returns"
            />
          </div>
          <div className="flex flex-col-reverse gap-stellar-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? 'Blocking…' : 'Block customer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BlockCustomerModal;

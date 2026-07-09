import Button from '../ui/Button.jsx';
import { ModalShell } from '../ui/Modal.jsx';

function DeleteCustomerModal({ customer, open, loading, onConfirm, onCancel }) {
  if (!open || !customer) return null;

  return (
    <ModalShell onClose={onCancel} aria-labelledby="delete-customer-title" overlayClassName="p-stellar-4">
      <div
        className="relative z-10 w-full max-w-md rounded-t-stellar-xl border border-stellar-border bg-stellar-surface p-stellar-6 shadow-stellar-lg sm:rounded-stellar-xl"
      >
        <h2 id="delete-customer-title" className="text-lg font-semibold text-stellar-text">
          Delete customer
        </h2>
        <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Remove <strong>{customer.name}</strong>? Customers with active rentals will be marked
          inactive instead.
        </p>
        <div className="mt-stellar-6 flex flex-col-reverse gap-stellar-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" disabled={loading} onClick={onConfirm}>
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

export default DeleteCustomerModal;

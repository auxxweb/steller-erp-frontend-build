import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

function DeleteBranchModal({ branch, open, loading, onConfirm, onCancel }) {
  if (!open || !branch) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-stellar-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-branch-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Close dialog"
      />
      <Card variant="elevated" className="relative z-10 w-full max-w-md !p-stellar-6">
        <h2 id="delete-branch-title" className="text-lg font-semibold text-stellar-text">
          Delete branch
        </h2>
        <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Are you sure you want to delete{' '}
          <strong className="text-stellar-text">{branch.name}</strong> ({branch.code})?
          Branches with linked users, products, or customers will be marked as closed
          instead of removed.
        </p>
        <div className="mt-stellar-6 flex justify-end gap-stellar-3">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={loading}>
            Delete
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default DeleteBranchModal;

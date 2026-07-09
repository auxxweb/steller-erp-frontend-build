import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { ModalShell } from '../ui/Modal.jsx';

function DeleteBranchModal({ branch, open, loading, onConfirm, onCancel }) {
  if (!open || !branch) return null;

  return (
    <ModalShell onClose={onCancel} aria-labelledby="delete-branch-title" overlayClassName="p-stellar-4">
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
    </ModalShell>
  );
}

export default DeleteBranchModal;

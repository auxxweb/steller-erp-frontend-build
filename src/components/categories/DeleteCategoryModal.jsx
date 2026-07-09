import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';
import { ModalShell } from '../ui/Modal.jsx';

function DeleteCategoryModal({ category, open, loading, onConfirm, onCancel }) {
  if (!open || !category) return null;

  return (
    <ModalShell onClose={onCancel} aria-labelledby="delete-category-title" overlayClassName="p-stellar-4">
      <Card variant="elevated" className="relative z-10 w-full max-w-md !p-stellar-6">
        <h2 id="delete-category-title" className="text-lg font-semibold text-stellar-text">
          Delete category
        </h2>
        <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Delete <strong className="text-stellar-text">{category.name}</strong> ({category.slug})?
          Categories linked to products will be marked inactive instead of removed.
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

export default DeleteCategoryModal;

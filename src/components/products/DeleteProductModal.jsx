import Button from '../ui/Button.jsx';
import Card from '../ui/Card.jsx';

function DeleteProductModal({ product, open, loading, onConfirm, onCancel }) {
  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-stellar-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
        aria-label="Close"
      />
      <Card variant="elevated" className="relative z-10 w-full max-w-md !p-stellar-6">
        <h2 className="text-lg font-semibold text-stellar-text">Delete product</h2>
        <p className="mt-stellar-2 text-sm text-stellar-text-muted">
          Remove <strong>{product.name}</strong> ({product.sku})? Products with units will be
          marked discontinued instead.
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

export default DeleteProductModal;

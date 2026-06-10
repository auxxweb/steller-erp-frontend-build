import Button from '../ui/Button.jsx';

function UploadPreviewGrid({ items, onRemove, removing = false }) {
  if (!items?.length) return null;

  return (
    <ul className="grid grid-cols-2 gap-stellar-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => {
        const isPdf =
          item.mimeType === 'application/pdf' ||
          item.format === 'pdf' ||
          item.url?.toLowerCase().includes('.pdf');

        return (
          <li
            key={item.publicId || item.url}
            className="group relative overflow-hidden rounded-stellar-lg border border-stellar-border bg-stellar-surface"
          >
            {isPdf ? (
              <div className="flex aspect-square flex-col items-center justify-center p-stellar-3 text-center">
                <span className="text-2xl" aria-hidden>
                  PDF
                </span>
                <p className="mt-stellar-1 line-clamp-2 text-xs text-stellar-text-muted">
                  {item.originalName || 'Document'}
                </p>
              </div>
            ) : (
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.originalName || ''}
                className="aspect-square w-full object-cover"
              />
            )}
            {onRemove && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="absolute right-1 top-1 !min-w-0 opacity-0 transition-opacity group-hover:opacity-100"
                disabled={removing}
                onClick={() => onRemove(item)}
              >
                ×
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default UploadPreviewGrid;

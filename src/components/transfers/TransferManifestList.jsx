import { TRANSFER_ITEM_STATUS } from '../../utils/transferConstants.js';
import { cn } from '../../utils/cn.js';

const ITEM_META = {
  [TRANSFER_ITEM_STATUS.PENDING]: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-700',
  },
  [TRANSFER_ITEM_STATUS.DISPATCHED]: {
    label: 'Dispatched',
    className: 'bg-violet-500/15 text-violet-700',
  },
  [TRANSFER_ITEM_STATUS.DELIVERED]: {
    label: 'Delivered',
    className: 'bg-emerald-500/15 text-emerald-700',
  },
};

function TransferManifestList({ items }) {
  if (!items?.length) {
    return <p className="text-sm text-stellar-text-muted">No units on this transfer.</p>;
  }

  return (
    <ul className="space-y-stellar-2">
      {items.map((item) => {
        const meta = ITEM_META[item.itemStatus] || ITEM_META.pending;
        return (
          <li
            key={item.id}
            className="flex flex-col gap-stellar-2 rounded-stellar-lg border border-stellar-border p-stellar-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium text-stellar-text">
                {item.productUnit?.serialNumber || 'Unit'}
              </p>
              <p className="text-xs text-stellar-text-muted">
                {item.product?.name}
                {item.product?.sku && ` · ${item.product.sku}`}
              </p>
              {item.location?.aisle && (
                <p className="mt-stellar-1 text-xs text-stellar-text-subtle">
                  Loc: {[item.location.aisle, item.location.shelf, item.location.bin]
                    .filter(Boolean)
                    .join(' / ')}
                </p>
              )}
            </div>
            <span
              className={cn(
                'inline-flex w-fit shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                meta.className,
              )}
            >
              {meta.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default TransferManifestList;

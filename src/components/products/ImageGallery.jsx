import { useState } from 'react';
import { cn } from '../../utils/cn.js';

function ImageGallery({ images = [], alt = 'Product', className = '' }) {
  const urls = (images || []).filter(Boolean);
  const [active, setActive] = useState(0);

  if (!urls.length) {
    return (
      <div
        className={cn(
          'flex aspect-[4/3] items-center justify-center rounded-stellar-xl border border-stellar-border bg-stellar-surface-muted',
          className,
        )}
      >
        <span className="text-sm text-stellar-text-muted">No images</span>
      </div>
    );
  }

  const current = urls[active] || urls[0];

  return (
    <div className={cn('space-y-stellar-3', className)}>
      <div className="relative overflow-hidden rounded-stellar-xl border border-stellar-border bg-stellar-surface-muted">
        <img
          src={current}
          alt={alt}
          className="aspect-[4/3] w-full object-contain sm:aspect-video"
        />
      </div>
      {urls.length > 1 && (
        <div className="flex gap-stellar-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'h-16 w-16 shrink-0 overflow-hidden rounded-stellar-md border-2 transition-stellar',
                i === active
                  ? 'border-stellar-accent'
                  : 'border-stellar-border opacity-70 hover:opacity-100',
              )}
            >
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;

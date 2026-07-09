import { createPortal } from 'react-dom';
import Card from './Card.jsx';
import { cn } from '../../utils/cn.js';

export function ModalBackdrop({ onClose, className, label = 'Close dialog' }) {
  return (
    <button
      type="button"
      className={cn('absolute inset-0 bg-black/50 backdrop-blur-sm', className)}
      onClick={onClose}
      aria-label={label}
    />
  );
}

/** Portals modal chrome to document.body so it stacks above the sticky dashboard header. */
export function ModalShell({
  children,
  onClose,
  className,
  overlayClassName,
  role = 'dialog',
  'aria-labelledby': ariaLabelledby,
  'aria-modal': ariaModal = true,
}) {
  const content = (
    <div
      className={cn(
        'modal-overlay fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-stellar-4',
        overlayClassName,
        className,
      )}
      role={role}
      aria-modal={ariaModal}
      aria-labelledby={ariaLabelledby}
    >
      <ModalBackdrop onClose={onClose} />
      {children}
    </div>
  );

  return createPortal(content, document.body);
}

function Modal({
  open,
  title,
  children,
  onClose,
  className = 'max-w-lg',
  scrollBody = false,
}) {
  if (!open) return null;

  return (
    <ModalShell onClose={onClose} aria-labelledby={title ? 'modal-title' : undefined}>
      <Card
        variant="elevated"
        className={cn(
          'relative z-10 w-full max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem))]',
          scrollBody
            ? 'flex flex-col overflow-hidden !p-0 rounded-t-2xl sm:max-h-[min(90vh,calc(100dvh-var(--header-height)-2rem))] sm:rounded-2xl'
            : 'overflow-y-auto !p-stellar-4 sm:!p-stellar-6 sm:max-h-[min(90vh,calc(100dvh-var(--header-height)-2rem))]',
          className,
        )}
      >
        {scrollBody ? (
          <>
            {title && (
              <div className="shrink-0 border-b border-stellar-border px-stellar-4 py-stellar-4 sm:px-stellar-6">
                <h2 id="modal-title" className="text-lg font-semibold text-stellar-text">
                  {title}
                </h2>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-stellar-4 py-stellar-4 sm:px-stellar-6 sm:py-stellar-5">
              {children}
            </div>
          </>
        ) : (
          <>
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-stellar-text">
                {title}
              </h2>
            )}
            {children}
          </>
        )}
      </Card>
    </ModalShell>
  );
}

export default Modal;

import Button from '../ui/Button.jsx';
import { ID_PROOF_TYPE_OPTIONS } from '../../utils/customerConstants.js';
import { formatDate } from '../../utils/format.js';

function proofTypeLabel(type) {
  return ID_PROOF_TYPE_OPTIONS.find((o) => o.value === type)?.label || type;
}

function IdProofPreviewGrid({ proofs = [], canManage, onVerify, verifyingId }) {
  if (!proofs.length) {
    return (
      <p className="text-sm text-stellar-text-muted">No ID proofs uploaded yet.</p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-stellar-4 sm:grid-cols-2 lg:grid-cols-3">
      {proofs.map((proof) => {
        const proofId = proof._id || proof.id;
        const url = proof.documentUrl;
        const isPdf =
          proof.mimeType === 'application/pdf' || url?.toLowerCase().includes('.pdf');

        return (
          <li
            key={proofId}
            className="overflow-hidden rounded-stellar-lg border border-stellar-border bg-stellar-surface"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-stellar-accent"
            >
              {isPdf ? (
                <div className="flex aspect-[4/3] flex-col items-center justify-center bg-stellar-surface-muted p-stellar-4">
                  <span className="text-3xl font-bold text-stellar-text-muted">PDF</span>
                  <p className="mt-stellar-2 text-xs text-stellar-text-muted">Tap to open</p>
                </div>
              ) : (
                <img
                  src={url}
                  alt={`${proofTypeLabel(proof.type)} document`}
                  className="aspect-[4/3] w-full object-cover"
                />
              )}
            </a>
            <div className="space-y-stellar-2 p-stellar-3">
              <div className="flex flex-wrap items-center gap-stellar-2">
                <span className="text-sm font-medium text-stellar-text">
                  {proofTypeLabel(proof.type)}
                </span>
                {proof.isPrimary && (
                  <span className="rounded-full bg-stellar-accent/15 px-2 py-0.5 text-[10px] font-medium uppercase text-stellar-accent">
                    Primary
                  </span>
                )}
                {proof.verifiedAt ? (
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                    Pending
                  </span>
                )}
              </div>
              <p className="text-xs text-stellar-text-muted">
                {proof.number ? `••••${String(proof.number).slice(-4)}` : 'No number'}
              </p>
              {proof.verifiedAt && (
                <p className="text-xs text-stellar-text-subtle">
                  Verified {formatDate(proof.verifiedAt)}
                </p>
              )}
              {canManage && !proof.verifiedAt && onVerify && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  disabled={verifyingId === proofId}
                  onClick={() => onVerify(proofId)}
                >
                  {verifyingId === proofId ? 'Verifying…' : 'Mark verified'}
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default IdProofPreviewGrid;

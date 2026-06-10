import { Link } from 'react-router-dom';
import Card from '../ui/Card.jsx';
import UnitStatusBadge from '../products/UnitStatusBadge.jsx';
import ImageGallery from '../products/ImageGallery.jsx';

function QrVerifyCard({ result, productBasePath }) {
  if (!result?.unit) return null;

  const { unit, verified, allowedActions, product } = result;
  const images = product?.images || unit.product?.images || [];

  return (
    <Card variant="elevated" className="!p-stellar-5 space-y-stellar-4">
      <div className="flex flex-wrap items-start justify-between gap-stellar-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-stellar-text-subtle">
            {verified ? 'Verified' : 'Scanned'}
          </p>
          <h2 className="mt-stellar-1 font-mono text-lg font-semibold text-stellar-text">
            {unit.serialNumber}
          </h2>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            {unit.product?.name || product?.name}
          </p>
        </div>
        <UnitStatusBadge status={unit.status} />
      </div>

      {images.length > 0 && (
        <ImageGallery images={images.slice(0, 1)} alt={unit.product?.name} className="max-w-xs" />
      )}

      <dl className="grid gap-stellar-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stellar-text-muted">SKU</dt>
          <dd className="font-mono text-xs">{unit.product?.sku || '—'}</dd>
        </div>
        <div>
          <dt className="text-stellar-text-muted">Branch</dt>
          <dd>{unit.branch?.name || unit.branch?.code || '—'}</dd>
        </div>
        <div>
          <dt className="text-stellar-text-muted">Condition</dt>
          <dd className="capitalize">{unit.condition || '—'}</dd>
        </div>
        {unit.notes ? (
          <div>
            <dt className="text-stellar-text-muted">Notes</dt>
            <dd>{unit.notes}</dd>
          </div>
        ) : null}
      </dl>

      {productBasePath && unit.product?.id && (
        <Link
          to={`${productBasePath}/${unit.product.id}`}
          className="text-sm font-medium text-stellar-text underline-offset-2 hover:underline"
        >
          View product →
        </Link>
      )}

      {allowedActions?.length > 0 && (
        <div className="border-t border-stellar-border pt-stellar-4">
          <p className="text-xs font-medium text-stellar-text-muted">Available actions</p>
          <ul className="mt-stellar-2 flex flex-wrap gap-stellar-2">
            {allowedActions.map((a) => (
              <li
                key={a.action}
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  a.enabled
                    ? 'bg-stellar-surface-muted text-stellar-text'
                    : 'bg-stellar-surface-muted/50 text-stellar-text-subtle line-through'
                }`}
              >
                {a.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

export default QrVerifyCard;

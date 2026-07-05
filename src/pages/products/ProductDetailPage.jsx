import { useParams, useLocation } from 'react-router-dom';
import Card from '../../components/ui/Card.jsx';
import ImageGallery from '../../components/products/ImageGallery.jsx';
import ProductDetailShell from '../../components/products/ProductDetailShell.jsx';
import ProductSerialUnitsPanel from '../../components/products/ProductSerialUnitsPanel.jsx';
import useProductBasePath from '../../hooks/useProductBasePath.js';

function formatMoney(val) {
  if (val == null || val === '') return '—';
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

function ProductDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const basePath = useProductBasePath();

  return (
    <ProductDetailShell productId={id} toast={location.state?.message}>
      {({ product }) => (
        <div className="space-y-stellar-6">
        <ProductSerialUnitsPanel productId={id} basePath={basePath} />
        <div className="grid gap-stellar-6 lg:grid-cols-2">
          <ImageGallery images={product.images} alt={product.name} />
          <div className="space-y-stellar-4">
            <Card variant="muted" className="!p-stellar-5">
              <h2 className="text-sm font-semibold text-stellar-text">Details</h2>
              <dl className="mt-stellar-4 space-y-stellar-3 text-sm">
                <div className="flex justify-between gap-stellar-4">
                  <dt className="text-stellar-text-muted">Category</dt>
                  <dd>{product.category?.name || '—'}</dd>
                </div>
                <div className="flex justify-between gap-stellar-4">
                  <dt className="text-stellar-text-muted">Serial units</dt>
                  <dd className="tabular-nums">
                    {product.availableUnits ?? 0} available / {product.totalUnits ?? 0} total
                  </dd>
                </div>
                <div className="flex justify-between gap-stellar-4">
                  <dt className="text-stellar-text-muted">Tracking</dt>
                  <dd>{product.trackUnits !== false ? 'Per serial number' : 'Quantity only'}</dd>
                </div>
              </dl>
            </Card>
            <Card variant="muted" className="!p-stellar-5">
              <h2 className="text-sm font-semibold text-stellar-text">Pricing</h2>
              <dl className="mt-stellar-4 grid gap-stellar-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-stellar-text-muted">Daily</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(product.pricing?.dailyRate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stellar-text-muted">Weekly</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(product.pricing?.weeklyRate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stellar-text-muted">Monthly</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(product.pricing?.monthlyRate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-stellar-text-muted">Deposit</dt>
                  <dd className="font-medium tabular-nums">
                    {formatMoney(product.pricing?.depositAmount)}
                  </dd>
                </div>
              </dl>
            </Card>
            {product.description && (
              <Card variant="muted" className="!p-stellar-5">
                <h2 className="text-sm font-semibold text-stellar-text">Description</h2>
                <p className="mt-stellar-2 text-sm text-stellar-text-muted whitespace-pre-wrap">
                  {product.description}
                </p>
              </Card>
            )}
          </div>
        </div>
        </div>
      )}
    </ProductDetailShell>
  );
}

export default ProductDetailPage;

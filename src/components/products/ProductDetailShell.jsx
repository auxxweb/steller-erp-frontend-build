import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductStatusBadge from './ProductStatusBadge.jsx';
import ProductSubNav from './ProductSubNav.jsx';
import { fetchProduct } from '../../services/productService.js';
import useProductBasePath, { useCanManageProducts } from '../../hooks/useProductBasePath.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function ProductDetailShell({ productId, children, toast: initialToast }) {
  const basePath = useProductBasePath();
  const canManage = useCanManageProducts();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (initialToast) {
      toast.success(initialToast);
    }
  }, [initialToast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadFailed(false);
      try {
        const { data } = await fetchProduct(productId);
        if (!cancelled) setProduct(data.data.product);
      } catch (err) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(err, 'Product not found'));
          setLoadFailed(true);
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const refresh = async () => {
    const { data } = await fetchProduct(productId);
    setProduct(data.data.product);
  };

  const setToast = (msg) => {
    if (msg) toast.success(msg);
  };

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading product…</p>;
  }

  if (loadFailed || !product) {
    return (
      <div>
        <Link to={basePath} className="mt-stellar-4 inline-block text-sm">
          ← Products
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div className="flex flex-col gap-stellar-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Link to={basePath} className="text-sm text-stellar-text-muted hover:text-stellar-text">
            ← Products
          </Link>
          <div className="mt-stellar-2 flex flex-wrap items-center gap-stellar-3">
            <h1 className="text-xl font-semibold tracking-tight text-stellar-text sm:text-2xl">
              {product.name}
            </h1>
            <ProductStatusBadge status={product.status} />
          </div>
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            <code className="text-xs">{product.sku}</code>
            {[product.brand, product.model].filter(Boolean).length > 0 && (
              <> · {[product.brand, product.model].filter(Boolean).join(' ')}</>
            )}
          </p>
        </div>
        {canManage && (
          <div className="flex shrink-0 gap-stellar-2">
            <Link to={`${basePath}/${productId}/edit`} className="btn btn-secondary btn-md">
              Edit
            </Link>
            <Link to={`${basePath}/${productId}/units`} className="btn btn-primary btn-md">
              Serial units
            </Link>
          </div>
        )}
      </div>

      <ProductSubNav basePath={basePath} productId={productId} />

      {typeof children === 'function' ? children({ product, refresh, setToast }) : children}
    </div>
  );
}

export default ProductDetailShell;

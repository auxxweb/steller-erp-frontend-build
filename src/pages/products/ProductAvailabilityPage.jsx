import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductDetailShell from '../../components/products/ProductDetailShell.jsx';
import ProductAvailabilityPanel from '../../components/products/ProductAvailabilityPanel.jsx';
import { fetchProductAvailability } from '../../services/productService.js';

function ProductAvailabilityPage() {
  const { id } = useParams();
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchProductAvailability(id);
        if (!cancelled) setAvailability(data.data.availability);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <ProductDetailShell productId={id}>
      {() => (
        <div>
          <h2 className="mb-stellar-4 text-lg font-semibold text-stellar-text">
            Availability
          </h2>
          <ProductAvailabilityPanel availability={availability} loading={loading} />
        </div>
      )}
    </ProductDetailShell>
  );
}

export default ProductAvailabilityPage;

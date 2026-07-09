import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/products/ProductForm.jsx';
import { EMPTY_PRODUCT_FORM } from '../../utils/productConstants.js';
import {
  validateProductForm,
  hasValidationErrors,
} from '../../utils/productValidation.js';
import useProductBasePath, { useCanManageProducts } from '../../hooks/useProductBasePath.js';
import { fetchCategories } from '../../services/categoryService.js';
import {
  createProduct,
  updateProduct,
  fetchProduct,
  createProductUnitsBulk,
  updateUnit,
} from '../../services/productService.js';
import { uploadProductUnitImages } from '../../services/uploadService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';
import { fetchWorkspaceSettings } from '../../services/settingsService.js';

function productToForm(product) {
  return {
    name: product.name || '',
    brand: product.brand || product.specs?.brand || '',
    model: product.model || product.specs?.model || '',
    sku: product.sku || '',
    category: product.category?.id || product.category || '',
    description: product.description || '',
    status: product.status,
    images: product.images || [],
    pricing: {
      individual: {
        dailyRate: product.pricing?.individual?.dailyRate ?? product.pricing?.dailyRate ?? '',
        weeklyRate: product.pricing?.individual?.weeklyRate ?? product.pricing?.weeklyRate ?? '',
        monthlyRate: product.pricing?.individual?.monthlyRate ?? product.pricing?.monthlyRate ?? '',
      },
      depositAmount: product.pricing?.depositAmount ?? '',
      salePrice: product.pricing?.salePrice ?? '',
    },
    advancePayment: {
      required: product.advancePayment?.required ?? false,
      percentage: product.advancePayment?.percentage ?? '',
    },
  };
}

function formToPayload(values) {
  const pricing = {};
  const p = values.pricing || {};
  const normalizeRates = (group) => {
    const out = {};
    ['dailyRate', 'weeklyRate', 'monthlyRate'].forEach((k) => {
      const v = group?.[k];
      if (v !== '' && v != null) out[k] = Number(v);
    });
    return out;
  };
  pricing.individual = normalizeRates(p.individual);
  ['depositAmount', 'salePrice'].forEach((k) => {
    const v = p?.[k];
    if (v !== '' && v != null) pricing[k] = Number(v);
  });

  const payload = {
    name: values.name.trim(),
    brand: values.brand?.trim(),
    model: values.model?.trim(),
    category: values.category,
    description: values.description?.trim(),
    status: values.status,
    images: values.images || [],
    pricing,
    advancePayment: {
      required: Boolean(values.advancePayment?.required),
      percentage: values.advancePayment?.required ? Number(values.advancePayment?.percentage || 0) : 0,
    },
  };

  if (values.sku?.trim()) payload.sku = values.sku.trim();

  return payload;
}

function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const basePath = useProductBasePath();
  const canManage = useCanManageProducts();

  const [values, setValues] = useState(EMPTY_PRODUCT_FORM);
  const [imageAssets, setImageAssets] = useState([]);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [gstPolicy, setGstPolicy] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!canManage) navigate(basePath, { replace: true });
  }, [canManage, basePath, navigate]);

  useEffect(() => {
    fetchCategories({ limit: 100 })
      .then(({ data }) => setCategories(data.data.categories))
      .catch(() => setCategories([]));
    fetchWorkspaceSettings()
      .then(({ data }) => setGstPolicy(data.data.gstPolicy || null))
      .catch(() => setGstPolicy(null));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchProduct(id);
        if (!cancelled) {
          setValues(productToForm(data.data.product));
          setImageAssets((data.data.product.images || []).map((url) => ({ url })));
        }
      } catch (err) {
        if (!cancelled) setApiError(err.response?.data?.message || 'Product not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateProductForm(values);
    setErrors(validationErrors);
    if (hasValidationErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const payload = formToPayload(values);
      if (isEdit) {
        await updateProduct(id, payload);
        navigate(`${basePath}/${id}`, { state: { message: 'Product updated' } });
      } else {
        const { data } = await createProduct(payload);
        const product = data.data.product;

        // Create serial units (per-serial group with optional images)
        const unitInputs = Array.isArray(values.serialUnits) ? values.serialUnits : [];
        const cleanUnits = unitInputs
          .map((u) => ({
            serialNumber: u.serialNumber?.trim(),
          }))
          .filter((u) => u.serialNumber);

        if (cleanUnits.length) {
          const bulk = await createProductUnitsBulk(product.id, cleanUnits);
          const createdUnits = bulk.data.data.created || [];

          // Upload + attach images per unit (best-effort; does not block product creation)
          for (const created of createdUnits) {
            const match = unitInputs.find(
              (u) => u.serialNumber?.trim() === created.serialNumber,
            );
            const files = (match?.imageFiles || []).slice(0, 2);
            if (!files.length) continue;
            try {
              const up = await uploadProductUnitImages(files, {
                productId: product.id,
                unitId: created.id,
              });
              const uploaded = up.data.data.images || [];
              const images = uploaded.slice(0, 2).map((img) => ({
                url: img.url,
                publicId: img.publicId,
                thumbnailUrl: img.thumbnailUrl,
                mimeType: img.mimeType,
                uploadedAt: img.createdAt,
              }));
              await updateUnit(created.id, { images });
            } catch {
              // Ignore unit image upload failures; units still exist and can be edited later
            }
          }
        }

        navigate(`${basePath}/${data.data.product.id}`, {
          state: { message: 'Product created' },
        });
      }
    } catch (err) {
      const apiMsg = err.response?.data?.message;
      const apiErrors = err.response?.data?.errors;
      const details =
        Array.isArray(apiErrors) && apiErrors.length ? apiErrors.join('. ') : null;
      toast.error(details || apiMsg || getApiErrorMessage(err, 'Save failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading product…</p>;
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link to={isEdit ? `${basePath}/${id}` : basePath} className="text-sm text-stellar-text-muted">
          ← Back
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold text-stellar-text">
          {isEdit ? 'Edit product' : 'Add product'}
        </h1>
        {!isEdit && (
          <p className="mt-stellar-1 text-sm text-stellar-text-muted">
            Create the product master (e.g. Sony A7 IV), then register each physical copy with its
            own serial number.
          </p>
        )}
      </div>
      <ProductForm
        values={values}
        errors={errors}
        categories={categories}
        imageAssets={imageAssets}
        onChange={setValues}
        onImagesChange={setImageAssets}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit ? `${basePath}/${id}` : basePath)}
        isSubmitting={submitting}
        submitLabel={isEdit ? 'Update product' : 'Create product'}
        productId={id}
        gstPolicy={gstPolicy}
      />
    </div>
  );
}

export default ProductFormPage;

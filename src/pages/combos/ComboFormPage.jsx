import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ComboForm from '../../components/combos/ComboForm.jsx';
import {
  comboToForm,
  formToPayload,
  initialComboForm,
  previewPayloadFromForm,
} from '../../utils/comboFormHelpers.js';
import useComboBasePath, { useCanManageCombos } from '../../hooks/useComboBasePath.js';
import { fetchAllProducts } from '../../services/productService.js';
import {
  createCombo,
  updateCombo,
  fetchCombo,
  previewCombo,
} from '../../services/comboService.js';

function ComboFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const basePath = useComboBasePath();
  const canManage = useCanManageCombos();

  const [values, setValues] = useState(initialComboForm);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [pricingPreview, setPricingPreview] = useState(null);
  const [availabilityPreview, setAvailabilityPreview] = useState(null);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!canManage) navigate(basePath, { replace: true });
  }, [canManage, basePath, navigate]);

  useEffect(() => {
    fetchAllProducts({ status: 'active' })
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchCombo(id);
        if (!cancelled) setValues(comboToForm(data.data.combo));
      } catch (err) {
        if (!cancelled) setApiError(err.response?.data?.message || 'Combo not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleCalculate = async () => {
    setPreviewLoading(true);
    setApiError('');
    try {
      const payload = previewPayloadFromForm(values);
      const { data } = await previewCombo(payload);
      setPricingPreview(data.data.pricing);
      setAvailabilityPreview(data.data.availability);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Preview failed');
      setPricingPreview(null);
      setAvailabilityPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSubmitting(true);
    try {
      const payload = formToPayload(values);
      if (isEdit) {
        await updateCombo(id, payload);
        navigate(`${basePath}/${id}`, { state: { message: 'Combo updated' } });
      } else {
        const { data } = await createCombo(payload);
        navigate(`${basePath}/${data.data.combo.id}`, {
          state: { message: 'Combo created' },
        });
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading combo…</p>;
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link to={isEdit ? `${basePath}/${id}` : basePath} className="text-sm text-stellar-text-muted">
          ← Combos
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold text-stellar-text">
          {isEdit ? 'Edit combo' : 'New combo'}
        </h1>
      </div>

      {apiError && (
        <p className="text-sm text-stellar-danger" role="alert">
          {apiError}
        </p>
      )}

      <ComboForm
        values={values}
        products={products}
        pricingPreview={pricingPreview}
        availabilityPreview={availabilityPreview}
        previewLoading={previewLoading}
        onChange={setValues}
        onCalculate={handleCalculate}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit ? `${basePath}/${id}` : basePath)}
        isSubmitting={submitting}
        submitLabel={isEdit ? 'Save changes' : 'Create combo'}
      />
    </div>
  );
}

export default ComboFormPage;

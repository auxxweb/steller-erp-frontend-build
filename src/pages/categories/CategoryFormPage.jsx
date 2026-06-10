import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CategoryForm from '../../components/categories/CategoryForm.jsx';
import { EMPTY_CATEGORY_FORM } from '../../utils/categoryConstants.js';
import {
  validateCategoryForm,
  hasValidationErrors,
  slugify,
} from '../../utils/categoryValidation.js';
import useCategoryBasePath, { useIsBranchWorkspace } from '../../hooks/useCategoryBasePath.js';
import { fetchBranches } from '../../services/branchService.js';
import {
  createCategory,
  updateCategory,
  fetchCategory,
} from '../../services/categoryService.js';

function categoryToForm(category) {
  return {
    name: category.name || '',
    slug: category.slug || '',
    description: category.description || '',
    image: category.image || '',
    status: category.status,
    branch: category.branch?.id || category.branch || '',
  };
}

function formToPayload(values) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim() || undefined,
    description: values.description.trim() || undefined,
    image: values.image.trim() || undefined,
    status: values.status,
    branch: values.branch || null,
  };
}

function CategoryFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const basePath = useCategoryBasePath();
  const isBranchWorkspace = useIsBranchWorkspace();

  const [values, setValues] = useState(EMPTY_CATEGORY_FORM);
  const [errors, setErrors] = useState({});
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const slugManualRef = useRef(false);

  useEffect(() => {
    fetchBranches({ limit: 100 })
      .then(({ data }) => setBranches(data.data.branches))
      .catch(() => setBranches([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchCategory(id);
        if (!cancelled) {
          setValues(categoryToForm(data.data.category));
          slugManualRef.current = true;
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(err.response?.data?.message || 'Category not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const slugPreview = useMemo(() => {
    if (slugManualRef.current && values.slug?.trim()) {
      return values.slug.trim().toLowerCase();
    }
    return slugify(values.name);
  }, [values.name, values.slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validateCategoryForm(values);
    setErrors(validationErrors);
    if (hasValidationErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const payload = formToPayload(values);
      if (isEdit) {
        await updateCategory(id, payload);
        navigate(basePath, { state: { message: 'Category updated successfully' } });
      } else {
        await createCategory(payload);
        navigate(basePath, { state: { message: 'Category created successfully' } });
      }
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (Array.isArray(serverErrors) && serverErrors.length) {
        setApiError(serverErrors.join('. '));
      } else {
        setApiError(err.response?.data?.message || 'Save failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-up opacity-0-start">
        <p className="text-sm text-stellar-text-muted">Loading category…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link
          to={basePath}
          className="text-sm text-stellar-text-muted hover:text-stellar-text"
        >
          ← Back to categories
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold tracking-tight text-stellar-text">
          {isEdit ? 'Edit category' : 'Create category'}
        </h1>
      </div>

      {apiError && (
        <p className="text-sm text-stellar-danger" role="alert">
          {apiError}
        </p>
      )}

      <CategoryForm
        values={values}
        errors={errors}
        branches={branches}
        showBranchField={!isBranchWorkspace}
        slugPreview={slugPreview}
        onChange={setValues}
        onSlugManualEdit={() => {
          slugManualRef.current = true;
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(basePath)}
        isSubmitting={submitting}
        submitLabel={isEdit ? 'Update category' : 'Create category'}
      />
    </div>
  );
}

export default CategoryFormPage;

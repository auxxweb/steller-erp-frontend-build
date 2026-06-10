import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BranchForm from '../../components/branches/BranchForm.jsx';
import {
  EMPTY_BRANCH_FORM,
  EMPTY_ADDRESS,
} from '../../utils/branchConstants.js';
import {
  validateBranchForm,
  hasValidationErrors,
} from '../../utils/branchValidation.js';
import {
  createBranch,
  updateBranch,
  fetchBranch,
  fetchBranchManagers,
} from '../../services/branchService.js';

function branchToForm(branch) {
  return {
    name: branch.name || '',
    code: branch.code || '',
    email: branch.email || '',
    phone: branch.phone || '',
    address: { ...EMPTY_ADDRESS, ...branch.address },
    manager: branch.manager?.id || branch.manager || '',
    status: branch.status,
  };
}

function formToPayload(values) {
  return {
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    email: values.email.trim() || undefined,
    phone: values.phone.trim() || undefined,
    address: values.address,
    status: values.status,
    manager: values.manager || null,
  };
}

function BranchFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [values, setValues] = useState(EMPTY_BRANCH_FORM);
  const [errors, setErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    fetchBranchManagers()
      .then(({ data }) => setManagers(data.data.managers))
      .catch(() => setManagers([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchBranch(id);
        if (!cancelled) setValues(branchToForm(data.data.branch));
      } catch (err) {
        if (!cancelled) {
          setApiError(err.response?.data?.message || 'Branch not found');
        }
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
    setApiError('');

    const validationErrors = validateBranchForm(values, { isEdit });
    setErrors(validationErrors);
    if (hasValidationErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const payload = formToPayload(values);
      if (isEdit) {
        await updateBranch(id, payload);
        navigate(`/admin/branches/${id}`, {
          state: { message: 'Branch updated successfully' },
        });
      } else {
        const { data } = await createBranch(payload);
        navigate(`/admin/branches/${data.data.branch.id}`, {
          state: { message: 'Branch created successfully' },
        });
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
        <p className="text-sm text-stellar-text-muted">Loading branch…</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link
          to={isEdit ? `/admin/branches/${id}` : '/admin/branches'}
          className="text-sm text-stellar-text-muted hover:text-stellar-text"
        >
          ← Back to branches
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold tracking-tight text-stellar-text">
          {isEdit ? 'Edit branch' : 'Create branch'}
        </h1>
      </div>

      {apiError && (
        <p className="text-sm text-stellar-danger" role="alert">
          {apiError}
        </p>
      )}

      <BranchForm
        values={values}
        errors={errors}
        managers={managers}
        onChange={setValues}
        onSubmit={handleSubmit}
        onCancel={() =>
          navigate(isEdit ? `/admin/branches/${id}` : '/admin/branches')
        }
        isSubmitting={submitting}
        submitLabel={isEdit ? 'Update branch' : 'Create branch'}
      />
    </div>
  );
}

export default BranchFormPage;

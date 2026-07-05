import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CustomerForm from '../../components/customers/CustomerForm.jsx';
import { EMPTY_CUSTOMER_FORM, CUSTOMER_TYPE } from '../../utils/customerConstants.js';
import {
  validateCustomerForm,
  hasValidationErrors,
} from '../../utils/customerValidation.js';
import useCustomerBasePath, { useCanManageCustomers } from '../../hooks/useCustomerBasePath.js';
import { createCustomer, updateCustomer, fetchCustomer } from '../../services/customerService.js';
import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

function customerToForm(customer) {
  return {
    customerType: customer.customerType || CUSTOMER_TYPE.INDIVIDUAL,
    name: customer.name || '',
    phone: customer.phone || '',
    alternatePhone: customer.alternatePhone || '',
    email: customer.email || '',
    company: customer.company || '',
    gstin: customer.gstin || '',
    creditLimit: customer.creditLimit ?? '',
    notes: customer.notes || '',
    address: {
      line1: customer.address?.line1 || '',
      line2: customer.address?.line2 || '',
      city: customer.address?.city || '',
      state: customer.address?.state || '',
      pincode: customer.address?.pincode || '',
      country: customer.address?.country || 'India',
    },
    idProofType: customer.idProof?.type || '',
    idProofNumber: customer.idProof?.number || '',
  };
}

function formToPayload(values) {
  const payload = {
    customerType: values.customerType,
    name: values.name.trim(),
    phone: values.phone.trim(),
    alternatePhone: values.alternatePhone?.trim() || undefined,
    email: values.email?.trim() || undefined,
    company: values.company?.trim() || undefined,
    gstin: values.gstin?.trim() || undefined,
    notes: values.notes?.trim() || undefined,
    address: values.address,
  };

  if (values.creditLimit !== '' && values.creditLimit != null) {
    payload.creditLimit = Number(values.creditLimit);
  }

  if (values.idProofType && values.idProofNumber?.trim()) {
    payload.idProof = {
      type: values.idProofType,
      number: values.idProofNumber.trim(),
    };
  }

  return payload;
}

function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const basePath = useCustomerBasePath();
  const canManage = useCanManageCustomers();

  const [values, setValues] = useState(EMPTY_CUSTOMER_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!canManage) navigate(basePath, { replace: true });
  }, [canManage, basePath, navigate]);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await fetchCustomer(id);
        if (!cancelled) setValues(customerToForm(data.data.customer));
      } catch (err) {
        if (!cancelled) setApiError(err.response?.data?.message || 'Customer not found');
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
    const validationErrors = validateCustomerForm(values, { isEdit });
    setErrors(validationErrors);
    if (hasValidationErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const payload = formToPayload(values);
      if (isEdit) {
        await updateCustomer(id, payload);
        navigate(`${basePath}/${id}`, { state: { message: 'Customer updated' } });
      } else {
        const { data } = await createCustomer(payload);
        navigate(`${basePath}/${data.data.customer.id}`, {
          state: { message: 'Customer created' },
        });
      }
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Save failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-stellar-text-muted">Loading customer…</p>;
  }

  return (
    <div className="animate-fade-up opacity-0-start space-y-stellar-6">
      <div>
        <Link
          to={isEdit ? `${basePath}/${id}` : basePath}
          className="text-sm text-stellar-text-muted"
        >
          ← Back
        </Link>
        <h1 className="mt-stellar-2 text-2xl font-semibold text-stellar-text">
          {isEdit ? 'Edit customer' : 'Add customer'}
        </h1>
      </div>
      <CustomerForm
        values={values}
        errors={errors}
        onChange={setValues}
        onSubmit={handleSubmit}
        onCancel={() => navigate(isEdit ? `${basePath}/${id}` : basePath)}
        isSubmitting={submitting}
        submitLabel={isEdit ? 'Update customer' : 'Create customer'}
      />
    </div>
  );
}

export default CustomerFormPage;

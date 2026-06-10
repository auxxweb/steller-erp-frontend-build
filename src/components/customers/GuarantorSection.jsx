import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useEffect, useState } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import {
  createGuarantor,
  deleteGuarantor,
  fetchGuarantors,
} from '../../services/customerService.js';

function GuarantorSection({ customerId, canManage, onChanged }) {
  const [guarantors, setGuarantors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', relationship: '' });
    const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchGuarantors(customerId);
      setGuarantors(data.data.guarantors);
    } catch {
      setGuarantors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [customerId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSubmitting(true);
    try {
      await createGuarantor(customerId, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        relationship: form.relationship?.trim(),
        isPrimary: guarantors.length === 0,
      });
      setForm({ name: '', phone: '', relationship: '' });
      setShowForm(false);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add guarantor'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (guarantorId) => {
    if (!window.confirm('Remove this guarantor?')) return;
    try {
      await deleteGuarantor(customerId, guarantorId);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to remove guarantor'));
    }
  };

  return (
    <Card variant="muted" className="!p-stellar-5">
      <div className="flex flex-col gap-stellar-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-semibold text-stellar-text">Guarantors</h2>
        {canManage && (
          <Button type="button" variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'Add guarantor'}
          </Button>
        )}
      </div>

            {showForm && canManage && (
        <form onSubmit={handleAdd} className="mt-stellar-4 grid gap-stellar-3 sm:grid-cols-3">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <Input
            label="Relationship"
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
          />
          <div className="sm:col-span-3">
            <Button type="submit" size="sm" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save guarantor'}
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-stellar-4 text-sm text-stellar-text-muted">Loading guarantors…</p>
      ) : guarantors.length === 0 ? (
        <p className="mt-stellar-4 text-sm text-stellar-text-muted">No guarantors on file.</p>
      ) : (
        <ul className="mt-stellar-4 divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border bg-stellar-surface">
          {guarantors.map((g) => (
            <li
              key={g.id}
              className="flex flex-col gap-stellar-2 p-stellar-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-stellar-text">
                  {g.name}
                  {g.isPrimary && (
                    <span className="ml-stellar-2 text-xs text-stellar-accent">Primary</span>
                  )}
                </p>
                <p className="text-sm text-stellar-text-muted">
                  {g.phone}
                  {g.relationship && ` · ${g.relationship}`}
                </p>
              </div>
              {canManage && (
                <button
                  type="button"
                  className="text-sm text-stellar-danger hover:underline"
                  onClick={() => handleRemove(g.id)}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default GuarantorSection;

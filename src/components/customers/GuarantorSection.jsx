import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useEffect, useState } from 'react';
import Card from '../ui/Card.jsx';
import Button from '../ui/Button.jsx';
import Input from '../ui/Input.jsx';
import FileDropzone from '../upload/FileDropzone.jsx';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import {
  createGuarantor,
  deleteGuarantor,
  fetchGuarantors,
  updateGuarantor,
  uploadGuarantorDocuments,
} from '../../services/customerService.js';
import { ID_PROOF_TYPE_OPTIONS } from '../../utils/customerConstants.js';
import { ACCEPT_DOCUMENTS, UPLOAD_LIMITS } from '../../utils/uploadConstants.js';
import { validateFiles, documentMaxBytes } from '../../utils/uploadHelpers.js';

const EMPTY_FORM = {
  name: '',
  phone: '',
  relationship: '',
  email: '',
  notes: '',
  isPrimary: false,
  idProofType: ID_PROOF_TYPE_OPTIONS[0].value,
  idProofNumber: '',
};

function guarantorToForm(g) {
  return {
    name: g.name || '',
    phone: g.phone || '',
    relationship: g.relationship || '',
    email: g.email || '',
    notes: g.notes || '',
    isPrimary: Boolean(g.isPrimary),
    idProofType: g.idProof?.type || ID_PROOF_TYPE_OPTIONS[0].value,
    idProofNumber: g.idProof?.number || '',
  };
}

function buildIdProofPayload(form, existingProof) {
  const number = form.idProofNumber.trim();
  if (!form.idProofType && !number) return undefined;
  return {
    ...(existingProof || {}),
    type: form.idProofType,
    number: number || undefined,
  };
}

function GuarantorDocuments({ documents = [], idProof }) {
  const items = [...documents];
  if (idProof?.documentUrl && !items.some((d) => d.url === idProof.documentUrl)) {
    items.push({
      url: idProof.documentUrl,
      name: idProof.type ? `${idProof.type} (${idProof.number || 'ID'})` : 'ID document',
    });
  }
  if (!items.length) return null;

  return (
    <div className="mt-stellar-2 flex flex-wrap gap-stellar-2">
      {items.map((doc) => (
        <a
          key={doc.url}
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-stellar-lg border border-stellar-border px-stellar-2 py-stellar-1 text-xs font-medium text-stellar-accent hover:underline"
        >
          {doc.name || 'Document'}
        </a>
      ))}
    </div>
  );
}

function GuarantorFieldsForm({
  form,
  setForm,
  docFiles,
  onDocFilesSelected,
  submitting,
  submitLabel,
  onSubmit,
  onCancel,
  showPrimaryToggle = false,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-stellar-4">
      <div className="grid gap-stellar-3 sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
      <div className="grid gap-stellar-3 sm:grid-cols-2">
        <Input
          label="Email (optional)"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>
      <div className="grid gap-stellar-3 sm:grid-cols-2">
        <SearchableSelect
          label="ID type (optional)"
          value={form.idProofType}
          onChange={(e) => setForm({ ...form, idProofType: e.target.value })}
          options={ID_PROOF_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
        <Input
          label="ID number (optional)"
          value={form.idProofNumber}
          onChange={(e) => setForm({ ...form, idProofNumber: e.target.value })}
        />
      </div>
      {showPrimaryToggle && (
        <label className="flex items-center gap-stellar-2 text-sm text-stellar-text">
          <input
            type="checkbox"
            checked={form.isPrimary}
            onChange={(e) => setForm({ ...form, isPrimary: e.target.checked })}
            className="h-4 w-4 accent-stellar-accent"
          />
          Primary guarantor
        </label>
      )}
      <FileDropzone
        accept={ACCEPT_DOCUMENTS}
        multiple
        disabled={submitting}
        label="Upload documents (optional)"
        hint={`Images or PDF, up to ${UPLOAD_LIMITS.customerMaxFiles} files`}
        onFilesSelected={onDocFilesSelected}
      />
      {docFiles.length > 0 && (
        <p className="text-sm text-stellar-text-muted">
          {docFiles.length} file(s) selected: {docFiles.map((f) => f.name).join(', ')}
        </p>
      )}
      <div className="flex flex-wrap gap-stellar-2">
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function GuarantorUploadForm({ customerId, guarantorId, onUploaded, onCancel }) {
  const [type, setType] = useState(ID_PROOF_TYPE_OPTIONS[0].value);
  const [number, setNumber] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFilesSelected = (selected) => {
    const list = Array.from(selected || []);
    const validationErrors = validateFiles(list, {
      accept: ACCEPT_DOCUMENTS,
      maxFiles: UPLOAD_LIMITS.customerMaxFiles,
      maxBytes: documentMaxBytes,
      label: 'document',
    });
    if (validationErrors.length) {
      toast.error(validationErrors.join('. '));
      return;
    }
    setFiles(list);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) {
      toast.error('Select at least one document');
      return;
    }
    setUploading(true);
    try {
      await uploadGuarantorDocuments(customerId, guarantorId, files, {
        type: number.trim() ? type : undefined,
        number: number.trim() || undefined,
      });
      setFiles([]);
      setNumber('');
      toast.success('Document uploaded');
      onUploaded?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="mt-stellar-3 space-y-stellar-3 rounded-stellar-lg border border-dashed border-stellar-border p-stellar-3"
    >
      <div className="grid gap-stellar-3 sm:grid-cols-2">
        <SearchableSelect
          label="ID type (optional)"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={ID_PROOF_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
        <Input
          label="ID number (optional)"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </div>
      <FileDropzone
        accept={ACCEPT_DOCUMENTS}
        multiple
        disabled={uploading}
        label="Upload document"
        hint={`Images or PDF, up to ${UPLOAD_LIMITS.customerMaxFiles} files`}
        onFilesSelected={handleFilesSelected}
      />
      {files.length > 0 && (
        <p className="text-xs text-stellar-text-muted">
          {files.length} file(s): {files.map((f) => f.name).join(', ')}
        </p>
      )}
      <div className="flex flex-wrap gap-stellar-2">
        <Button type="submit" size="sm" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={uploading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function GuarantorSection({ customerId, canManage, onChanged }) {
  const [guarantors, setGuarantors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [docFiles, setDocFiles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editDocFiles, setEditDocFiles] = useState([]);
  const [uploadingForId, setUploadingForId] = useState(null);

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

  const validateDocFiles = (selected) => {
    const list = Array.from(selected || []);
    const validationErrors = validateFiles(list, {
      accept: ACCEPT_DOCUMENTS,
      maxFiles: UPLOAD_LIMITS.customerMaxFiles,
      maxBytes: documentMaxBytes,
      label: 'document',
    });
    if (validationErrors.length) {
      toast.error(validationErrors.join('. '));
      return null;
    }
    return list;
  };

  const resetAddForm = () => {
    setForm(EMPTY_FORM);
    setDocFiles([]);
    setShowForm(false);
  };

  const resetEditForm = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditDocFiles([]);
  };

  const startEdit = (guarantor) => {
    setShowForm(false);
    setUploadingForId(null);
    setEditingId(guarantor.id);
    setEditForm(guarantorToForm(guarantor));
    setEditDocFiles([]);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSubmitting(true);
    try {
      const idProof = buildIdProofPayload(form);
      const { data } = await createGuarantor(customerId, {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || undefined,
        relationship: form.relationship?.trim(),
        notes: form.notes?.trim(),
        isPrimary: guarantors.length === 0,
        ...(idProof ? { idProof } : {}),
      });
      const guarantorId = data.data.guarantor.id;

      if (docFiles.length) {
        await uploadGuarantorDocuments(customerId, guarantorId, docFiles, {
          type: form.idProofNumber.trim() ? form.idProofType : undefined,
          number: form.idProofNumber.trim() || undefined,
        });
      }

      resetAddForm();
      await load();
      onChanged?.();
      toast.success('Guarantor added');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to add guarantor'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e, guarantor) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.phone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    setSubmitting(true);
    try {
      const idProof = buildIdProofPayload(editForm, guarantor.idProof);
      await updateGuarantor(customerId, guarantor.id, {
        name: editForm.name.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email?.trim() || '',
        relationship: editForm.relationship?.trim(),
        notes: editForm.notes?.trim(),
        isPrimary: editForm.isPrimary,
        ...(idProof ? { idProof } : {}),
      });

      if (editDocFiles.length) {
        await uploadGuarantorDocuments(customerId, guarantor.id, editDocFiles, {
          type: editForm.idProofNumber.trim() ? editForm.idProofType : undefined,
          number: editForm.idProofNumber.trim() || undefined,
        });
      }

      resetEditForm();
      await load();
      onChanged?.();
      toast.success('Guarantor updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update guarantor'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (guarantorId) => {
    if (!window.confirm('Remove this guarantor?')) return;
    try {
      await deleteGuarantor(customerId, guarantorId);
      if (editingId === guarantorId) resetEditForm();
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
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              resetEditForm();
              setShowForm((v) => !v);
            }}
          >
            {showForm ? 'Cancel' : 'Add guarantor'}
          </Button>
        )}
      </div>

      {showForm && canManage && (
        <div className="mt-stellar-4">
          <GuarantorFieldsForm
            form={form}
            setForm={setForm}
            docFiles={docFiles}
            onDocFilesSelected={(selected) => {
              const list = validateDocFiles(selected);
              if (list) setDocFiles(list);
            }}
            submitting={submitting}
            submitLabel="Save guarantor"
            onSubmit={handleAdd}
            onCancel={resetAddForm}
          />
        </div>
      )}

      {loading ? (
        <p className="mt-stellar-4 text-sm text-stellar-text-muted">Loading guarantors…</p>
      ) : guarantors.length === 0 ? (
        <p className="mt-stellar-4 text-sm text-stellar-text-muted">No guarantors on file.</p>
      ) : (
        <ul className="mt-stellar-4 divide-y divide-stellar-border rounded-stellar-lg border border-stellar-border bg-stellar-surface">
          {guarantors.map((g) => (
            <li key={g.id} className="p-stellar-3">
              {editingId === g.id ? (
                <div className="space-y-stellar-3">
                  <p className="text-sm font-medium text-stellar-text">Edit guarantor</p>
                  <GuarantorDocuments documents={g.documents} idProof={g.idProof} />
                  <GuarantorFieldsForm
                    form={editForm}
                    setForm={setEditForm}
                    docFiles={editDocFiles}
                    onDocFilesSelected={(selected) => {
                      const list = validateDocFiles(selected);
                      if (list) setEditDocFiles(list);
                    }}
                    submitting={submitting}
                    submitLabel="Save changes"
                    onSubmit={(e) => handleEdit(e, g)}
                    onCancel={resetEditForm}
                    showPrimaryToggle
                  />
                </div>
              ) : (
                <>
                  <div className="flex flex-col gap-stellar-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-stellar-text">
                        {g.name}
                        {g.isPrimary && (
                          <span className="ml-stellar-2 text-xs text-stellar-accent">Primary</span>
                        )}
                      </p>
                      <p className="truncate text-sm text-stellar-text-muted">
                        {g.phone}
                        {g.relationship && ` · ${g.relationship}`}
                        {g.email && ` · ${g.email}`}
                      </p>
                      {g.idProof?.type && (
                        <p className="mt-stellar-1 text-xs text-stellar-text-muted">
                          ID: {g.idProof.type}
                          {g.idProof.number ? ` · ${g.idProof.number}` : ''}
                        </p>
                      )}
                      {g.notes && (
                        <p className="mt-stellar-1 text-xs text-stellar-text-muted">{g.notes}</p>
                      )}
                      <GuarantorDocuments documents={g.documents} idProof={g.idProof} />
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 flex-wrap gap-stellar-2">
                        <button
                          type="button"
                          className="text-sm text-stellar-accent hover:underline"
                          onClick={() => startEdit(g)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-sm text-stellar-accent hover:underline"
                          onClick={() => {
                            resetEditForm();
                            setUploadingForId((prev) => (prev === g.id ? null : g.id));
                          }}
                        >
                          {uploadingForId === g.id ? 'Cancel upload' : 'Upload document'}
                        </button>
                        <button
                          type="button"
                          className="text-sm text-stellar-danger hover:underline"
                          onClick={() => handleRemove(g.id)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                  {canManage && uploadingForId === g.id && (
                    <GuarantorUploadForm
                      customerId={customerId}
                      guarantorId={g.id}
                      onUploaded={async () => {
                        setUploadingForId(null);
                        await load();
                        onChanged?.();
                      }}
                      onCancel={() => setUploadingForId(null)}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default GuarantorSection;

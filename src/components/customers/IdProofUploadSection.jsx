import { toast } from '../../lib/toastStore.js';
import { getApiErrorMessage } from '../../utils/userValidation.js';

import { useState } from 'react';
import FileDropzone from '../upload/FileDropzone.jsx';
import Button from '../ui/Button.jsx';
import SearchableSelect from '../ui/SearchableSelect.jsx';
import { ID_PROOF_TYPE_OPTIONS } from '../../utils/customerConstants.js';
import { ACCEPT_DOCUMENTS, UPLOAD_LIMITS } from '../../utils/uploadConstants.js';
import { validateFiles, documentMaxBytes } from '../../utils/uploadHelpers.js';
import { uploadCustomerIdProofs } from '../../services/customerService.js';

function IdProofUploadSection({ customerId, onUploaded }) {
  const [type, setType] = useState(ID_PROOF_TYPE_OPTIONS[0].value);
  const [number, setNumber] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
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
    if (!number.trim()) {
      toast.error('ID number is required');
      return;
    }
    setUploading(true);
    try {
      await uploadCustomerIdProofs(customerId, files, {
        type,
        number: number.trim(),
        isPrimary,
      });
      setFiles([]);
      setNumber('');
      setIsPrimary(false);
      onUploaded?.();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-stellar-4 rounded-stellar-lg border border-dashed border-stellar-border p-stellar-4">
      <div className="grid gap-stellar-3 sm:grid-cols-2">
        <SearchableSelect
          id="proof-type"
          label="ID type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={ID_PROOF_TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
        <div className="form-group">
          <label htmlFor="proof-number" className="form-label">
            ID number
          </label>
          <input
            id="proof-number"
            className="input"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>
      </div>
      <label className="flex items-center gap-stellar-2 text-sm text-stellar-text">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(e) => setIsPrimary(e.target.checked)}
          className="h-4 w-4 accent-stellar-accent"
        />
        Set as primary ID proof
      </label>
      <FileDropzone
        accept={ACCEPT_DOCUMENTS}
        multiple
        disabled={uploading}
        label="Upload ID documents"
        hint={`Images or PDF, up to ${UPLOAD_LIMITS.customerMaxFiles} files`}
        onFilesSelected={handleFilesSelected}
      />
      {files.length > 0 && (
        <p className="text-sm text-stellar-text-muted">
          {files.length} file(s) selected: {files.map((f) => f.name).join(', ')}
        </p>
      )}
            <Button type="submit" size="sm" disabled={uploading}>
        {uploading ? 'Uploading…' : 'Upload ID proof'}
      </Button>
    </form>
  );
}

export default IdProofUploadSection;

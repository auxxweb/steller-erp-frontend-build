import FileDropzone from './FileDropzone.jsx';
import UploadPreviewGrid from './UploadPreviewGrid.jsx';
import {
  validateFiles,
  documentMaxBytes,
} from '../../utils/uploadHelpers.js';
import { ACCEPT_DOCUMENTS, UPLOAD_LIMITS } from '../../utils/uploadConstants.js';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload.js';
import { uploadCustomerDocuments } from '../../services/uploadService.js';
import { toast } from '../../lib/toastStore.js';

/**
 * Customer document uploader (ID proof, contracts, PDFs).
 */
function DocumentUpload({
  meta = {},
  maxFiles = UPLOAD_LIMITS.customerMaxFiles,
  value = [],
  onChange,
  disabled = false,
}) {
  const { assets, uploading, deleting, upload, removeOne, setInitialAssets } =
    useCloudinaryUpload({ uploadFn: uploadCustomerDocuments, defaultMeta: meta });

  const displayAssets = assets.length ? assets : value;

  const handleFiles = async (files) => {
    const list = Array.isArray(files) ? files : [files];
    const validationErrors = validateFiles(list, {
      accept: ACCEPT_DOCUMENTS,
      maxFiles,
      maxBytes: documentMaxBytes,
      label: 'document',
    });
    if (validationErrors.length) {
      toast.error(validationErrors.join('. '));
      return;
    }

    const { uploaded } = await upload(list, meta);
    const next = [...displayAssets, ...uploaded];
    setInitialAssets(next);
    onChange?.(next);
  };

  const handleRemove = async (asset) => {
    await removeOne(asset);
    const next = displayAssets.filter((a) => a.publicId !== asset.publicId);
    onChange?.(next);
  };

  return (
    <div className="space-y-stellar-4">
      <FileDropzone
        accept={ACCEPT_DOCUMENTS}
        multiple
        disabled={disabled || uploading}
        label="Upload customer documents"
        hint={`Images or PDF, up to ${maxFiles} files, ${UPLOAD_LIMITS.documentMaxMb}MB each.`}
        onFilesSelected={handleFiles}
      />

      {uploading && <p className="text-sm text-stellar-text-muted">Uploading documents…</p>}

      <UploadPreviewGrid
        items={displayAssets}
        onRemove={disabled ? undefined : handleRemove}
        removing={deleting}
      />
    </div>
  );
}

export default DocumentUpload;

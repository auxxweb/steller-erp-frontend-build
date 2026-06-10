import FileDropzone from './FileDropzone.jsx';
import UploadPreviewGrid from './UploadPreviewGrid.jsx';
import Button from '../ui/Button.jsx';
import {
  validateFiles,
  imageMaxBytes,
} from '../../utils/uploadHelpers.js';
import { ACCEPT_IMAGES, UPLOAD_LIMITS } from '../../utils/uploadConstants.js';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload.js';
import {
  uploadProductImages,
  uploadMaintenanceImages,
  uploadProductUnitImages,
} from '../../services/uploadService.js';
import { toast } from '../../lib/toastStore.js';

const UPLOAD_FNS = {
  product: uploadProductImages,
  maintenance: uploadMaintenanceImages,
  unit: uploadProductUnitImages,
};

/**
 * Multi-image uploader for products or maintenance records.
 */
function MultiImageUpload({
  type = 'product',
  meta = {},
  maxFiles = UPLOAD_LIMITS.productMaxFiles,
  value = [],
  onChange,
  disabled = false,
  label,
}) {
  const uploadFn = UPLOAD_FNS[type] || uploadProductImages;

  const { assets, uploading, deleting, upload, removeOne, setInitialAssets } =
    useCloudinaryUpload({ uploadFn, defaultMeta: meta });

  const displayAssets = assets.length ? assets : value;

  const handleFiles = async (files) => {
    const validationErrors = validateFiles(files, {
      accept: ACCEPT_IMAGES,
      maxFiles,
      maxBytes: imageMaxBytes,
      label: 'image',
    });
    if (validationErrors.length) {
      toast.error(validationErrors.join('. '));
      return;
    }

    const { uploaded } = await upload(files, meta);
    const next = [...displayAssets, ...uploaded];
    setInitialAssets(next);
    onChange?.(next);
  };

  const handleRemove = async (asset) => {
    await removeOne(asset);
    const next = displayAssets.filter((a) => a.publicId !== asset.publicId);
    onChange?.(next);
  };

  const defaultLabel =
    type === 'maintenance'
      ? 'Upload maintenance photos'
      : 'Upload product images';

  return (
    <div className="space-y-stellar-4">
      <FileDropzone
        accept={ACCEPT_IMAGES}
        multiple
        disabled={disabled || uploading}
        label={label || defaultLabel}
        hint={`Up to ${maxFiles} images, ${UPLOAD_LIMITS.imageMaxMb}MB each. JPEG, PNG, WebP.`}
        onFilesSelected={handleFiles}
      />

      {uploading && (
        <p className="text-sm text-stellar-text-muted">Uploading and compressing…</p>
      )}

      <UploadPreviewGrid
        items={displayAssets}
        onRemove={disabled ? undefined : handleRemove}
        removing={deleting}
      />

      {displayAssets.length > 0 && (
        <p className="text-xs text-stellar-text-subtle">
          {displayAssets.length} image(s) · auto-compressed on upload
        </p>
      )}
    </div>
  );
}

export default MultiImageUpload;

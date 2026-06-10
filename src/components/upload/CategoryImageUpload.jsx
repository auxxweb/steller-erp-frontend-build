import FileDropzone from './FileDropzone.jsx';
import Button from '../ui/Button.jsx';
import { validateFiles, imageMaxBytes } from '../../utils/uploadHelpers.js';
import { ACCEPT_IMAGES } from '../../utils/uploadConstants.js';
import { useCloudinaryUpload } from '../../hooks/useCloudinaryUpload.js';
import { uploadCategoryImage } from '../../services/uploadService.js';
import { toast } from '../../lib/toastStore.js';

/**
 * Single category image uploader — replaces manual URL entry when Cloudinary is configured.
 */
function CategoryImageUpload({ value, onChange, meta = {}, disabled = false }) {
  const { assets, uploading, deleting, upload, removeOne } = useCloudinaryUpload({
    uploadFn: (files, m) =>
      uploadCategoryImage(Array.isArray(files) ? files[0] : files, m),
    defaultMeta: meta,
  });

  const current = assets[0] || (value ? { url: value } : null);

  const handleFile = async (file) => {
    const validationErrors = validateFiles([file], {
      accept: ACCEPT_IMAGES,
      maxFiles: 1,
      maxBytes: imageMaxBytes,
      label: 'image',
    });
    if (validationErrors.length) {
      toast.error(validationErrors.join('. '));
      return;
    }

    const { uploaded } = await upload(file, meta);
    onChange?.(uploaded[0]?.url || '');
  };

  const handleRemove = async () => {
    if (current?.publicId) {
      await removeOne(current);
    }
    onChange?.('');
  };

  return (
    <div className="space-y-stellar-3">
      {!current?.url ? (
        <FileDropzone
          accept={ACCEPT_IMAGES}
          multiple={false}
          disabled={disabled || uploading}
          label="Upload category image"
          hint="Single image, auto-compressed."
          onFilesSelected={handleFile}
        />
      ) : (
        <div className="flex items-start gap-stellar-4">
          <img
            src={current.thumbnailUrl || current.url}
            alt="Category"
            className="h-24 w-24 rounded-stellar-lg border border-stellar-border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={disabled || deleting}
            onClick={handleRemove}
          >
            Remove image
          </Button>
        </div>
      )}
    </div>
  );
}

export default CategoryImageUpload;

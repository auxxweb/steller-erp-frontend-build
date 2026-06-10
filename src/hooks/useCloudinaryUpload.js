import { useCallback, useState } from 'react';
import { deleteUploadedAssets } from '../services/uploadService.js';
import { toDeletePayload } from '../utils/uploadHelpers.js';
import { toast } from '../lib/toastStore.js';
import { getApiErrorMessage } from '../utils/userValidation.js';

/**
 * Reusable hook for Cloudinary uploads via secure server proxy.
 *
 * @param {object} options
 * @param {(files: File[], meta?: object) => Promise<import('axios').AxiosResponse>} options.uploadFn
 * @param {object} [options.defaultMeta]
 */
export function useCloudinaryUpload({ uploadFn, defaultMeta = {} }) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assets, setAssets] = useState([]);

  const upload = useCallback(
    async (files, meta = {}) => {
      setUploading(true);
      try {
        const { data } = await uploadFn(files, { ...defaultMeta, ...meta });
        const key = data.data.images
          ? 'images'
          : data.data.documents
            ? 'documents'
            : data.data.image
              ? 'image'
              : null;

        const uploaded = key === 'image' ? [data.data.image] : data.data[key] || [];
        setAssets((prev) => [...prev, ...uploaded]);
        return { uploaded, failed: data.data.failed || [], raw: data };
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Upload failed'));
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [uploadFn, defaultMeta],
  );

  const remove = useCallback(async (items) => {
    const targets = toDeletePayload(items);
    if (!targets.length) return;

    setDeleting(true);
    try {
      const { data } = await deleteUploadedAssets(targets);
      const deletedIds = new Set(data.data.deleted.map((d) => d.publicId));
      setAssets((prev) => prev.filter((a) => !deletedIds.has(a.publicId)));
      return data.data;
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Delete failed'));
      throw err;
    } finally {
      setDeleting(false);
    }
  }, []);

  const removeOne = useCallback(
    (asset) => remove([asset]),
    [remove],
  );

  const reset = useCallback(() => {
    setAssets([]);
  }, []);

  const setInitialAssets = useCallback((initial) => {
    setAssets(initial || []);
  }, []);

  return {
    assets,
    uploading,
    deleting,
    upload,
    remove,
    removeOne,
    reset,
    setInitialAssets,
  };
}

export default useCloudinaryUpload;

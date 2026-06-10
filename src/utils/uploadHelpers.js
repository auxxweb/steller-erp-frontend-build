import { UPLOAD_LIMITS } from './uploadConstants.js';

/**
 * Build FormData for multipart upload with optional metadata fields.
 */
export const buildUploadFormData = (files, { fieldName = 'images', meta = {} } = {}) => {
  const formData = new FormData();
  const list = Array.isArray(files) ? files : [files];

  list.forEach((file) => {
    formData.append(fieldName, file);
  });

  Object.entries(meta).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, String(value));
    }
  });

  return formData;
};

/**
 * Validate files client-side before upload.
 */
export const validateFiles = (
  files,
  { accept, maxFiles, maxBytes, label = 'file' } = {},
) => {
  const errors = [];
  const list = Array.from(files || []);

  if (!list.length) {
    errors.push(`Select at least one ${label}`);
    return errors;
  }

  if (maxFiles && list.length > maxFiles) {
    errors.push(`Maximum ${maxFiles} ${label}(s) allowed`);
  }

  const acceptList = accept
    ? accept.split(',').map((t) => t.trim().toLowerCase())
    : null;

  list.forEach((file) => {
    if (maxBytes && file.size > maxBytes) {
      errors.push(`${file.name} exceeds ${Math.round(maxBytes / 1024 / 1024)}MB`);
    }
    if (acceptList && !acceptList.includes(file.type.toLowerCase())) {
      errors.push(`${file.name} has unsupported type (${file.type || 'unknown'})`);
    }
  });

  return errors;
};

export const imageMaxBytes = UPLOAD_LIMITS.imageMaxMb * 1024 * 1024;
export const documentMaxBytes = UPLOAD_LIMITS.documentMaxMb * 1024 * 1024;

/**
 * Map upload API response to simple URL list.
 */
export const pluckUploadUrls = (items) =>
  (items || []).map((item) => item.url).filter(Boolean);

/**
 * Map upload API response for delete payload.
 */
export const toDeletePayload = (items) =>
  (items || []).map((item) => ({
    publicId: item.publicId,
    url: item.url,
    resourceType: item.resourceType === 'raw' ? 'raw' : 'image',
  }));

export default buildUploadFormData;

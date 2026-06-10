import api from './api.js';
import { buildUploadFormData } from '../utils/uploadHelpers.js';
import { UPLOAD_ENDPOINTS } from '../utils/uploadConstants.js';

const multipartConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
};

/**
 * Upload product images (multiple).
 */
export const uploadProductImages = (files, meta = {}) =>
  api.post(
    UPLOAD_ENDPOINTS.products,
    buildUploadFormData(files, { fieldName: 'images', meta }),
    multipartConfig,
  );

export const uploadProductUnitImages = (files, meta = {}) =>
  api.post(
    UPLOAD_ENDPOINTS.productUnitImages,
    buildUploadFormData(files, { fieldName: 'images', meta }),
    multipartConfig,
  );

/**
 * Upload customer documents (images + PDF).
 */
export const uploadCustomerDocuments = (files, meta = {}) =>
  api.post(
    UPLOAD_ENDPOINTS.customerDocuments,
    buildUploadFormData(files, { fieldName: 'documents', meta }),
    multipartConfig,
  );

export const uploadUserDocuments = (files, meta = {}) =>
  api.post(
    UPLOAD_ENDPOINTS.userDocuments,
    buildUploadFormData(files, { fieldName: 'documents', meta }),
    multipartConfig,
  );

/**
 * Upload maintenance images (multiple).
 */
export const uploadMaintenanceImages = (files, meta = {}) =>
  api.post(
    UPLOAD_ENDPOINTS.maintenance,
    buildUploadFormData(files, { fieldName: 'images', meta }),
    multipartConfig,
  );

/**
 * Upload single category image.
 */
export const uploadCategoryImage = (file, meta = {}) =>
  api.post(
    UPLOAD_ENDPOINTS.categories,
    buildUploadFormData(file, { fieldName: 'image', meta }),
    multipartConfig,
  );

/**
 * Delete Cloudinary assets by publicId or URL.
 */
export const deleteUploadedAssets = (items) =>
  api.delete(UPLOAD_ENDPOINTS.delete, { data: { items } });

/**
 * Optional signed direct-upload params (server-generated signature).
 */
export const fetchSignedUploadParams = (params) =>
  api.get('/uploads/sign', { params });

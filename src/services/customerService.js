import api from './api.js';
import { buildUploadFormData } from '../utils/uploadHelpers.js';

const multipartConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
};

export const fetchCustomerStats = (params) => api.get('/customers/stats', { params });

export const fetchCustomers = (params) => api.get('/customers', { params });

export const fetchCustomer = (id) => api.get(`/customers/${id}`);

export const createCustomer = (payload) => api.post('/customers', payload);

export const updateCustomer = (id, payload) => api.patch(`/customers/${id}`, payload);

export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

export const blockCustomer = (id, reason) =>
  api.post(`/customers/${id}/block`, { reason });

export const unblockCustomer = (id) => api.post(`/customers/${id}/unblock`);

export const fetchCustomerRisk = (id) => api.get(`/customers/${id}/risk`);

export const recalculateCustomerRisk = (id) => api.post(`/customers/${id}/risk/recalculate`);

export const fetchCustomerRentals = (id, params) =>
  api.get(`/customers/${id}/rentals`, { params });

export const uploadCustomerIdProofs = (customerId, files, meta) =>
  api.post(
    `/customers/${customerId}/id-proofs/upload`,
    buildUploadFormData(files, {
      fieldName: 'documents',
      meta: {
        type: meta.type,
        number: meta.number,
        name: meta.name,
        isPrimary: meta.isPrimary,
      },
    }),
    multipartConfig,
  );

export const verifyCustomerIdProof = (customerId, proofId) =>
  api.post(`/customers/${customerId}/id-proofs/${proofId}/verify`);

export const fetchGuarantors = (customerId) =>
  api.get(`/customers/${customerId}/guarantors`);

export const createGuarantor = (customerId, payload) =>
  api.post(`/customers/${customerId}/guarantors`, payload);

export const deleteGuarantor = (customerId, guarantorId) =>
  api.delete(`/customers/${customerId}/guarantors/${guarantorId}`);

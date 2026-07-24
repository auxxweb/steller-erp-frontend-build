import api from './api.js';
import { fetchAllPages } from '../utils/fetchAllPages.js';

export const fetchInventoryStats = (params) =>
  api.get('/products/inventory/stats', { params });

export const fetchProducts = (params) => api.get('/products', { params });

const CATALOG_PAGE_SIZE = 100;

/** Load every page of products (API caps at 100 per page). */
export async function fetchAllProducts(params = {}) {
  return fetchAllPages(
    async (page, limit) => {
      const { data } = await fetchProducts({ ...params, page, limit });
      return {
        items: data.data.products || [],
        pages: data.data.pagination?.pages || 1,
      };
    },
    { pageSize: CATALOG_PAGE_SIZE },
  );
}

export const fetchProduct = (id) => api.get(`/products/${id}`);

export const fetchProductAvailability = (id) => api.get(`/products/${id}/availability`);

export const fetchProductHistory = (id, params) =>
  api.get(`/products/${id}/history`, { params });

export const createProduct = (payload) => api.post('/products', payload);

export const updateProduct = (id, payload) => api.patch(`/products/${id}`, payload);

export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const fetchProductUnits = (productId, params) =>
  api.get(`/products/${productId}/units`, { params });

/** Load every page of units for a product (API caps at 100 per page). */
export async function fetchAllProductUnits(productId, params = {}) {
  return fetchAllPages(
    async (page, limit) => {
      const { data } = await fetchProductUnits(productId, { ...params, page, limit });
      return {
        items: data.data.units || [],
        pages: data.data.pagination?.pages || 1,
      };
    },
    { pageSize: CATALOG_PAGE_SIZE },
  );
}

export const createProductUnit = (productId, payload) =>
  api.post(`/products/${productId}/units`, payload);

export const createProductUnitsBulk = (productId, units) =>
  api.post(`/products/${productId}/units/bulk`, { units });

export const fetchUnit = (unitId) => api.get(`/products/units/${unitId}`);

export const lookupUnit = (params) => api.get('/products/units/lookup', { params });

export const updateUnit = (unitId, payload) =>
  api.patch(`/products/units/${unitId}`, payload);

export const updateUnitStatus = (unitId, payload) =>
  api.patch(`/products/units/${unitId}/status`, payload);

export const updateUnitLocation = (unitId, payload) =>
  api.patch(`/products/units/${unitId}/location`, payload);

export const fetchUnitQr = (unitId) => api.get(`/products/units/${unitId}/qr`);

export const regenerateUnitQr = (unitId) =>
  api.post(`/products/units/${unitId}/qr/regenerate`);

export const fetchUnitHistory = (unitId, params) =>
  api.get(`/products/units/${unitId}/history`, { params });

export const deleteUnit = (unitId) => api.delete(`/products/units/${unitId}`);

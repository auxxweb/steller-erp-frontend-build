import api from './api.js';
import { fetchAllPages } from '../utils/fetchAllPages.js';

export const fetchCategoryStats = (params) => api.get('/categories/stats', { params });

export const fetchCategories = (params) => api.get('/categories', { params });

/** Load every page of categories (API caps at 100 per page). */
export async function fetchAllCategories(params = {}) {
  return fetchAllPages(async (page, limit) => {
    const { data } = await fetchCategories({ ...params, page, limit });
    return {
      items: data.data.categories || [],
      pages: data.data.pagination?.pages || 1,
    };
  });
}

export const fetchCategory = (id) => api.get(`/categories/${id}`);

export const createCategory = (payload) => api.post('/categories', payload);

export const updateCategory = (id, payload) => api.patch(`/categories/${id}`, payload);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);

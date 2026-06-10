import api from './api.js';

export const fetchCategoryStats = (params) => api.get('/categories/stats', { params });

export const fetchCategories = (params) => api.get('/categories', { params });

export const fetchCategory = (id) => api.get(`/categories/${id}`);

export const createCategory = (payload) => api.post('/categories', payload);

export const updateCategory = (id, payload) => api.patch(`/categories/${id}`, payload);

export const deleteCategory = (id) => api.delete(`/categories/${id}`);

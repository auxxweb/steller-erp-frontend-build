import api from './api.js';

const multipartConfig = {
  headers: { 'Content-Type': 'multipart/form-data' },
};

export const fetchUsers = (params) => api.get('/users', { params });

export const deleteUserPermanently = (userId) => api.delete(`/users/${userId}`);

export const updateUser = (userId, payload) => api.patch(`/users/${userId}`, payload);

export const updateUserStatus = (userId, status) =>
  api.patch(`/auth/users/${userId}/status`, { status });

export const registerUser = (payload) => api.post('/auth/register', payload);

export const createEmployee = (data, documentFiles = []) => {
  if (documentFiles.length > 0) {
    const fd = new FormData();
    fd.append('name', data.name);
    fd.append('email', data.email);
    fd.append('password', data.password);
    fd.append('phone', data.phone);
    fd.append('employeePosition', data.employeePosition || 'sales_staff');
    if (data.branch) fd.append('branch', data.branch);
    fd.append('shiftIds', JSON.stringify(data.shiftIds || []));
    fd.append('address', JSON.stringify(data.address));
    documentFiles.forEach((file) => fd.append('documents', file));
    return api.post('/users/employees', fd, multipartConfig);
  }

  return api.post('/users/employees', data);
};

export const regenerateUserPassword = (userId, payload = {}) =>
  api.post(`/users/${userId}/password/regenerate`, payload);

export const viewUserPassword = (userId) => api.get(`/users/${userId}/password`);

import api from './api.js';
import { postRefresh } from './refreshClient.js';

export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data;
};

export const logout = async (refreshToken) => {
  await api.post('/auth/logout', { refreshToken });
};

export const refreshTokens = async (refreshToken) => {
  return postRefresh(refreshToken);
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};

export const validateToken = async () => {
  const { data } = await api.get('/auth/validate');
  return data.data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async ({ token, password }) => {
  const { data } = await api.post('/auth/reset-password', { token, password });
  return data;
};

export const changePassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  const { data } = await api.post('/auth/change-password', {
    currentPassword,
    newPassword,
    confirmPassword,
  });
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.patch('/auth/profile', payload);
  return data.data.user;
};

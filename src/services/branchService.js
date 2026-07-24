import api from './api.js';
import { filterOperationalBranches } from '../utils/branchHelpers.js';
import { fetchAllPages } from '../utils/fetchAllPages.js';

export const fetchBranchStats = () => api.get('/branches/stats');

export const fetchBranches = async (params) => {
  const res = await api.get('/branches', { params });
  if (res.data?.data?.branches) {
    res.data.data.branches = filterOperationalBranches(res.data.data.branches);
  }
  return res;
};

/** Load every page of branches (API caps at 100 per page). */
export async function fetchAllBranches(params = {}) {
  return fetchAllPages(async (page, limit) => {
    const { data } = await fetchBranches({ ...params, page, limit });
    return {
      items: data.data.branches || [],
      pages: data.data.pagination?.pages || 1,
    };
  });
}

export const fetchBranch = (id) => api.get(`/branches/${id}`);

export const fetchBranchDashboard = (id) => api.get(`/branches/${id}/dashboard`);

export const fetchMyBranch = () => api.get('/branches/me');

export const fetchBranchManagers = () => api.get('/branches/managers');

export const createBranch = (payload) => api.post('/branches', payload);

export const updateBranch = (id, payload) => api.patch(`/branches/${id}`, payload);

export const deleteBranch = (id) => api.delete(`/branches/${id}`);

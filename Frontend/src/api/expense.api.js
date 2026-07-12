import axiosInstance from './axiosInstance';

export const expenseApi = {
  list: (params) => axiosInstance.get('/expenses', { params }),
  getById: (id) => axiosInstance.get(`/expenses/${id}`),
  create: (payload) => axiosInstance.post('/expenses', payload),
  update: (id, payload) => axiosInstance.put(`/expenses/${id}`, payload),
  delete: (id) => axiosInstance.delete(`/expenses/${id}`),
  getOperationalCost: (vehicleId) => axiosInstance.get(`/expenses/operational-cost/${vehicleId}`),
};

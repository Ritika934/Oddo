import axiosInstance from './axiosInstance';

export const maintenanceApi = {
  list: (params) => axiosInstance.get('/maintenance', { params }),
  getById: (id) => axiosInstance.get(`/maintenance/${id}`),
  create: (payload) => axiosInstance.post('/maintenance', payload),
  complete: (id, payload) => axiosInstance.patch(`/maintenance/${id}/complete`, payload),
};

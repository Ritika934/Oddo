import axiosInstance from './axiosInstance';

export const vehicleApi = {
  getAll: (params) => axiosInstance.get('/vehicles', { params }),
  getById: (id) => axiosInstance.get(`/vehicles/${id}`),
  create: (payload) => axiosInstance.post('/vehicles', payload),
  update: (id, payload) => axiosInstance.put(`/vehicles/${id}`, payload),
  delete: (id) => axiosInstance.delete(`/vehicles/${id}`),
};

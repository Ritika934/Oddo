import axiosInstance from './axiosInstance';

export const vehicleApi = {
  getAll: (params) => axiosInstance.get('/vehicles', { params }),
  getById: (id) => axiosInstance.get(`/vehicles/${id}`),
  create: (data) => axiosInstance.post('/vehicles', data),
  update: (id, data) => axiosInstance.put(`/vehicles/${id}`, data),
  delete: (id) => axiosInstance.delete(`/vehicles/${id}`),
};

import axiosInstance from './axiosInstance';

export const driverApi = {
  list: (params) => axiosInstance.get('/drivers', { params }),
  getById: (id) => axiosInstance.get(`/drivers/${id}`),
  create: (payload) => axiosInstance.post('/drivers', payload),
  update: (id, payload) => axiosInstance.put(`/drivers/${id}`, payload),
  suspend: (id) => axiosInstance.patch(`/drivers/${id}/suspend`),
};
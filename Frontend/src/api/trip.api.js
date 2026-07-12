import axiosInstance from './axiosInstance';

export const tripApi = {
  list: (params) => axiosInstance.get('/trips', { params }),
  getById: (id) => axiosInstance.get(`/trips/${id}`),
  create: (payload) => axiosInstance.post('/trips', payload),
  complete: (id, payload) => axiosInstance.patch(`/trips/${id}/complete`, payload),
  cancel: (id) => axiosInstance.patch(`/trips/${id}/cancel`),
  getGpsLogs: (id) => axiosInstance.get(`/trips/${id}/gps`),
};

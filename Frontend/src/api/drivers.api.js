import axiosInstance from './axiosInstance';

export const driversApi = {
  getDrivers: (params) => axiosInstance.get('/drivers', { params }),
  getDriverById: (id) => axiosInstance.get(`/drivers/${id}`),
  createDriver: (payload) => axiosInstance.post('/drivers', payload),
  updateDriver: (id, payload) => axiosInstance.put(`/drivers/${id}`, payload),
  suspendDriver: (id) => axiosInstance.patch(`/drivers/${id}/suspend`),
};

import axiosInstance from './axiosInstance';

export const fuelApi = {
  list: (params) => axiosInstance.get('/fuel', { params }),
  getById: (id) => axiosInstance.get(`/fuel/${id}`),
  create: (payload) => axiosInstance.post('/fuel', payload),
  getEfficiency: (vehicleId) => axiosInstance.get(`/fuel/efficiency/${vehicleId}`),
};

import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getStats: () => axiosInstance.get('/dashboard/stats'),
};

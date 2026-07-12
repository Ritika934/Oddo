import axiosInstance from './axiosInstance';

export const authApi = {
  login: (payload) => axiosInstance.post('/auth/login', payload),
  register: (payload) => axiosInstance.post('/auth/register', payload),
  me: () => axiosInstance.get('/auth/me'),
};

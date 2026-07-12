import axiosInstance from './axiosInstance';

   export const authApi = {
     login: (payload) => axiosInstance.post('/auth/login', payload),
     register: (payload) => axiosInstance.post('/auth/signup', payload),
     sendOtp: (payload) => axiosInstance.post('/auth/send-otp', payload),
     verifyOtp: (payload) => axiosInstance.post('/auth/verify-otp', payload),
   };
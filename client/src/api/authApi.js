import axiosInstance from './axiosInstance';

export const registerPatient = async (data) => {
  const res = await axiosInstance.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await axiosInstance.post('/auth/login', data);
  return res.data;
};

export const logoutUser = async () => {
  const res = await axiosInstance.post('/auth/logout');
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await axiosInstance.get('/auth/me');
  return res.data;
};

export const changePassword = async (data) => {
  const res = await axiosInstance.put('/auth/change-password', data);
  return res.data;
};
import axiosInstance from './axiosInstance';

export const getMyProfile = async () => {
  const res = await axiosInstance.get('/doctor/profile');
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await axiosInstance.put('/doctor/profile', data);
  return res.data;
};

export const getTodaysAppointments = async () => {
  const res = await axiosInstance.get('/doctor/appointments/today');
  return res.data;
};

export const getMyAppointments = async (params = {}) => {
  const res = await axiosInstance.get('/doctor/appointments', { params });
  return res.data;
};

export const updateAppointmentStatus = async (id, data) => {
  const res = await axiosInstance.put(`/doctor/appointments/${id}/status`, data);
  return res.data;
};

export const getPatientMedicalHistory = async (patientId) => {
  const res = await axiosInstance.get(`/doctor/patients/${patientId}/history`);
  return res.data;
};

export const createPrescription = async (data) => {
  const res = await axiosInstance.post('/doctor/prescriptions', data);
  return res.data;
};

export const getPrescriptionById = async (id) => {
  const res = await axiosInstance.get(`/doctor/prescriptions/${id}`);
  return res.data;
};

export const getMyPrescriptions = async () => {
  const res = await axiosInstance.get('/doctor/prescriptions');
  return res.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await axiosInstance.post('/doctor/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
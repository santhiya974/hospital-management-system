import axiosInstance from './axiosInstance';

export const getMyProfile = async () => {
  const res = await axiosInstance.get('/patient/profile');
  return res.data;
};

export const updateMyProfile = async (data) => {
  const res = await axiosInstance.put('/patient/profile', data);
  return res.data;
};

export const bookAppointment = async (data) => {
  const res = await axiosInstance.post('/patient/appointments', data);
  return res.data;
};

export const getMyAppointments = async (params = {}) => {
  const res = await axiosInstance.get('/patient/appointments', { params });
  return res.data;
};

export const cancelMyAppointment = async (id, data = {}) => {
  const res = await axiosInstance.put(`/patient/appointments/${id}/cancel`, data);
  return res.data;
};

export const getMyMedicalHistory = async () => {
  const res = await axiosInstance.get('/patient/history');
  return res.data;
};

export const getPrescriptionById = async (id) => {
  const res = await axiosInstance.get(`/patient/prescriptions/${id}`);
  return res.data;
};

export const getDepartmentsList = async () => {
  const res = await axiosInstance.get('/patient/departments');
  return res.data;
};

export const getDoctorsList = async (departmentId = '') => {
  const res = await axiosInstance.get('/patient/doctors', {
    params: departmentId ? { department: departmentId } : {},
  });
  return res.data;
};
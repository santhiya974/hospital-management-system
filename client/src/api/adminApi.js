import axiosInstance from './axiosInstance';

// ---------- Departments ----------
export const getDepartments = async () => {
  const res = await axiosInstance.get('/admin/departments');
  return res.data;
};

export const createDepartment = async (data) => {
  const res = await axiosInstance.post('/admin/departments', data);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await axiosInstance.put(`/admin/departments/${id}`, data);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await axiosInstance.delete(`/admin/departments/${id}`);
  return res.data;
};

// ---------- Doctors ----------
export const getDoctors = async () => {
  const res = await axiosInstance.get('/admin/doctors');
  return res.data;
};

export const getDoctorById = async (id) => {
  const res = await axiosInstance.get(`/admin/doctors/${id}`);
  return res.data;
};

export const createDoctor = async (data) => {
  const res = await axiosInstance.post('/admin/doctors', data);
  return res.data;
};

export const updateDoctor = async (id, data) => {
  const res = await axiosInstance.put(`/admin/doctors/${id}`, data);
  return res.data;
};

export const deleteDoctor = async (id) => {
  const res = await axiosInstance.delete(`/admin/doctors/${id}`);
  return res.data;
};

// ---------- Patients ----------
export const getPatients = async () => {
  const res = await axiosInstance.get('/admin/patients');
  return res.data;
};

export const getPatientById = async (id) => {
  const res = await axiosInstance.get(`/admin/patients/${id}`);
  return res.data;
};

export const updatePatient = async (id, data) => {
  const res = await axiosInstance.put(`/admin/patients/${id}`, data);
  return res.data;
};

export const deletePatient = async (id) => {
  const res = await axiosInstance.delete(`/admin/patients/${id}`);
  return res.data;
};

// ---------- Appointments ----------
export const getAllAppointments = async (params = {}) => {
  const res = await axiosInstance.get('/admin/appointments', { params });
  return res.data;
};

export const getAppointmentById = async (id) => {
  const res = await axiosInstance.get(`/admin/appointments/${id}`);
  return res.data;
};

export const updateAppointmentStatus = async (id, data) => {
  const res = await axiosInstance.put(`/admin/appointments/${id}/status`, data);
  return res.data;
};

export const deleteAppointment = async (id) => {
  const res = await axiosInstance.delete(`/admin/appointments/${id}`);
  return res.data;
};

// ---------- Dashboard / Reports ----------
export const getDashboardStats = async () => {
  const res = await axiosInstance.get('/admin/dashboard/stats');
  return res.data;
};

export const getAppointmentTrends = async (params = {}) => {
  const res = await axiosInstance.get('/admin/dashboard/appointment-trends', { params });
  return res.data;
};

export const getRevenueReport = async () => {
  const res = await axiosInstance.get('/admin/dashboard/revenue-report');
  return res.data;
};

export const getTopDoctors = async () => {
  const res = await axiosInstance.get('/admin/dashboard/top-doctors');
  return res.data;
};
import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // sends the httpOnly JWT cookie automatically
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: normalize error messages, handle auth failures globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';

    // Let individual pages handle 401/403 via AuthContext instead of forcing
    // a hard redirect here — keeps this interceptor simple and predictable.

    return Promise.reject({ ...error, message });
  }
);

export default axiosInstance;
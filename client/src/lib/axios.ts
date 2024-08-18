import axios from 'axios';

export const endpoints = {
  'patient-appointments': "/appointment/patient-appointments/",
  'search-medicines': "/medicine",
  'create-prescription': "/prescription/",
  'create-invoice': '/prescription/today/'
}

const axiosInstance = axios.create({
  baseURL: 'http://localhost:8888/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default axiosInstance;

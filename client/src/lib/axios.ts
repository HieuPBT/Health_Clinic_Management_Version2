import axios from 'axios';

export const endpoints = {
  'create-appointment': '/appointment/',
  'patient-appointments': "/appointment/patient-appointments/",
  'appointments-count': '/appointment/appointment-counts/',
  'available-booking-times': '/appointment/available-booking-times',
  'search-medicines': "/medicine",
  'create-prescription': "/prescription/",
  'create-invoice': '/prescription/today/',
  'my-appointment': '/appointment/',
  'register': '/auth/register/',
  'departments': '/department/',
  'cancel-appointment': (id: any)=>`/appointment/${id}/cancel`
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

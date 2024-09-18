import axios from 'axios';

export const endpoints = {
  'create-appointment': '/appointment/',
  'patient-appointments': "/appointment/patient-appointments/",
  'appointments-count': '/appointment/appointment-counts/',
  'available-booking-times': '/appointment/available-booking-times',
  'search-medicines': "/medicine",
  'create-prescription': "/prescription/",
  'patient-invoices': '/prescription/today/',
  'create-invoice': (prescriptionId: string) => `/prescription/${prescriptionId}/invoice`,
  'my-appointment': '/appointment/',
  'register': '/auth/register/',
  'activate': '/auth/new-activation-link/',
  'change-password': '/auth/change-password/',
  'forgot-password': '/auth/forgot-password/',
  'check-email': '/auth/check-email/',
  'departments': '/department/',
  'cancel-appointment': (id: any)=>`/appointment/${id}/cancel`,
  'confirm-appointment': (appointmentId: string) =>`/appointment/${appointmentId}/confirm/`,
  'reject-appointment': (appointmentId: string) => `/appointment/${appointmentId}/reject`,
  'create-momo': "/payment/create-momo",
  'create-zalopay': "/payment/create-zalopay",
  'create-vnpay': "/payment/create-vnpay",
  'staff': '/user/staff',
  'search-patient-profile': '/prescription/patient-prescriptions',
}

// export const endpo = {
//   test :{
//     limit: '/api'
//   },
//   test2: {
//     limit2: '/api'
//   }
// }

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

import axios from 'axios';
import Cookies from 'js-cookie';

// Lấy API URL từ biến môi trường, fallback về localhost cho development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Tạo instance axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Danh sách các endpoint public không cần logout
      const publicEndpoints = [
        '/api/movies',
        '/api/cinemas',
        '/api/showtimes',
        '/api/concessions',
        '/api/auth/login',
        '/api/auth/register'
      ];
      
      // Danh sách các endpoint admin - để component tự xử lý lỗi
      const adminEndpoints = [
        '/api/admin'
      ];
      
      const requestUrl = error.config?.url || '';
      const isPublicEndpoint = publicEndpoints.some(endpoint => requestUrl.includes(endpoint));
      const isAdminEndpoint = adminEndpoints.some(endpoint => requestUrl.includes(endpoint));
      
      // Chỉ logout nếu không phải endpoint public hoặc admin
      if (!isPublicEndpoint && !isAdminEndpoint) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

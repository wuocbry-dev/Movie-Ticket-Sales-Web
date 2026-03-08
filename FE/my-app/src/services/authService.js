import api from './api';

export const authService = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  // Đăng ký
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    // Xóa token khỏi cookies
    const Cookies = require('js-cookie');
    Cookies.remove('authToken');
  },

  // Kiểm tra xem user đã đăng nhập chưa
  isAuthenticated: () => {
    const Cookies = require('js-cookie');
    return !!Cookies.get('authToken');
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;

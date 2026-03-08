import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const PAYMENT_API_URL = `${API_BASE}/payments`;

// Cấu hình axios instance
const api = axios.create({
  baseURL: PAYMENT_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để tự động thêm token vào mọi request
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

const paymentService = {
  // Xử lý thanh toán
  processPayment: async (bookingId) => {
    try {
      console.log('💳 Processing payment for booking:', bookingId);
      const response = await api.post('/process', { bookingId });
      console.log('✅ Payment processed successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error processing payment:', error.response?.data || error);
      throw error;
    }
  },

  // Kiểm tra trạng thái thanh toán
  checkPaymentStatus: async (transactionId) => {
    try {
      const response = await api.get(`/status/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      throw error;
    }
  }
};

export default paymentService;

import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_URL = `${API_BASE}/booking`;
const BOOKING_API_URL = `${API_BASE}/bookings`;

// Cấu hình axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios instance riêng cho bookings API
const bookingApi = axios.create({
  baseURL: BOOKING_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor để tự động thêm token vào mọi request
const addAuthInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.request.use(
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
};

// Thêm interceptor cho cả 2 axios instances
addAuthInterceptor(api);
addAuthInterceptor(bookingApi);

const bookingService = {
  // Lấy tất cả rạp
  getAllCinemas: async (city = null) => {
    try {
      const params = city ? { city } : {};
      const response = await api.get('/cinemas', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      throw error;
    }
  },

  // Lấy danh sách thành phố
  getAllCities: async () => {
    try {
      const response = await api.get('/cities');
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  },

  // Lấy tất cả phim đang chiếu
  getMovies: async (cinemaId = null) => {
    try {
      const params = cinemaId ? { cinemaId } : {};
      const response = await api.get('/movies', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  // Lấy các ngày có suất chiếu
  getAvailableDates: async (movieId, cinemaId) => {
    try {
      const response = await api.get('/dates', {
        params: { movieId, cinemaId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching dates:', error);
      throw error;
    }
  },

  // Lấy các suất chiếu theo phim, rạp, ngày
  getShowtimes: async (movieId, cinemaId, date) => {
    try {
      const response = await api.get('/showtimes', {
        params: { movieId, cinemaId, date }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes:', error);
      throw error;
    }
  },

  // Lấy showtimes của một phim (grouped by date)
  getShowtimesByMovie: async (movieId, days = 7) => {
    try {
      const response = await api.get(`/showtimes/movie/${movieId}`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes by movie:', error);
      throw error;
    }
  },

  // Lấy showtimes của một rạp (grouped by date)
  getShowtimesByCinema: async (cinemaId, days = 7) => {
    try {
      const response = await api.get(`/showtimes/cinema/${cinemaId}`, {
        params: { days }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching showtimes by cinema:', error);
      throw error;
    }
  },

  // ===== BOOKING ENDPOINTS =====
  
  // Tạo booking mới (public endpoint - không cần token)
  createBooking: async (bookingData) => {
    try {
      console.log('🎫 Creating booking with data:', bookingData);
      // Sử dụng axios trực tiếp không có interceptor để tránh gửi token invalid
      const response = await axios.post(`${API_BASE}/bookings`, bookingData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Booking created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating booking:', error.response?.data || error);
      throw error;
    }
  },

  // Lấy thông tin booking theo ID
  getBookingById: async (bookingId) => {
    try {
      const response = await bookingApi.get(`/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching booking:', error);
      throw error;
    }
  },

  // Lấy danh sách booking của user
  getUserBookings: async (userId) => {
    try {
      const response = await bookingApi.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user bookings:', error);
      throw error;
    }
  },

  // Hủy booking
  cancelBooking: async (bookingId) => {
    try {
      const response = await bookingApi.delete(`/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error canceling booking:', error);
      throw error;
    }
  }
};

export default bookingService;

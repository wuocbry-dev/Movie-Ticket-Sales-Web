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

let isRefreshing = false;
let pendingRequests = [];

const normalizeRequestUrl = (requestUrl = '') => {
  if (!requestUrl) return '';
  if (/^https?:\/\//i.test(requestUrl)) {
    return requestUrl;
  }
  if (requestUrl.startsWith('/api/')) {
    return requestUrl;
  }
  if (requestUrl.startsWith('/')) {
    return `/api${requestUrl}`;
  }
  return `/api/${requestUrl}`;
};

const clearAuthSession = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('userChanged'));
};

const notifyPendingRequests = (token) => {
  pendingRequests.forEach((callback) => callback(token));
  pendingRequests = [];
};

const requestNewAccessToken = async () => {
  const refreshToken = Cookies.get('refreshToken');
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refreshToken },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response?.data?.success || !response?.data?.data?.accessToken) {
    throw new Error(response?.data?.message || 'Token refresh failed');
  }

  const newAccessToken = response.data.data.accessToken;
  const newRefreshToken = response.data.data.refreshToken;

  Cookies.set('accessToken', newAccessToken);
  if (newRefreshToken) {
    Cookies.set('refreshToken', newRefreshToken);
  }

  return newAccessToken;
};

// Interceptor để tự động thêm token vào mỗi request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
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
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const rawRequestUrl = originalRequest.url || '';
    const requestUrl = normalizeRequestUrl(rawRequestUrl);

    // Danh sách các endpoint public không cần logout
    const publicEndpoints = [
      '/api/movies',
      '/api/cinemas',
      '/api/showtimes',
      '/api/concessions',
      '/api/promotions',
      '/api/auth/login',
      '/api/auth/register'
    ];

    // Danh sách các endpoint admin - để component tự xử lý lỗi
    const adminEndpoints = [
      '/api/admin'
    ];

    const authEndpoints = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh'
    ];

    const isPublicEndpoint = publicEndpoints.some((endpoint) => requestUrl.includes(endpoint));
    const isAdminEndpoint = adminEndpoints.some((endpoint) => requestUrl.includes(endpoint));
    const isAuthEndpoint = authEndpoints.some((endpoint) => requestUrl.includes(endpoint));

    if (status === 401 && !isPublicEndpoint && !isAuthEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const newAccessToken = await requestNewAccessToken();
        notifyPendingRequests(newAccessToken);
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        notifyPendingRequests(null);

        // Chỉ logout nếu không phải endpoint public hoặc admin
        if (!isPublicEndpoint && !isAdminEndpoint) {
          clearAuthSession();
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 401) {
      // Chỉ logout nếu không phải endpoint public hoặc admin
      if (!isPublicEndpoint && !isAdminEndpoint) {
        clearAuthSession();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

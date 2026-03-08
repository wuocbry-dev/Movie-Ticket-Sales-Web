import api from './api';

export const showtimeService = {
  // Lấy danh sách suất chiếu theo phim
  getShowtimesByMovie: async (movieId) => {
    const response = await api.get(`/showtimes/movie/${movieId}`);
    return response.data;
  },

  // Lấy chi tiết một suất chiếu
  getShowtimeById: async (showtimeId) => {
    const response = await api.get(`/showtimes/${showtimeId}`);
    return response.data;
  },

  // Tạo suất chiếu mới (Admin/Manager)
  createShowtime: async (showtimeData) => {
    const response = await api.post('/showtimes', showtimeData);
    return response.data;
  },

  // Cập nhật suất chiếu (Admin/Manager)
  updateShowtime: async (showtimeId, showtimeData) => {
    const response = await api.put(`/showtimes/${showtimeId}`, showtimeData);
    return response.data;
  },

  // Xóa suất chiếu (Admin/Manager)
  deleteShowtime: async (showtimeId) => {
    const response = await api.delete(`/showtimes/${showtimeId}`);
    return response.data;
  }
};

export default showtimeService;

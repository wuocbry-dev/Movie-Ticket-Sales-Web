import api from './api';

export const cinemaHallService = {
  // Lấy thông tin chi tiết phòng chiếu
  getHallById: async (hallId) => {
    const response = await api.get(`/cinema-halls/${hallId}`);
    return response.data;
  },

  // Lấy danh sách phòng chiếu theo rạp
  getHallsByCinema: async (cinemaId, page = 0, size = 10, search = '') => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (search) params.append('search', search);
    
    const response = await api.get(`/cinema-halls/cinema/${cinemaId}?${params.toString()}`);
    return response.data;
  }
};

export default cinemaHallService;

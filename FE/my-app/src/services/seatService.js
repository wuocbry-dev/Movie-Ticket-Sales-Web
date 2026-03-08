import api from './api';

export const seatService = {
  // Lấy trạng thái ghế cho suất chiếu
  getSeatAvailability: async (showtimeId, sessionId) => {
    const response = await api.get(`/seats/availability/${showtimeId}?sessionId=${sessionId}`);
    return response.data;
  },

  // Giữ ghế tạm thời
  holdSeats: async (holdData) => {
    const response = await api.post('/seats/hold', holdData);
    return response.data;
  },

  // Thả ghế đã giữ
  releaseSeats: async (sessionId, showtimeId, seatIds) => {
    const params = new URLSearchParams();
    params.append('sessionId', sessionId);
    params.append('showtimeId', showtimeId);
    seatIds.forEach(id => params.append('seatIds', id));
    
    const response = await api.post(`/seats/release?${params.toString()}`);
    return response.data;
  },

  // Gia hạn thời gian giữ ghế
  extendHold: async (sessionId, showtimeId, seatIds, additionalMinutes = 5) => {
    const params = new URLSearchParams();
    params.append('sessionId', sessionId);
    params.append('showtimeId', showtimeId);
    params.append('additionalMinutes', additionalMinutes);
    seatIds.forEach(id => params.append('seatIds', id));
    
    const response = await api.post(`/seats/extend-hold?${params.toString()}`);
    return response.data;
  }
};

export default seatService;

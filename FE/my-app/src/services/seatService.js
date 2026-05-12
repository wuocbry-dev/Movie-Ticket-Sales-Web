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

  // Thả ghế sử dụng sendBeacon (để gọi khi unmount/đóng tab)
  releaseSeatsBeacon: (sessionId, showtimeId, seatIds) => {
    if (!sessionId || !showtimeId || !seatIds || seatIds.length === 0) return;
    const params = new URLSearchParams();
    params.append('sessionId', sessionId);
    params.append('showtimeId', showtimeId);
    seatIds.forEach(id => params.append('seatIds', id));
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
    navigator.sendBeacon(`${baseUrl}/seats/release?${params.toString()}`);
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

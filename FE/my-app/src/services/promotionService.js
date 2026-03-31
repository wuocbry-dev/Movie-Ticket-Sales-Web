import api from './api';

const promotionService = {
  getAllActive: async () => {
    const response = await api.get('/promotions');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data ?? []);
  },

  getById: async (id) => {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },

  getAllForAdmin: async () => {
    const response = await api.get('/promotions/admin/all');
    const data = response.data;
    return Array.isArray(data) ? data : (data?.data ?? data ?? []);
  },

  create: async (body) => {
    const response = await api.post('/promotions', body);
    return response.data;
  },

  update: async (id, body) => {
    const response = await api.put(`/promotions/${id}`, body);
    return response.data;
  },

  delete: async (id) => {
    await api.delete(`/promotions/${id}`);
  },

  /** Upload ảnh khuyến mãi lên S3. Trả về URL ảnh. */
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload/promotion', formData);
      const res = response.data;
      if (res?.data?.url) return res.data.url;
      if (res?.url) return res.url;
      throw new Error(res?.message || 'Upload thất bại');
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Upload ảnh thất bại';
      throw new Error(msg);
    }
  },
};

export default promotionService;

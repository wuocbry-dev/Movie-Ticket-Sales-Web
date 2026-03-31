import api from './api';

const concessionService = {
  /**
   * Lấy tất cả categories (danh mục bắp nước)
   */
  getAllCategories: async () => {
    try {
      const response = await api.get('/concessions/categories');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả sản phẩm bắp nước (public - không cần chọn rạp)
   */
  getAllItems: async () => {
    try {
      const response = await api.get('/concessions/items');
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
      console.error('Error fetching concession items:', error);
      throw error;
    }
  },

  /**
   * Lấy items theo category
   */
  getItemsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/concessions/items/category/${categoryId}`);
      const data = response.data;
      return Array.isArray(data) ? data : (data?.data ?? []);
    } catch (error) {
      console.error('Error fetching items by category:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả items có bán tại rạp
   */
  getAvailableItemsByCinema: async (cinemaId) => {
    try {
      const response = await api.get(`/cinemas/${cinemaId}/concessions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cinema concessions:', error);
      throw error;
    }
  },

  /**
   * Lấy items theo category tại rạp
   */
  getItemsByCinemaAndCategory: async (cinemaId, categoryId) => {
    try {
      const response = await api.get(`/cinemas/${cinemaId}/concessions/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching items by category:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết item tại rạp
   */
  getItemDetails: async (cinemaId, itemId) => {
    try {
      const response = await api.get(`/cinemas/${cinemaId}/concessions/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching item details:', error);
      throw error;
    }
  }
};

export default concessionService;

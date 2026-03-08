import api from './api';

const concessionService = {
  /**
   * Lấy tất cả categories
   */
  getAllCategories: async () => {
    try {
      const response = await api.get('/concessions/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
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

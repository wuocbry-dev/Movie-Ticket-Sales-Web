import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_BASE_URL = `${API_BASE}/loyalty`;

const getAuthHeader = () => {
    const token = Cookies.get('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loyaltyService = {
    // Lấy lịch sử tích điểm
    getPointsHistory: async (userId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/points/history/${userId}`,
                { headers: getAuthHeader() }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching points history:', error);
            throw error;
        }
    },

    // Lấy số dư điểm
    getPointsBalance: async (userId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/points/balance/${userId}`,
                { headers: getAuthHeader() }
            );
            return response.data.data || response.data;
        } catch (error) {
            console.error('Error fetching points balance:', error);
            // Return default value instead of throwing to avoid breaking booking flow
            return { availablePoints: 0, totalEarned: 0, totalRedeemed: 0 };
        }
    },

    // Preview giảm giá khi sử dụng điểm (public endpoint)
    previewPointsDiscount: async (userId, pointsToUse, totalAmount) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/points/preview`,
                { 
                    params: { userId, pointsToUse, totalAmount }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error previewing points discount:', error);
            return null;
        }
    }
};

export default loyaltyService;
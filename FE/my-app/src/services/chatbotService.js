import api from './api';

/**
 * Service gọi API chatbot mới (multi-node).
 * Dùng api instance đã có interceptor JWT tự động gắn token.
 */

/**
 * Gửi tin nhắn tới chatbot API mới.
 * @param {string} message - Tin nhắn người dùng
 * @param {string|null} conversationId - ID cuộc hội thoại (optional)
 * @returns {Promise} Response từ chatbot
 */
export const sendChatMessage = async (message, conversationId = null) => {
    const response = await api.post('/chatbot/message', {
        message,
        conversationId,
    });
    return response.data;
};

export default {
    sendChatMessage,
};

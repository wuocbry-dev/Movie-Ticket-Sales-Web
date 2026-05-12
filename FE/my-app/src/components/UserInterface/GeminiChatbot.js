import React from 'react';
import ChatbotWidget from './Chatbot/ChatbotWidget';

/**
 * GeminiChatbot — Wrapper backward compatible.
 * Trước đây là component chatbot chính, giờ ủy quyền cho ChatbotWidget mới.
 * Giữ file này để các trang đang import không bị lỗi.
 */
const GeminiChatbot = () => {
    return <ChatbotWidget />;
};

export default GeminiChatbot;

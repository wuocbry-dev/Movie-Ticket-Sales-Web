import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { sendChatMessage } from '../../../services/chatbotService';
import ChatMessage from './ChatMessage';
import ChatActionCard from './ChatActionCard';
import QuickActions from './QuickActions';
import './ChatbotWidget.css';

/**
 * ChatbotWidget — Component chatbot chính với kiến trúc multi-node.
 * 
 * - Gọi API mới: POST /api/chatbot/message
 * - JWT token tự động gắn qua api.js interceptor
 * - Không gửi userId trong body (backend lấy từ JWT)
 * - Hỗ trợ action data, movie recommendations, suggested actions
 */
const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addBotMessage(
                '👋 Xin chào! Tôi là trợ lý AI của Q Cinema.\n\n' +
                'Tôi có thể giúp bạn:\n' +
                '• Tìm phim và gợi ý phim phù hợp\n' +
                '• Xem suất chiếu và giá vé\n' +
                '• Xem vé đã đặt, hủy vé\n' +
                '• Thông tin khuyến mãi\n\n' +
                'Hãy hỏi tôi bất cứ điều gì về dịch vụ rạp phim!'
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const addBotMessage = (text, data = null) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                text,
                sender: 'bot',
                timestamp: new Date(),
                actionType: data?.actionType || null,
                actionData: data?.actionData || null,
                recommendations: data?.recommendations || null,
                suggestedActions: data?.suggestedActions || null,
            },
        ]);
    };

    const addUserMessage = (text) => {
        setMessages((prev) => [
            ...prev,
            {
                id: Date.now(),
                text,
                sender: 'user',
                timestamp: new Date(),
            },
        ]);
    };

    const handleSendMessage = async (overrideMessage = null) => {
        const msg = overrideMessage || inputMessage.trim();
        if (!msg) return;

        addUserMessage(msg);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await sendChatMessage(msg, conversationId);

            setIsTyping(false);

            if (response) {
                // Lưu conversation ID
                if (response.conversationId) {
                    setConversationId(response.conversationId);
                }

                addBotMessage(response.message || 'Tôi đã xử lý yêu cầu của bạn.', {
                    actionType: response.actionType,
                    actionData: response.actionData,
                    recommendations: response.recommendations,
                    suggestedActions: response.suggestedActions,
                });
            } else {
                addBotMessage('Xin lỗi, tôi không thể xử lý yêu cầu lúc này.');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            setIsTyping(false);
            addBotMessage(
                'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau! 😊'
            );
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleQuickAction = (message) => {
        handleSendMessage(message);
    };

    const handleSuggestedAction = (action) => {
        handleSendMessage(action);
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                className={`chatbot-floating-btn ${isOpen ? 'hidden' : ''}`}
                onClick={() => setIsOpen(true)}
                aria-label="Mở chatbot"
            >
                <img src="/cinema-logo.png" alt="Q Cinema AI" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                <span className="chatbot-badge">AI</span>
                <span className="chatbot-pulse" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-header-avatar">
                                <img src="/cinema-logo.png" alt="Q Cinema" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '50%' }} />
                            </div>
                            <div>
                                <h3>Q Cinema AI</h3>
                                <span className="chatbot-header-status">
                                    <span className="chatbot-status-dot" />
                                    Powered by Gemini
                                </span>
                            </div>
                        </div>
                        <button className="chatbot-close-btn" onClick={() => setIsOpen(false)}>
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages">
                        {messages.map((msg) => (
                            <div key={msg.id}>
                                <ChatMessage message={msg} />

                                {/* Action Cards */}
                                {(msg.recommendations || msg.actionData) && (
                                    <ChatActionCard
                                        actionType={msg.actionType}
                                        actionData={msg.actionData}
                                        recommendations={msg.recommendations}
                                    />
                                )}

                                {/* Suggested Actions */}
                                {msg.sender === 'bot' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                                    <div className="chatbot-suggested-actions">
                                        {msg.suggestedActions.map((action, idx) => (
                                            <button
                                                key={idx}
                                                className="chatbot-suggestion-btn"
                                                onClick={() => handleSuggestedAction(action)}
                                            >
                                                {action}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="chatbot-message bot">
                                <div className="chatbot-message-avatar">
                                    <img src="/cinema-logo.png" alt="Bot" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                </div>
                                <div className="chatbot-message-content">
                                    <div className="chatbot-typing">
                                        <span /><span /><span />
                                    </div>
                                    <span className="chatbot-typing-text">AI đang xử lý...</span>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} style={{ height: 16, flexShrink: 0 }} />
                    </div>

                    {/* Quick Actions (chỉ hiện khi ít message) */}
                    {messages.length <= 1 && (
                        <QuickActions onSelectAction={handleQuickAction} />
                    )}

                    {/* Input */}
                    <div className="chatbot-input-area">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Hỏi tôi về phim, vé, suất chiếu..."
                            disabled={isTyping}
                        />
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={!inputMessage.trim() || isTyping}
                            aria-label="Gửi tin nhắn"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;

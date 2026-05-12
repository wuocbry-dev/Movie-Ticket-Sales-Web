import React from 'react';
import { FaRobot } from 'react-icons/fa';

/**
 * ChatMessage — Render từng tin nhắn trong chatbot.
 * Hỗ trợ: text, emoji, timestamp.
 */
const ChatMessage = ({ message }) => {
    const { text, sender, timestamp } = message;

    return (
        <div className={`chatbot-message ${sender}`}>
            {sender === 'bot' && (
                <div className="chatbot-message-avatar">
                    <img src="/cinema-logo.png" alt="Bot" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                </div>
            )}
            <div className="chatbot-message-content">
                <div className="chatbot-message-text">
                    {renderText(text)}
                </div>
                <span className="chatbot-message-time">
                    {timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </span>
            </div>
        </div>
    );
};

/**
 * Render text với line breaks.
 */
const renderText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
        <React.Fragment key={i}>
            {line}
            {i < text.split('\n').length - 1 && <br />}
        </React.Fragment>
    ));
};

export default ChatMessage;

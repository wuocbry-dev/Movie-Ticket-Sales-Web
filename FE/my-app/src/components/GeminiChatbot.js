import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaLightbulb } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './GeminiChatbot.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const GeminiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      addBotMessage(
        "👋 Xin chào! Tôi là trợ lý AI của Q Cinema được hỗ trợ bởi Google Gemini.\n\n" +
        "Tôi có thể giúp bạn:\n" +
        "• Tìm phim phù hợp với sở thích\n" +
        "• Gợi ý phim theo tâm trạng\n" +
        "• Thông tin chi tiết về phim\n\n" +
        "Bạn muốn xem phim gì hôm nay?"
      );
    }
  }, [isOpen]);

  const addBotMessage = (text, recommendations = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender: 'bot',
      timestamp: new Date(),
      recommendations
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage.trim();
    addUserMessage(userMsg);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get userId and token from localStorage if logged in
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.userId || null;
      const token = localStorage.getItem('token');

      // Prepare headers with token if available
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Call backend API
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: userMsg,
        userId: userId
      }, { headers });

      setIsTyping(false);

      if (response.data) {
        addBotMessage(
          response.data.message || "Đây là những phim tôi gợi ý cho bạn:",
          response.data.recommendations || []
        );
      } else {
        addBotMessage("Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.");
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      addBotMessage(
        "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau!\n\n" +
        "Lưu ý: Đảm bảo đã cấu hình Gemini API key trong application.properties:\n" +
        "gemini.api.key=YOUR_API_KEY"
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Gợi ý phim hành động hay",
    "Tôi muốn xem phim kinh dị",
    "Phim nào đang hot nhất?",
    "Phim hài vui vẻ cuối tuần"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    setIsOpen(false);
  };

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`gemini-chat-button ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <FaRobot size={24} />
        <span className="chat-badge">AI</span>
        <span className="chat-pulse"></span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="gemini-chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <FaRobot size={20} />
              </div>
              <div>
                <h3>Q Cinema AI Assistant</h3>
                <span className="chatbot-status">
                  <span className="status-dot"></span>
                  Powered by Gemini
                </span>
              </div>
            </div>
            <button className="close-button" onClick={() => setIsOpen(false)}>
              <FaTimes />
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.sender === 'bot' && (
                  <div className="message-avatar">
                    <FaRobot />
                  </div>
                )}
                <div className="message-content">
                  <div className="message-text">{msg.text}</div>
                  
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="movie-recommendations">
                      {msg.recommendations.map((movie, idx) => (
                        <div 
                          key={idx} 
                          className="movie-card-mini"
                          onClick={() => handleMovieClick(movie.movieId)}
                        >
                          <img 
                            src={movie.posterUrl || '/placeholder-movie.jpg'} 
                            alt={movie.title}
                            onError={(e) => e.target.src = '/placeholder-movie.jpg'}
                          />
                          <div className="movie-card-info">
                            <h4>{movie.title}</h4>
                            <div className="movie-meta">
                              <span className="rating">
                                ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                              </span>
                              <span className="duration">{movie.durationMinutes}p</span>
                            </div>
                            {movie.reason && (
                              <p className="movie-reason">{movie.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <span className="message-time">
                    {msg.timestamp.toLocaleTimeString('vi-VN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot">
                <div className="message-avatar">
                  <FaRobot />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">AI đang suy nghĩ...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="quick-questions">
              <div className="quick-questions-header">
                <FaLightbulb /> Câu hỏi gợi ý:
              </div>
              <div className="quick-questions-grid">
                {quickQuestions.map((q, idx) => (
                  <button 
                    key={idx}
                    className="quick-question-btn"
                    onClick={() => handleQuickQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Hỏi tôi về phim..."
              disabled={isTyping}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;

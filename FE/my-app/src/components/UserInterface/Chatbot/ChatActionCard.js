import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilm, FaTicketAlt, FaClock, FaTag, FaStar } from 'react-icons/fa';

/**
 * ChatActionCard — Render kết quả action từ chatbot.
 * Hỗ trợ: danh sách phim, booking, suất chiếu, khuyến mãi, giá vé.
 */
const ChatActionCard = ({ actionType, actionData, recommendations }) => {
    const navigate = useNavigate();

    // Render movie recommendations (backward compatible)
    if (recommendations && recommendations.length > 0) {
        return (
            <div className="chatbot-action-cards">
                {recommendations.map((movie, idx) => (
                    <div
                        key={idx}
                        className="chatbot-movie-card"
                        onClick={() => {
                            navigate(`/movie/${movie.movieId}`);
                        }}
                    >
                        <img
                            src={movie.posterUrl || '/placeholder-movie.jpg'}
                            alt={movie.title}
                            onError={(e) => (e.target.src = '/placeholder-movie.jpg')}
                        />
                        <div className="chatbot-movie-info">
                            <h4>{movie.title}</h4>
                            <div className="chatbot-movie-meta">
                                {movie.rating && (
                                    <span className="chatbot-rating">
                                        <FaStar /> {movie.rating.toFixed(1)}
                                    </span>
                                )}
                                {movie.durationMinutes && (
                                    <span className="chatbot-duration">
                                        <FaClock /> {movie.durationMinutes}p
                                    </span>
                                )}
                            </div>
                            {movie.reason && (
                                <p className="chatbot-movie-reason">{movie.reason}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Render action data based on type
    if (!actionData) return null;

    switch (actionType) {
        case 'VIEW_MY_BOOKINGS':
            return renderBookings(actionData);
        case 'GET_PROMOTIONS':
            return renderPromotions(actionData);
        case 'GET_TICKET_PRICE':
            return renderPriceInfo(actionData);
        case 'GET_SHOWTIMES':
            return renderShowtimes(actionData);
        default:
            return null;
    }
};

// Render booking list
const renderBookings = (bookings) => {
    if (!Array.isArray(bookings) || bookings.length === 0) return null;
    return (
        <div className="chatbot-action-cards">
            {bookings.map((booking, idx) => (
                <div key={idx} className="chatbot-booking-card">
                    <div className="chatbot-booking-header">
                        <FaTicketAlt />
                        <span className="chatbot-booking-code">{booking.bookingCode}</span>
                        <span className={`chatbot-booking-status status-${(booking.status || '').toLowerCase()}`}>
                            {booking.status}
                        </span>
                    </div>
                    {booking.movieTitle && <div className="chatbot-booking-movie">{booking.movieTitle}</div>}
                    {booking.totalAmount && (
                        <div className="chatbot-booking-amount">
                            {Number(booking.totalAmount).toLocaleString('vi-VN')} VND
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// Render promotions list
const renderPromotions = (promotions) => {
    if (!Array.isArray(promotions) || promotions.length === 0) return null;
    return (
        <div className="chatbot-action-cards">
            {promotions.map((promo, idx) => (
                <div key={idx} className="chatbot-promo-card">
                    <FaTag className="chatbot-promo-icon" />
                    <div>
                        <h4>{promo.title}</h4>
                        {promo.description && <p>{promo.description}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Render ticket price info
const renderPriceInfo = (priceData) => {
    if (!priceData || typeof priceData !== 'object') return null;
    return (
        <div className="chatbot-price-card">
            {Object.entries(priceData).map(([key, value], idx) => (
                key !== 'note' && (
                    <div key={idx} className="chatbot-price-row">
                        <span className="chatbot-price-label">{key}</span>
                        <span className="chatbot-price-value">{value}</span>
                    </div>
                )
            ))}
            {priceData.note && <p className="chatbot-price-note">{priceData.note}</p>}
        </div>
    );
};

// Render showtimes list
const renderShowtimes = (showtimes) => {
    if (!Array.isArray(showtimes) || showtimes.length === 0) return null;
    return (
        <div className="chatbot-action-cards">
            {showtimes.map((st, idx) => (
                <div key={idx} className="chatbot-showtime-card">
                    <FaFilm className="chatbot-showtime-icon" />
                    <div>
                        <h4>{st.movieTitle || 'Phim'}</h4>
                        <div className="chatbot-showtime-time">
                            <FaClock /> {st.startTime} - {st.endTime}
                        </div>
                        {st.basePrice && (
                            <div className="chatbot-showtime-price">
                                {Number(st.basePrice).toLocaleString('vi-VN')} VND
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatActionCard;

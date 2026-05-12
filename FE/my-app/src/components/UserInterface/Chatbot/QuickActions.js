import React from 'react';
import { FaFilm, FaTicketAlt, FaClock, FaTag, FaInfoCircle, FaChartBar, FaUserCheck } from 'react-icons/fa';
import Cookies from 'js-cookie';

/**
 * QuickActions — Gợi ý nhanh thay đổi theo role user.
 * Guest: phim, suất chiếu, khuyến mãi
 * User: + vé của tôi, đặt vé
 * Staff: + check-in, tra cứu booking
 * Admin: + thống kê
 */

const QUICK_ACTIONS = {
    guest: [
        { icon: <FaFilm />, text: "Phim đang chiếu?", message: "Cho tôi xem phim đang chiếu" },
        { icon: <FaClock />, text: "Suất chiếu hôm nay", message: "Hôm nay có suất chiếu nào?" },
        { icon: <FaTag />, text: "Khuyến mãi?", message: "Có khuyến mãi gì không?" },
        { icon: <FaInfoCircle />, text: "Giá vé", message: "Giá vé bao nhiêu?" },
    ],
    user: [
        { icon: <FaFilm />, text: "Phim đang chiếu?", message: "Cho tôi xem phim đang chiếu" },
        { icon: <FaTicketAlt />, text: "Vé của tôi", message: "Xem vé đã đặt của tôi" },
        { icon: <FaClock />, text: "Đặt vé", message: "Tôi muốn đặt vé xem phim" },
        { icon: <FaTag />, text: "Khuyến mãi?", message: "Có khuyến mãi gì không?" },
    ],
    staff: [
        { icon: <FaUserCheck />, text: "Check-in vé", message: "Tôi muốn check-in vé cho khách" },
        { icon: <FaTicketAlt />, text: "Tra cứu booking", message: "Tra cứu booking theo mã" },
        { icon: <FaFilm />, text: "Phim đang chiếu?", message: "Cho tôi xem phim đang chiếu" },
        { icon: <FaClock />, text: "Suất chiếu hôm nay", message: "Hôm nay có suất chiếu nào?" },
    ],
    admin: [
        { icon: <FaChartBar />, text: "Thống kê doanh thu", message: "Xem thống kê doanh thu" },
        { icon: <FaFilm />, text: "Phim đang chiếu?", message: "Cho tôi xem phim đang chiếu" },
        { icon: <FaTicketAlt />, text: "Vé của tôi", message: "Xem vé đã đặt của tôi" },
        { icon: <FaTag />, text: "Khuyến mãi?", message: "Có khuyến mãi gì không?" },
    ],
};

/**
 * Xác định role từ localStorage user info.
 */
const getUserRole = () => {
    try {
        const token = Cookies.get('accessToken');
        if (!token) return 'guest';

        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const roles = user.roles || [];

        if (roles.some(r => ['SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'ADMIN'].includes(r))) {
            return 'admin';
        }
        if (roles.some(r => ['CINEMA_STAFF'].includes(r))) {
            return 'staff';
        }
        if (token) {
            return 'user';
        }
        return 'guest';
    } catch {
        return 'guest';
    }
};

const QuickActions = ({ onSelectAction }) => {
    const role = getUserRole();
    const actions = QUICK_ACTIONS[role] || QUICK_ACTIONS.guest;

    return (
        <div className="chatbot-quick-actions">
            <div className="quick-actions-label">💡 Gợi ý nhanh:</div>
            <div className="quick-actions-grid">
                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        className="quick-action-btn"
                        onClick={() => onSelectAction(action.message)}
                        title={action.message}
                    >
                        <span className="quick-action-icon">{action.icon}</span>
                        <span className="quick-action-text">{action.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;

import React, { useState, useEffect } from 'react';
import { loyaltyService } from '../services/loyaltyService';
import { FaStar, FaGift, FaHistory, FaCoins } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './LoyaltyPoints.css';

const LoyaltyPoints = ({ userId }) => {
    const [balance, setBalance] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchBalance();
            fetchHistory();
        }
    }, [userId]);

    const fetchBalance = async () => {
        try {
            const response = await loyaltyService.getPointsBalance(userId);
            if (response.success) {
                setBalance(response.data);
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const response = await loyaltyService.getPointsHistory(userId);
            if (response.success) {
                setHistory(response.data);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    };

    const getTransactionIcon = (type) => {
        const icons = {
            EARN: '🎁',
            REDEEM: '🎯',
            EXPIRE: '⏰',
            ADJUST: '⚙️',
            GIFT: '🌟'
        };
        return icons[type] || '💰';
    };

    const getTransactionLabel = (type) => {
        const labels = {
            EARN: 'Tích điểm',
            REDEEM: 'Đổi quà',
            EXPIRE: 'Hết hạn',
            ADJUST: 'Điều chỉnh',
            GIFT: 'Tặng điểm'
        };
        return labels[type] || type;
    };

    const getSourceLabel = (sourceType) => {
        const labels = {
            BOOKING: 'Đặt vé',
            BONUS: 'Thưởng',
            BIRTHDAY: 'Sinh nhật',
            REFERRAL: 'Giới thiệu',
            PROMOTION: 'Khuyến mãi',
            MANUAL: 'Thủ công',
            CONCESSION: 'Bắp nước'
        };
        return labels[sourceType] || sourceType;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="loyalty-points-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin điểm thưởng...</p>
            </div>
        );
    }

    return (
        <div className="loyalty-points-container">
            {/* Points Balance Card */}
            {balance && (
                <div className="points-balance-card">
                    <div className="balance-header">
                        <FaCoins className="balance-icon" />
                        <h2>Điểm Thưởng Của Tôi</h2>
                    </div>
                    
                    <div className="balance-main">
                        <div className="available-points">
                            <span className="label">Điểm hiện có</span>
                            <span className="points-value">{balance.availablePoints?.toLocaleString()}</span>
                            <span className="points-unit">điểm</span>
                        </div>
                    </div>

                    <div className="balance-stats">
                        <div className="stat-item">
                            <FaStar className="stat-icon earned" />
                            <div className="stat-info">
                                <span className="stat-label">Tổng tích lũy</span>
                                <span className="stat-value">{balance.totalEarned?.toLocaleString()} điểm</span>
                            </div>
                        </div>
                        <div className="stat-item">
                            <FaGift className="stat-icon redeemed" />
                            <div className="stat-info">
                                <span className="stat-label">Đã sử dụng</span>
                                <span className="stat-value">{balance.totalRedeemed?.toLocaleString()} điểm</span>
                            </div>
                        </div>
                    </div>

                    <button 
                        className="view-history-btn"
                        onClick={() => setShowHistory(!showHistory)}
                    >
                        <FaHistory /> {showHistory ? 'Ẩn lịch sử' : 'Xem lịch sử'}
                    </button>
                </div>
            )}

            {/* Points History */}
            {showHistory && history.length > 0 && (
                <div className="points-history-section">
                    <h3>Lịch Sử Giao Dịch</h3>
                    <div className="history-list">
                        {history.map((transaction) => (
                            <div 
                                key={transaction.transactionId} 
                                className={`history-item ${transaction.pointsAmount > 0 ? 'earned' : 'redeemed'}`}
                            >
                                <div className="transaction-icon">
                                    {getTransactionIcon(transaction.transactionType)}
                                </div>
                                <div className="transaction-details">
                                    <div className="transaction-header">
                                        <span className="transaction-type">
                                            {getTransactionLabel(transaction.transactionType)}
                                        </span>
                                        {transaction.sourceType && (
                                            <span className="source-badge">
                                                {getSourceLabel(transaction.sourceType)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="transaction-description">
                                        {transaction.description}
                                    </p>
                                    <div className="transaction-footer">
                                        <span className="transaction-date">
                                            {formatDate(transaction.createdAt)}
                                        </span>
                                        {transaction.expiresAt && (
                                            <span className="expires-date">
                                                Hết hạn: {new Date(transaction.expiresAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="transaction-amount">
                                    <span className={`points ${transaction.pointsAmount > 0 ? 'positive' : 'negative'}`}>
                                        {transaction.pointsAmount > 0 ? '+' : ''}{transaction.pointsAmount?.toLocaleString()}
                                    </span>
                                    <span className="balance-after">
                                        Số dư: {transaction.balanceAfter?.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showHistory && history.length === 0 && (
                <div className="no-history">
                    <FaHistory className="no-history-icon" />
                    <p>Chưa có lịch sử giao dịch</p>
                </div>
            )}

            {/* Points Info */}
            <div className="points-info-card">
                <h4>💡 Thông Tin Tích Điểm</h4>
                <ul>
                    <li>✅ <strong>1,000 VND = 1 điểm</strong></li>
                    <li>✅ Tự động tích điểm khi thanh toán thành công</li>
                    <li>✅ Hệ số nhân điểm theo hạng thành viên</li>
                    <li>✅ Điểm có hiệu lực 12 tháng</li>
                </ul>
            </div>
        </div>
    );
};

export default LoyaltyPoints;

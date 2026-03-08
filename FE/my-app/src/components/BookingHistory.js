import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../services/bookingService';
import Cookies from 'js-cookie';
import { FaTicketAlt, FaCalendar, FaClock, FaMapMarkerAlt, FaChair, FaQrcode, FaUtensils } from 'react-icons/fa';
import './BookingHistory.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const API_HOST = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

const BookingHistory = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, completed, cancelled
  const [expandedBooking, setExpandedBooking] = useState(null); // Track which booking's details are expanded
  const [showQRCode, setShowQRCode] = useState({}); // Track QR code visibility for each booking
  const [concessionOrders, setConcessionOrders] = useState({}); // Store concession orders by bookingId

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Lấy thông tin user từ localStorage
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'undefined') {
        toast.error('Vui lòng đăng nhập để xem lịch sử');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.userId;

      if (!userId) {
        toast.error('Không tìm thấy thông tin người dùng');
        navigate('/login');
        return;
      }

      console.log('📋 Fetching bookings for userId:', userId);
      
      // Gọi API lấy danh sách bookings của user
      const response = await bookingService.getUserBookings(userId);
      
      console.log('✅ Bookings Response:', response);
      
      // Response là PagedBookingResponse với structure:
      // { data: [], totalElements, totalPages, currentPage, pageSize }
      if (response.data && Array.isArray(response.data)) {
        console.log('📦 Total bookings:', response.totalElements);
        console.log('📄 Bookings data:', response.data);
        console.log('🔍 First booking structure:', response.data[0]);
        setBookings(response.data);
        
        if (response.data.length === 0) {
          toast.info('Bạn chưa có booking nào');
        }
      } else if (response.content && Array.isArray(response.content)) {
        // Fallback for 'content' structure
        console.log('📦 Bookings from content:', response.content.length);
        setBookings(response.content);
      } else if (Array.isArray(response)) {
        console.log('📦 Bookings array:', response.length);
        setBookings(response);
      } else {
        console.log('⚠️ No bookings data found in response');
        console.log('Response structure:', Object.keys(response));
        setBookings([]);
        toast.info('Chưa có lịch sử đặt vé');
      }
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        toast.error('Không thể tải lịch sử đặt vé');
      }
    } finally {
      // Minimum loading time 500ms for better UX
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CONFIRMED': { label: 'Đã xác nhận', className: 'status-confirmed' },
      'PENDING': { label: 'Chờ xử lý', className: 'status-pending' },
      'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' },
      'COMPLETED': { label: 'Hoàn thành', className: 'status-completed' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'status-default' };
    return <span className={`status-badge ${config.className}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND' 
    }).format(amount);
  };

  const toggleBookingDetails = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
    
    // Load concession order when expanding booking details
    if (expandedBooking !== bookingId && !concessionOrders[bookingId]) {
      fetchConcessionOrder(bookingId);
    }
  };

  const fetchConcessionOrder = async (bookingId) => {
    try {
      const token = Cookies.get('accessToken');
      
      console.log('🔑 Access token:', token ? 'Found' : 'Not found');
      console.log('📦 Fetching concession order for booking:', bookingId);
      
      if (!token) {
        console.warn('⚠️ No access token found, skipping concession fetch');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/concessions/orders/booking/${bookingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('📡 Response status:', response.status);

      if (response.status === 204) {
        // No concession order for this booking
        console.log(`ℹ️ No concession items for booking ${bookingId}`);
        return;
      }

      if (response.status === 401) {
        console.error('🔒 Unauthorized - token may be invalid or expired');
        return;
      }

      if (response.ok) {
        const concessionOrder = await response.json();
        console.log('✅ Concession order loaded:', concessionOrder);
        
        setConcessionOrders(prev => ({
          ...prev,
          [bookingId]: concessionOrder
        }));
      } else {
        console.error('❌ Failed to fetch concession order:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('❌ Error fetching concession order:', error);
    }
  };

  const toggleQRCode = (bookingId) => {
    setShowQRCode(prev => ({
      ...prev,
      [bookingId]: !prev[bookingId]
    }));
  };

  const getTicketQRCode = (booking) => {
    // Return the QR code URL from booking if available
    if (booking.qrCode) {
      // If qrCode is already a full URL
      if (booking.qrCode.startsWith('http')) {
        return booking.qrCode;
      }
      // If qrCode is a relative path, prepend base URL
      return `${API_HOST}${booking.qrCode}`;
    }
    return null;
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy vé này?')) {
      return;
    }

    try {
      console.log('🚫 Canceling booking:', bookingId);
      await bookingService.cancelBooking(bookingId);
      toast.success('Hủy vé thành công!');
      fetchBookings(); // Reload bookings
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      toast.error(error.response?.data?.message || 'Không thể hủy vé');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return booking.status === 'CONFIRMED';
    if (filter === 'completed') return booking.status === 'COMPLETED';
    if (filter === 'cancelled') return booking.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="booking-history-page">
      <div className="booking-container">
        <div className="page-header">
          <div className="header-content">
            <FaTicketAlt className="header-icon" />
            <div>
              <h1>Lịch Sử Đặt Vé</h1>
              <p className="header-subtitle">Quản lý tất cả các vé đã đặt</p>
            </div>
          </div>
          {isLoading && (
            <div className="header-loading">
              <span className="mini-spinner"></span>
              <span>Đang tải...</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="filter-tabs">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            Tất cả ({bookings.length})
          </button>
          <button 
            className={filter === 'upcoming' ? 'active' : ''} 
            onClick={() => setFilter('upcoming')}
          >
            Sắp chiếu ({bookings.filter(b => b.status === 'CONFIRMED').length})
          </button>
          <button 
            className={filter === 'completed' ? 'active' : ''} 
            onClick={() => setFilter('completed')}
          >
            Đã xem ({bookings.filter(b => b.status === 'COMPLETED').length})
          </button>
          <button 
            className={filter === 'cancelled' ? 'active' : ''} 
            onClick={() => setFilter('cancelled')}
          >
            Đã hủy ({bookings.filter(b => b.status === 'CANCELLED').length})
          </button>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="empty-state">
            <FaTicketAlt className="empty-icon" />
            <h3>Chưa có lịch sử đặt vé</h3>
            <p>Bạn chưa đặt vé nào. Hãy khám phá các phim đang chiếu!</p>
            <button className="browse-movies-btn" onClick={() => navigate('/')}>
              Xem phim ngay
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking.bookingId} className="booking-card">
                {/* Main Info */}
                <div className="booking-info">
                  <div className="booking-header-row">
                    <h3 className="booking-movie-title">{booking.movieTitle || 'N/A'}</h3>
                    <span className="booking-id">ID: #{booking.bookingId}</span>
                  </div>
                  {booking.bookingCode && (
                    <div className="booking-code">
                      Mã vé: <strong>{booking.bookingCode}</strong>
                    </div>
                  )}
                  <div className="booking-meta">
                    <span className="booking-meta-item">
                      <FaCalendar style={{ fontSize: '11px', marginRight: '4px' }} />
                      {booking.showDate || 'N/A'} {booking.startTime || ''}
                    </span>
                    <span className="booking-meta-item">
                      <FaMapMarkerAlt style={{ fontSize: '11px', marginRight: '4px' }} />
                      {booking.cinemaName || 'N/A'} - {booking.hallName || 'N/A'}
                    </span>
                    <span className="booking-meta-item">
                      <FaChair style={{ fontSize: '11px', marginRight: '4px' }} />
                      {booking.totalSeats || 0} ghế
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="booking-status">
                  {getStatusBadge(booking.status)}
                </div>

                {/* Amount */}
                <div className="booking-amount">
                  <span className="amount-label">Tổng tiền</span>
                  <span className="amount-value">{formatCurrency(booking.totalAmount || 0)}</span>
                  {booking.paymentStatus === 'COMPLETED' && booking.totalAmount && (
                    <span className="points-earned">
                      💎 +{Math.floor(booking.totalAmount / 1000)} điểm
                    </span>
                  )}
                </div>

                {/* Toggle Details Button */}
                <div className="booking-actions">
                  <button 
                    className="btn-details"
                    onClick={() => toggleBookingDetails(booking.bookingId)}
                  >
                    {expandedBooking === booking.bookingId ? '▲ Thu gọn' : '▼ Chi tiết'}
                  </button>
                  {(booking.status === 'CONFIRMED' || booking.status === 'PENDING') && (
                    <button 
                      className="btn-cancel"
                      onClick={() => handleCancelBooking(booking.bookingId)}
                    >
                      Hủy vé
                    </button>
                  )}
                </div>

                {/* Expanded Details Section */}
                {expandedBooking === booking.bookingId && (
                  <div className="booking-details-expanded">
                    {/* Seats Detail */}
                    {booking.tickets && booking.tickets.length > 0 && (
                      <div className="detail-section">
                        <h4 className="detail-title">
                          <FaChair /> Danh sách ghế ({booking.tickets.length})
                        </h4>
                        <div className="seats-grid">
                          {booking.tickets.map((ticket, index) => (
                            <div key={index} className="seat-detail-badge">
                              <span className="seat-label">{ticket.seatRow}{ticket.seatNumber}</span>
                              <span className="seat-type">{ticket.seatType}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Concession Items - from API */}
                    {concessionOrders[booking.bookingId] && concessionOrders[booking.bookingId].items && concessionOrders[booking.bookingId].items.length > 0 && (
                      <div className="detail-section">
                        <h4 className="detail-title">
                          <FaUtensils /> Đồ ăn & Nước uống ({concessionOrders[booking.bookingId].items.length} món)
                        </h4>
                        <div className="concession-items-list">
                          {concessionOrders[booking.bookingId].items.map((item, index) => (
                            <div key={index} className="concession-item">
                              <div className="concession-item-info">
                                <span className="concession-name">{item.itemName || 'Món ăn'}</span>
                                <span className="concession-qty">x{item.quantity}</span>
                              </div>
                              <span className="concession-price">{formatCurrency(item.subtotal || (item.unitPrice * item.quantity))}</span>
                            </div>
                          ))}
                          <div className="concession-total">
                            <span>Tổng đồ ăn:</span>
                            <span className="total-price">{formatCurrency(concessionOrders[booking.bookingId].totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR Code Section */}
                    <div className="detail-section">
                      <h4 className="detail-title">
                        <FaQrcode /> Mã QR vé (Check-in)
                      </h4>
                      <button 
                        className="btn-show-qr"
                        onClick={() => toggleQRCode(booking.bookingId)}
                      >
                        {showQRCode[booking.bookingId] ? '🔒 Ẩn mã QR' : '📱 Hiển thị mã QR vé'}
                      </button>
                      
                      {showQRCode[booking.bookingId] && (
                        <div className="qr-code-container">
                          {getTicketQRCode(booking) ? (
                            <>
                              <img 
                                src={getTicketQRCode(booking)} 
                                alt="Ticket QR Code" 
                                className="qr-code-image"
                              />
                              <p className="qr-instruction">Xuất trình mã QR này khi check-in tại rạp</p>
                              {booking.bookingCode && (
                                <p className="payment-reference">Mã vé: {booking.bookingCode}</p>
                              )}
                            </>
                          ) : (
                            <p className="qr-unavailable">Mã QR vé chưa được tạo hoặc không khả dụng</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;

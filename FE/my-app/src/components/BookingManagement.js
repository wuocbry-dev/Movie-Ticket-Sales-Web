import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaSearch, 
  FaTimes,
  FaSpinner,
  FaTicketAlt,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFilm,
  FaCalendar,
  FaClock,
  FaChair,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheck,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './BookingManagement.css';

const BookingManagement = () => {
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [holdingSeats, setHoldingSeats] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [holdExpiresAt, setHoldExpiresAt] = useState(null);
  
  const [formData, setFormData] = useState({
    userId: null,
    showtimeId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    seatIds: [],
    sessionId: '',
    voucherCode: '',
    paymentMethod: 'CASH'
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    fetchBookings();
    fetchShowtimes();
  }, [token, page]);

  // Generate unique session ID
  const generateSessionId = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `UUID-${date}-HOLD-${random}`;
  };

  // Fetch bookings
  const fetchBookings = async (pageNum = page, search = searchTerm) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/bookings/admin/all?page=${pageNum}&size=10`;
      if (search) {
        url += `&search=${search}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách vé');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setBookings(result.data.data || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 0);
        setPage(result.data.currentPage || 0);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Có lỗi xảy ra khi tải danh sách vé');
    } finally {
      setLoading(false);
    }
  };

  // Fetch showtimes
  const fetchShowtimes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/admin/all?page=0&size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    }
  };

  // Fetch seats for selected showtime
  const fetchSeats = async (showtimeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seats/showtime/${showtimeId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      if (result.success && result.data) {
        setSeats(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Không thể tải danh sách ghế');
    }
  };

  // Hold seats
  const handleHoldSeats = async () => {
    if (!selectedShowtime || selectedSeats.length === 0) {
      toast.error('Vui lòng chọn suất chiếu và ghế ngồi');
      return;
    }

    if (!formData.customerEmail) {
      toast.error('Vui lòng nhập email khách hàng');
      return;
    }

    const newSessionId = generateSessionId();
    setHoldingSeats(true);

    try {
      const response = await fetch(`${API_BASE_URL}/seats/hold`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          showtimeId: selectedShowtime.showtimeId,
          seatIds: selectedSeats,
          sessionId: newSessionId,
          customerEmail: formData.customerEmail
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể giữ ghế');
      }

      setSessionId(newSessionId);
      setHoldExpiresAt(result.data.holdExpiresAt);
      setFormData({ ...formData, sessionId: newSessionId, seatIds: selectedSeats });
      
      toast.success('Đã giữ ghế thành công! Vui lòng hoàn tất đặt vé trong 2 phút.');
      
      // Start countdown timer
      startCountdown(result.data.holdExpiresAt);
      
    } catch (error) {
      console.error('Error holding seats:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi giữ ghế');
    } finally {
      setHoldingSeats(false);
    }
  };

  // Countdown timer for seat hold
  const startCountdown = (expiresAt) => {
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = expiresAt - now;
      
      if (timeLeft <= 0) {
        clearInterval(interval);
        toast.warning('Hết thời gian giữ ghế! Vui lòng chọn lại.');
        setHoldExpiresAt(null);
        setSessionId('');
        setSelectedSeats([]);
        fetchSeats(selectedShowtime.showtimeId);
      }
    }, 1000);
  };

  // Handle create booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    
    if (!sessionId) {
      toast.error('Vui lòng giữ ghế trước khi đặt vé');
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Vui lòng điền đầy đủ thông tin khách hàng');
      return;
    }

    setSubmitting(true);

    try {
      const bookingData = {
        userId: formData.userId,
        showtimeId: selectedShowtime.showtimeId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        seatIds: selectedSeats,
        sessionId: sessionId,
        voucherCode: formData.voucherCode || null,
        paymentMethod: formData.paymentMethod
      };

      const response = await fetch(`${API_BASE_URL}/bookings/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể tạo vé');
      }

      toast.success(result.message || 'Đặt vé thành công!');
      handleCloseModal();
      fetchBookings();

    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi đặt vé');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchBookings(0, value);
  };

  // Handle open modal
  const handleOpenModal = () => {
    setShowModal(true);
    setFormData({
      userId: null,
      showtimeId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      seatIds: [],
      sessionId: '',
      voucherCode: '',
      paymentMethod: 'CASH'
    });
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSeats([]);
    setSessionId('');
    setHoldExpiresAt(null);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSeats([]);
    setSessionId('');
    setHoldExpiresAt(null);
  };

  // Handle showtime selection
  const handleShowtimeSelect = (e) => {
    const showtimeId = parseInt(e.target.value);
    const showtime = showtimes.find(st => st.showtimeId === showtimeId);
    setSelectedShowtime(showtime);
    setFormData({ ...formData, showtimeId });
    setSelectedSeats([]);
    setSessionId('');
    setHoldExpiresAt(null);
    
    if (showtimeId) {
      fetchSeats(showtimeId);
    } else {
      setSeats([]);
    }
  };

  // Handle seat selection
  const handleSeatToggle = (seatId) => {
    if (sessionId) {
      toast.warning('Bạn đã giữ ghế. Vui lòng hoàn tất đặt vé hoặc hủy để chọn lại.');
      return;
    }

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format date time
  const formatDateTime = (date, time) => {
    return `${date} ${time}`;
  };

  // Get payment method label
  const getPaymentMethodLabel = (method) => {
    const methods = {
      'CASH': 'Tiền mặt',
      'CREDIT_CARD': 'Thẻ tín dụng',
      'DEBIT_CARD': 'Thẻ ghi nợ',
      'E_WALLET': 'Ví điện tử',
      'BANK_TRANSFER': 'Chuyển khoản'
    };
    return methods[method] || method;
  };

  // Get booking status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': { label: 'Chờ xử lý', class: 'badge-warning' },
      'CONFIRMED': { label: 'Đã xác nhận', class: 'badge-success' },
      'CANCELLED': { label: 'Đã hủy', class: 'badge-danger' },
      'COMPLETED': { label: 'Hoàn thành', class: 'badge-info' }
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-secondary' };
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>;
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!holdExpiresAt) return null;
    const timeLeft = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="booking-management">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>
            <FaTicketAlt /> Quản Lý Vé
          </h1>
          <p>Quản lý đặt vé và bán vé tại quầy</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenModal}>
          <FaPlus /> Đặt Vé Mới
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng, email, số điện thoại..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách vé...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <FaTicketAlt className="empty-icon" />
          <h3>Chưa có vé nào</h3>
          <p>Nhấn "Đặt Vé Mới" để tạo vé đầu tiên</p>
        </div>
      ) : (
        <>
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.bookingId} className="booking-card">
                <div className="booking-header">
                  <div className="booking-id">#{booking.bookingId}</div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="booking-body">
                  <div className="booking-movie">
                    <FaFilm className="info-icon" />
                    <span className="movie-title">{booking.movieTitle}</span>
                  </div>

                  <div className="booking-info-row">
                    <FaUser className="info-icon" />
                    <span>{booking.customerName}</span>
                  </div>

                  <div className="booking-info-row">
                    <FaEnvelope className="info-icon" />
                    <span>{booking.customerEmail}</span>
                  </div>

                  <div className="booking-info-row">
                    <FaPhone className="info-icon" />
                    <span>{booking.customerPhone}</span>
                  </div>

                  <div className="booking-info-row">
                    <FaMapMarkerAlt className="info-icon" />
                    <span>{booking.cinemaName} - {booking.hallName}</span>
                  </div>

                  <div className="booking-info-row">
                    <FaCalendar className="info-icon" />
                    <span>{formatDateTime(booking.showDate, booking.startTime)}</span>
                  </div>

                  <div className="booking-info-row">
                    <FaChair className="info-icon" />
                    <span>Ghế: {booking.seatNumbers?.join(', ')}</span>
                  </div>

                  <div className="booking-info-row">
                    <FaCreditCard className="info-icon" />
                    <span>{getPaymentMethodLabel(booking.paymentMethod)}</span>
                  </div>

                  <div className="booking-price">
                    <FaMoneyBillWave className="info-icon" />
                    <span className="price">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-section">
              <div className="pagination-info">
                Hiển thị {bookings.length} / {totalElements} vé
              </div>
              <div className="pagination-controls">
                <button 
                  className="btn btn-secondary"
                  onClick={() => fetchBookings(page - 1)}
                  disabled={page === 0}
                >
                  Trước
                </button>
                <span className="page-indicator">
                  Trang {page + 1} / {totalPages}
                </span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => fetchBookings(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create Booking Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Đặt Vé Mới</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreateBooking}>
              {/* Step 1: Select Showtime */}
              <div className="form-section">
                <h3>Bước 1: Chọn Suất Chiếu</h3>
                <div className="form-group">
                  <label>Suất chiếu <span className="required">*</span></label>
                  <select
                    value={formData.showtimeId}
                    onChange={handleShowtimeSelect}
                    required
                  >
                    <option value="">-- Chọn suất chiếu --</option>
                    {showtimes.map(showtime => (
                      <option key={showtime.showtimeId} value={showtime.showtimeId}>
                        {showtime.movieTitle} - {showtime.cinemaName} ({showtime.hallName}) - {formatDateTime(showtime.showDate, showtime.startTime)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 2: Select Seats */}
              {selectedShowtime && (
                <div className="form-section">
                  <h3>Bước 2: Chọn Ghế</h3>
                  <div className="seats-container">
                    <div className="screen">Màn Hình</div>
                    <div className="seats-grid">
                      {seats.map(seat => {
                        const isSelected = selectedSeats.includes(seat.seatId);
                        const isBooked = seat.status === 'BOOKED';
                        const isHeld = seat.status === 'HELD';
                        
                        return (
                          <button
                            key={seat.seatId}
                            type="button"
                            className={`seat ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''} ${isHeld ? 'held' : ''}`}
                            onClick={() => handleSeatToggle(seat.seatId)}
                            disabled={isBooked || isHeld}
                            title={`${seat.seatNumber} - ${formatCurrency(seat.price)}`}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                    <div className="seats-legend">
                      <div className="legend-item">
                        <span className="legend-color available"></span>
                        <span>Trống</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color selected"></span>
                        <span>Đã chọn</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color held"></span>
                        <span>Đang giữ</span>
                      </div>
                      <div className="legend-item">
                        <span className="legend-color booked"></span>
                        <span>Đã đặt</span>
                      </div>
                    </div>
                  </div>

                  {selectedSeats.length > 0 && !sessionId && (
                    <div className="selected-seats-info">
                      <p>Đã chọn: <strong>{selectedSeats.length} ghế</strong></p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleHoldSeats}
                        disabled={holdingSeats || !formData.customerEmail}
                      >
                        {holdingSeats ? <FaSpinner className="spinner-small" /> : <FaCheck />}
                        Giữ Ghế (2 phút)
                      </button>
                    </div>
                  )}

                  {sessionId && holdExpiresAt && (
                    <div className="hold-timer">
                      <FaClock />
                      <span>Thời gian còn lại: <strong>{getTimeRemaining()}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Customer Info */}
              {sessionId && (
                <div className="form-section">
                  <h3>Bước 3: Thông Tin Khách Hàng</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Họ tên <span className="required">*</span></label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email <span className="required">*</span></label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Số điện thoại <span className="required">*</span></label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        placeholder="0987654321"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Phương thức thanh toán <span className="required">*</span></label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                        required
                      >
                        <option value="CASH">Tiền mặt</option>
                        <option value="CREDIT_CARD">Thẻ tín dụng</option>
                        <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                        <option value="E_WALLET">Ví điện tử</option>
                        <option value="BANK_TRANSFER">Chuyển khoản</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Mã voucher (Tùy chọn)</label>
                    <input
                      type="text"
                      value={formData.voucherCode}
                      onChange={(e) => setFormData({...formData, voucherCode: e.target.value})}
                      placeholder="DISCOUNT2024"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting || !sessionId}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-small" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Xác Nhận Đặt Vé
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import './BookingManagement.css';

const BookingManagement = () => {
  const navigate = useNavigate();
  const holdIntervalRef = useRef(null);

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
  const [listTick, setListTick] = useState(0);

  const [formData, setFormData] = useState({
    userId: null,
    showtimeId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    seatIds: [],
    sessionId: '',
    voucherCode: '',
    paymentMethod: 'CASH',
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const authHeaders = useMemo(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const bumpList = () => setListTick((t) => t + 1);

  const clearHoldTimer = () => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
  };

  const fetchBookings = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/bookings/admin/all?page=${page}&size=10`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách vé');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setBookings(result.data.data || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 0);
        if (typeof result.data.currentPage === 'number') {
          setPage(result.data.currentPage);
        }
      }
    } catch {
      toast.error('Có lỗi xảy ra khi tải danh sách vé');
    } finally {
      setLoading(false);
    }
  }, [token, page, searchTerm, API_BASE_URL, authHeaders, navigate]);

  const fetchShowtimes = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/admin/all?page=0&size=100`, {
        method: 'GET',
        headers: authHeaders,
      });
      const result = await response.json();
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
      }
    } catch {
      /* dropdown */
    }
  }, [token, API_BASE_URL, authHeaders]);

  const fetchSeats = useCallback(
    async (showtimeId) => {
      if (!showtimeId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/seats/showtime/${showtimeId}`, {
          method: 'GET',
          headers: authHeaders,
        });
        const result = await response.json();
        if (result.success && result.data) {
          setSeats(result.data || []);
        }
      } catch {
        toast.error('Không thể tải danh sách ghế');
      }
    },
    [API_BASE_URL, authHeaders]
  );

  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    fetchShowtimes();
  }, [token, fetchShowtimes]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, listTick]);

  useEffect(
    () => () => {
      clearHoldTimer();
    },
    []
  );

  const generateSessionId = () => {
    const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `UUID-${date}-HOLD-${random}`;
  };

  const startCountdown = (expiresAt) => {
    clearHoldTimer();
    const end =
      typeof expiresAt === 'number' ? expiresAt : new Date(expiresAt).getTime();
    holdIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const timeLeft = end - now;
      if (timeLeft <= 0) {
        clearHoldTimer();
        toast.warning('Hết thời gian giữ ghế! Vui lòng chọn lại.');
        setHoldExpiresAt(null);
        setSessionId('');
        setSelectedSeats([]);
        if (selectedShowtime?.showtimeId) {
          fetchSeats(selectedShowtime.showtimeId);
        }
      }
    }, 1000);
  };

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
        headers: authHeaders,
        body: JSON.stringify({
          showtimeId: selectedShowtime.showtimeId,
          seatIds: selectedSeats,
          sessionId: newSessionId,
          customerEmail: formData.customerEmail,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể giữ ghế');
      }
      setSessionId(newSessionId);
      const exp = result.data?.holdExpiresAt;
      const expMs = typeof exp === 'number' ? exp : new Date(exp).getTime();
      setHoldExpiresAt(expMs);
      setFormData((prev) => ({ ...prev, sessionId: newSessionId, seatIds: selectedSeats }));
      toast.success('Đã giữ ghế thành công! Vui lòng hoàn tất đặt vé trong thời gian quy định.');
      startCountdown(expMs);
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi giữ ghế');
    } finally {
      setHoldingSeats(false);
    }
  };

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
        sessionId,
        voucherCode: formData.voucherCode || null,
        paymentMethod: formData.paymentMethod,
      };
      const response = await fetch(`${API_BASE_URL}/bookings/admin`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(bookingData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Không thể tạo vé');
      }
      toast.success(result.message || 'Đặt vé thành công!');
      clearHoldTimer();
      handleCloseModal();
      bumpList();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra khi đặt vé');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

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
      paymentMethod: 'CASH',
    });
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSeats([]);
    setSessionId('');
    setHoldExpiresAt(null);
    clearHoldTimer();
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedShowtime(null);
    setSelectedSeats([]);
    setSeats([]);
    setSessionId('');
    setHoldExpiresAt(null);
    clearHoldTimer();
  }, []);

  const handleShowtimeSelect = (e) => {
    const showtimeId = parseInt(e.target.value, 10);
    const showtime = showtimes.find((st) => st.showtimeId === showtimeId);
    setSelectedShowtime(showtime || null);
    setFormData((prev) => ({ ...prev, showtimeId: e.target.value }));
    setSelectedSeats([]);
    setSessionId('');
    setHoldExpiresAt(null);
    clearHoldTimer();
    if (showtimeId) {
      fetchSeats(showtimeId);
    } else {
      setSeats([]);
    }
  };

  const handleSeatToggle = (seatId) => {
    if (sessionId) {
      toast.warning('Bạn đã giữ ghế. Vui lòng hoàn tất đặt vé hoặc đóng để chọn lại.');
      return;
    }
    setSelectedSeats((prev) =>
      prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
    );
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDateTime = (date, time) => `${date} ${time}`;

  const getPaymentMethodLabel = (method) => {
    const methods = {
      CASH: 'Tiền mặt',
      CREDIT_CARD: 'Thẻ tín dụng',
      DEBIT_CARD: 'Thẻ ghi nợ',
      E_WALLET: 'Ví điện tử',
      BANK_TRANSFER: 'Chuyển khoản',
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Chờ xử lý', class: 'adm-bm__pill adm-bm__pill--warn' },
      CONFIRMED: { label: 'Đã xác nhận', class: 'adm-bm__pill adm-bm__pill--ok' },
      CANCELLED: { label: 'Đã hủy', class: 'adm-bm__pill adm-bm__pill--bad' },
      COMPLETED: { label: 'Hoàn thành', class: 'adm-bm__pill adm-bm__pill--info' },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      class: 'adm-bm__pill adm-bm__pill--muted',
    };
    return <span className={statusInfo.class}>{statusInfo.label}</span>;
  };

  const getTimeRemaining = () => {
    if (!holdExpiresAt) return null;
    const timeLeft = Math.max(0, Math.floor((holdExpiresAt - Date.now()) / 1000));
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!showModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showModal, handleCloseModal]);

  return (
    <div className="adm-bm">
      <div className="adm-bm__hero">
        <div className="adm-bm__titles">
          <h1 className="adm-bm__title">
            <FaTicketAlt /> Quản lý vé
          </h1>
          <p className="adm-bm__sub">Quản lý đặt vé và bán vé tại quầy</p>
        </div>
        <button type="button" className="adm-bm__btn adm-bm__btn--primary" onClick={handleOpenModal}>
          <FaPlus /> Đặt vé mới
        </button>
      </div>

      <div className="adm-bm__toolbar">
        <div className="adm-bm__search">
          <FaSearch className="adm-bm__search-ico" />
          <input
            type="text"
            className="adm-bm__search-input"
            placeholder="Tìm kiếm theo tên khách hàng, email, số điện thoại..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading ? (
        <div className="adm-bm__state">
          <FaSpinner className="adm-bm__spin" />
          <p className="adm-bm__muted">Đang tải danh sách vé...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="adm-bm__empty">
          <FaTicketAlt className="adm-bm__empty-ico" />
          <h3>Chưa có vé nào</h3>
          <p className="adm-bm__muted">Nhấn &quot;Đặt vé mới&quot; để tạo vé đầu tiên</p>
        </div>
      ) : (
        <>
          <div className="adm-bm__grid">
            {bookings.map((booking) => (
              <div key={booking.bookingId} className="adm-bm__card">
                <div className="adm-bm__card-head">
                  <span className="adm-bm__id">#{booking.bookingId}</span>
                  {getStatusBadge(booking.status)}
                </div>
                <div className="adm-bm__card-body">
                  <div className="adm-bm__row">
                    <FaFilm className="adm-bm__ico" />
                    <span className="adm-bm__movie">{booking.movieTitle}</span>
                  </div>
                  <div className="adm-bm__row">
                    <FaUser className="adm-bm__ico" />
                    <span>{booking.customerName}</span>
                  </div>
                  <div className="adm-bm__row">
                    <FaEnvelope className="adm-bm__ico" />
                    <span>{booking.customerEmail}</span>
                  </div>
                  <div className="adm-bm__row">
                    <FaPhone className="adm-bm__ico" />
                    <span>{booking.customerPhone}</span>
                  </div>
                  <div className="adm-bm__row">
                    <FaMapMarkerAlt className="adm-bm__ico" />
                    <span>
                      {booking.cinemaName} - {booking.hallName}
                    </span>
                  </div>
                  <div className="adm-bm__row">
                    <FaCalendar className="adm-bm__ico" />
                    <span>{formatDateTime(booking.showDate, booking.startTime)}</span>
                  </div>
                  <div className="adm-bm__row">
                    <FaChair className="adm-bm__ico" />
                    <span>Ghế: {booking.seatNumbers?.join(', ')}</span>
                  </div>
                  <div className="adm-bm__row">
                    <FaCreditCard className="adm-bm__ico" />
                    <span>{getPaymentMethodLabel(booking.paymentMethod)}</span>
                  </div>
                  <div className="adm-bm__row adm-bm__row--price">
                    <FaMoneyBillWave className="adm-bm__ico" />
                    <span className="adm-bm__price">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="adm-bm__pager">
              <span className="adm-bm__pager-info">
                Hiển thị {bookings.length} / {totalElements} vé
              </span>
              <div className="adm-bm__pager-btns">
                <button
                  type="button"
                  className="adm-bm__pager-btn"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Trước
                </button>
                <span className="adm-bm__pager-ind">
                  Trang {page + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  className="adm-bm__pager-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages - 1}
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="adm-bm__modal" role="presentation">
          <div
            className="adm-bm__panel adm-bm__panel--lg"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-bm__panel-head">
              <h2>Đặt vé mới</h2>
              <button type="button" className="adm-bm__panel-x" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form className="adm-bm__form" onSubmit={handleCreateBooking}>
              <div className="adm-bm__section">
                <h3 className="adm-bm__sec-title">Bước 1: Chọn suất chiếu</h3>
                <div className="adm-bm__field">
                  <label>
                    Suất chiếu <span className="adm-bm__req">*</span>
                  </label>
                  <select
                    value={formData.showtimeId}
                    onChange={handleShowtimeSelect}
                    required
                  >
                    <option value="">-- Chọn suất chiếu --</option>
                    {showtimes.map((showtime) => (
                      <option key={showtime.showtimeId} value={showtime.showtimeId}>
                        {showtime.movieTitle} - {showtime.cinemaName} ({showtime.hallName}) -{' '}
                        {formatDateTime(showtime.showDate, showtime.startTime)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedShowtime && (
                <div className="adm-bm__section">
                  <h3 className="adm-bm__sec-title">Bước 2: Chọn ghế</h3>
                  <div className="adm-bm__field">
                    <label>
                      Email khách (để giữ ghế) <span className="adm-bm__req">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                  <div className="adm-bm__seats-wrap">
                    <div className="adm-bm__screen">Màn hình</div>
                    <div className="adm-bm__seats-grid">
                      {seats.map((seat) => {
                        const isSelected = selectedSeats.includes(seat.seatId);
                        const isBooked = seat.status === 'BOOKED';
                        const isHeld = seat.status === 'HELD';
                        return (
                          <button
                            key={seat.seatId}
                            type="button"
                            className={`adm-bm__seat ${isSelected ? 'is-selected' : ''} ${
                              isBooked ? 'is-booked' : ''
                            } ${isHeld ? 'is-held' : ''}`}
                            onClick={() => handleSeatToggle(seat.seatId)}
                            disabled={isBooked || isHeld}
                            title={`${seat.seatNumber} - ${formatCurrency(seat.price)}`}
                          >
                            {seat.seatNumber}
                          </button>
                        );
                      })}
                    </div>
                    <div className="adm-bm__legend">
                      <div className="adm-bm__legend-item">
                        <span className="adm-bm__lg adm-bm__lg--free" /> Trống
                      </div>
                      <div className="adm-bm__legend-item">
                        <span className="adm-bm__lg adm-bm__lg--sel" /> Đã chọn
                      </div>
                      <div className="adm-bm__legend-item">
                        <span className="adm-bm__lg adm-bm__lg--held" /> Đang giữ
                      </div>
                      <div className="adm-bm__legend-item">
                        <span className="adm-bm__lg adm-bm__lg--booked" /> Đã đặt
                      </div>
                    </div>
                  </div>

                  {selectedSeats.length > 0 && !sessionId && (
                    <div className="adm-bm__hold-info">
                      <p>
                        Đã chọn: <strong>{selectedSeats.length} ghế</strong>
                      </p>
                      <button
                        type="button"
                        className="adm-bm__btn adm-bm__btn--primary"
                        onClick={handleHoldSeats}
                        disabled={holdingSeats || !formData.customerEmail}
                      >
                        {holdingSeats ? <FaSpinner className="adm-bm__spin-sm" /> : <FaCheck />}
                        Giữ ghế
                      </button>
                    </div>
                  )}

                  {sessionId && holdExpiresAt && (
                    <div className="adm-bm__timer">
                      <FaClock />
                      <span>
                        Còn lại: <strong>{getTimeRemaining()}</strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {sessionId && (
                <div className="adm-bm__section">
                  <h3 className="adm-bm__sec-title">Bước 3: Thông tin khách hàng</h3>
                  <div className="adm-bm__form-row">
                    <div className="adm-bm__field">
                      <label>
                        Họ tên <span className="adm-bm__req">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div className="adm-bm__field">
                      <label>
                        Email <span className="adm-bm__req">*</span>
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="example@email.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="adm-bm__form-row">
                    <div className="adm-bm__field">
                      <label>
                        Số điện thoại <span className="adm-bm__req">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="0987654321"
                        required
                      />
                    </div>
                    <div className="adm-bm__field">
                      <label>
                        Phương thức thanh toán <span className="adm-bm__req">*</span>
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
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
                  <div className="adm-bm__field">
                    <label>Mã voucher (tuỳ chọn)</label>
                    <input
                      type="text"
                      value={formData.voucherCode}
                      onChange={(e) => setFormData({ ...formData, voucherCode: e.target.value })}
                      placeholder="Mã giảm giá"
                    />
                  </div>
                </div>
              )}

              <div className="adm-bm__form-actions">
                <button
                  type="button"
                  className="adm-bm__btn adm-bm__btn--ghost"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="adm-bm__btn adm-bm__btn--primary"
                  disabled={submitting || !sessionId}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="adm-bm__spin-sm" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaCheck /> Xác nhận đặt vé
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

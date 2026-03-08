import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Cookies from 'js-cookie';
import './AdminPaymentManager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';


const AdminPaymentManager = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Axios instance với auth
  const api = axios.create({
    baseURL: `${API_BASE_URL}`,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Interceptor để thêm token
  api.interceptors.request.use(
    (config) => {
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  useEffect(() => {
    fetchPendingBookings();
  }, [currentPage]);

  const fetchPendingBookings = async () => {
    try {
      setIsLoading(true);
      console.log('📋 Fetching pending bookings, page:', currentPage);
      
      const response = await api.get('/bookings', {
        params: {
          page: currentPage,
          size: pageSize,
          status: 'PENDING'
        }
      });

      console.log('✅ Bookings response:', response.data);
      
      if (response.data.data && Array.isArray(response.data.data)) {
        setBookings(response.data.data);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        toast.error('Không thể tải danh sách booking');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (bookingId) => {
    if (!window.confirm('Xác nhận đã nhận được thanh toán cho booking này?')) {
      return;
    }

    setProcessingBookingId(bookingId);
    try {
      console.log('💳 Processing payment for booking:', bookingId);
      
      const response = await api.post('/payments/process', {
        bookingId: bookingId
      });

      console.log('✅ Payment processed:', response.data);
      
      if (response.data.success) {
        toast.success('Xác nhận thanh toán thành công! 🎉');
        // Reload danh sách
        fetchPendingBookings();
      } else {
        toast.error(response.data.message || 'Xác nhận thanh toán thất bại');
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn');
        navigate('/login');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Xác nhận thanh toán thất bại');
      }
    } finally {
      setProcessingBookingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="staff-payment-manager">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải danh sách booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-payment-manager">
      <div className="payment-header">
        <div className="header-content">
          <div className="header-title">
            <div className="title-icon">💳</div>
            <div>
              <h1>Quản Lý Thanh Toán</h1>
              <p className="subtitle">Xác nhận thanh toán cho các booking đang chờ xử lý</p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-box">
              <div className="stat-number">{totalElements}</div>
              <div className="stat-text">Chờ thanh toán</div>
            </div>
            <div className="stat-box processing">
              <div className="stat-number">{processingBookingId ? '1' : '0'}</div>
              <div className="stat-text">Đang xử lý</div>
            </div>
          </div>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state-modern">
          <div className="empty-icon-modern">
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none">
              <path d="M9 11l3 3L22 4" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#10b981" strokeWidth="2"/>
            </svg>
          </div>
          <h2>Tuyệt vời! Không có booking chờ thanh toán</h2>
          <p>Tất cả các booking đã được xử lý thành công</p>
        </div>
      ) : (
        <>
          <div className="payment-table">
            <table>
              <thead>
                <tr>
                  <th>Mã Booking</th>
                  <th>Phim & Rạp</th>
                  <th>Khách hàng</th>
                  <th>Suất chiếu</th>
                  <th>Số ghế</th>
                  <th>Tổng tiền</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.bookingId} className="booking-row">
                    <td>
                      <div className="booking-code-cell">
                        <span className="code-badge">{booking.bookingCode}</span>
                        <span className="status-mini">Chờ thanh toán</span>
                      </div>
                    </td>
                    <td>
                      <div className="movie-info">
                        <div className="movie-title">{booking.movieTitle}</div>
                        <div className="cinema-name">{booking.cinemaName}</div>
                      </div>
                    </td>
                    <td>
                      <div className="customer-info">
                        <div className="customer-name">{booking.customerName || 'Guest'}</div>
                        <div className="customer-email">{booking.customerEmail || 'N/A'}</div>
                      </div>
                    </td>
                    <td>
                      <div className="showtime-info">
                        <div className="showtime-date">
                          {booking.showDate && booking.startTime 
                            ? `${new Date(booking.showDate).toLocaleDateString('vi-VN')} - ${booking.startTime}`
                            : 'N/A'}
                        </div>
                        <div className="booking-date">Đặt: {formatDateTime(booking.bookingDate)}</div>
                      </div>
                    </td>
                    <td>
                      <div className="seats-badge">{booking.totalSeats} ghế</div>
                    </td>
                    <td>
                      <div className="amount-cell">{formatCurrency(booking.totalAmount)}</div>
                    </td>
                    <td>
                      <button
                        className="btn-confirm-modern"
                        onClick={() => handleConfirmPayment(booking.bookingId)}
                        disabled={processingBookingId === booking.bookingId}
                      >
                        {processingBookingId === booking.bookingId ? (
                          <>
                            <span className="spinner-modern"></span>
                            Đang xử lý
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            Xác nhận
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-modern">
              <button
                className="page-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 18l-6-6 6-6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Trước
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`page-num ${currentPage === i ? 'active' : ''}`}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                className="page-btn"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                Sau
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPaymentManager;

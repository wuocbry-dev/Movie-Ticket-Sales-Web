import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import { FaSync, FaInbox, FaCreditCard } from 'react-icons/fa';
import './StaffPaymentManager.css';
import { API_BASE_URL } from '../../config/api';

const PAGE_SIZE = 10;

const StaffPaymentManager = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      navigate('/login');
      return;
    }
    if (!token || !user.userId) {
      navigate('/login');
    }
  }, [navigate]);

  const fetchPendingBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const params = new URLSearchParams({
        page: String(currentPage),
        size: String(PAGE_SIZE),
        status: 'PENDING',
      });
      const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        toast.error('Không thể tải danh sách booking');
        setBookings([]);
        return;
      }

      const data = await response.json();
      const list = Array.isArray(data.data) ? data.data : [];
      setBookings(list);
      setTotalPages(data.totalPages ?? 0);
      setTotalElements(Number(data.totalElements ?? 0));
    } catch {
      toast.error('Không thể tải danh sách booking');
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, navigate]);

  useEffect(() => {
    fetchPendingBookings();
  }, [fetchPendingBookings]);

  const handleConfirmPayment = useCallback(
    async (bookingId) => {
      if (
        !window.confirm('Xác nhận đã nhận được thanh toán cho booking này?')
      ) {
        return;
      }

      setProcessingBookingId(bookingId);
      try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_BASE_URL}/payments/process`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bookingId }),
        });

        const json = await response.json().catch(() => ({}));

        if (response.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
          navigate('/login');
          return;
        }

        if (!response.ok || json.success === false) {
          toast.error(
            json.message ||
              json.error ||
              'Xác nhận thanh toán thất bại'
          );
          return;
        }

        toast.success('Xác nhận thanh toán thành công');
        fetchPendingBookings();
      } catch {
        toast.error('Xác nhận thanh toán thất bại');
      } finally {
        setProcessingBookingId(null);
      }
    },
    [fetchPendingBookings, navigate]
  );

  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount || 0),
    []
  );

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const paymentStatusMap = useMemo(
    () => ({
      PENDING: { label: 'Chờ thanh toán', mod: 'pending' },
      PROCESSING: { label: 'Đang xử lý', mod: 'processing' },
      COMPLETED: { label: 'Đã thanh toán', mod: 'completed' },
      FAILED: { label: 'Thất bại', mod: 'failed' },
    }),
    []
  );

  const renderPaymentBadge = useCallback(
    (status) => {
      const cfg = paymentStatusMap[status] || {
        label: status || '—',
        mod: 'default',
      };
      return (
        <span className={`stf-spm__pay stf-spm__pay--${cfg.mod}`}>
          {cfg.label}
        </span>
      );
    },
    [paymentStatusMap]
  );

  return (
    <div className="stf-spm">
      <header className="stf-spm__head">
        <div className="stf-spm__head-main">
          <span className="stf-spm__head-ico" aria-hidden>
            <FaCreditCard />
          </span>
          <div>
            <h1 className="stf-spm__title">Quản lý thanh toán</h1>
            <p className="stf-spm__sub">
              Xác nhận thanh toán cho các booking đang chờ
            </p>
          </div>
        </div>
        <div className="stf-spm__stat">
          <span className="stf-spm__stat-label">Tổng chờ xử lý</span>
          <span className="stf-spm__stat-value">{totalElements}</span>
        </div>
      </header>

      <div className="stf-spm__panel">
        {isLoading && bookings.length === 0 ? (
          <div className="stf-spm__loading">
            <FaSync className="stf-spm__spin" aria-hidden />
            <p>Đang tải danh sách booking...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="stf-spm__empty">
            <FaInbox className="stf-spm__empty-ico" aria-hidden />
            <h3>Không có booking chờ thanh toán</h3>
            <p>Tất cả booking đã được xử lý hoặc chưa có dữ liệu.</p>
          </div>
        ) : (
          <>
            <div className="stf-spm__table-wrap">
              {isLoading && (
                <div className="stf-spm__overlay" aria-busy="true">
                  <FaSync className="stf-spm__spin" aria-hidden />
                </div>
              )}
              <div className="stf-spm__scroll">
                <table className="stf-spm__table">
                  <thead>
                    <tr>
                      <th>Mã booking</th>
                      <th>Khách hàng</th>
                      <th>Phim</th>
                      <th>Rạp</th>
                      <th>Ngày chiếu</th>
                      <th>Số ghế</th>
                      <th>Tổng tiền</th>
                      <th>TT thanh toán</th>
                      <th>Ngày đặt</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.bookingId}>
                        <td>
                          <span className="stf-spm__code">
                            {booking.bookingCode}
                          </span>
                        </td>
                        <td>
                          <div className="stf-spm__cust">
                            <span className="stf-spm__cust-name">
                              {booking.customerName || 'N/A'}
                            </span>
                            <span className="stf-spm__cust-mail">
                              {booking.customerEmail || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="stf-spm__movie">
                          {booking.movieTitle || 'N/A'}
                        </td>
                        <td>
                          <div className="stf-spm__cinema">
                            <span>{booking.cinemaName || 'N/A'}</span>
                            <span className="stf-spm__hall">
                              {booking.hallName || '—'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="stf-spm__show">
                            <span>{booking.showDate || 'N/A'}</span>
                            <span className="stf-spm__show-time">
                              {booking.startTime || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="stf-spm__center">
                          <span className="stf-spm__seats">
                            {booking.totalSeats ?? 0}
                          </span>
                        </td>
                        <td className="stf-spm__money">
                          {formatCurrency(booking.totalAmount || 0)}
                        </td>
                        <td>{renderPaymentBadge(booking.paymentStatus)}</td>
                        <td className="stf-spm__muted">
                          {formatDate(booking.bookingDate)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="stf-spm__confirm"
                            onClick={() =>
                              handleConfirmPayment(booking.bookingId)
                            }
                            disabled={processingBookingId === booking.bookingId}
                          >
                            {processingBookingId === booking.bookingId ? (
                              <>
                                <span className="stf-spm__spin-sm" />
                                Đang xử lý...
                              </>
                            ) : (
                              'Xác nhận'
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="stf-spm__pager">
                <button
                  type="button"
                  className="stf-spm__page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0 || isLoading}
                >
                  « Trước
                </button>
                <span className="stf-spm__page-info">
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  className="stf-spm__page-btn"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage >= totalPages - 1 || isLoading}
                >
                  Sau »
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StaffPaymentManager;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import axios from 'axios';
import Cookies from 'js-cookie';
import './AdminPaymentManager.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const PAGE_SIZE = 10;

function buildPageList(totalPages, current) {
  if (totalPages <= 9) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  const pages = new Set([0, totalPages - 1, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      out.push('gap');
    }
    out.push(sorted[i]);
  }
  return out;
}

const AdminPaymentManager = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBookingId, setProcessingBookingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });
    instance.interceptors.request.use((config) => {
      const token = Cookies.get('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
    return instance;
  }, []);

  const fetchPendingBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/bookings', {
        params: {
          page: currentPage,
          size: PAGE_SIZE,
          status: 'PENDING',
        },
      });

      if (response.data.data && Array.isArray(response.data.data)) {
        setBookings(response.data.data);
        setTotalPages(response.data.totalPages ?? 0);
        setTotalElements(response.data.totalElements ?? 0);
      } else {
        setBookings([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        navigate('/login');
      } else {
        toast.error('Không thể tải danh sách booking');
      }
    } finally {
      setIsLoading(false);
    }
  }, [api, currentPage, navigate]);

  useEffect(() => {
    fetchPendingBookings();
  }, [fetchPendingBookings]);

  const handleConfirmPayment = async (bookingId) => {
    if (!window.confirm('Xác nhận đã nhận được thanh toán cho booking này?')) {
      return;
    }

    setProcessingBookingId(bookingId);
    try {
      const response = await api.post('/payments/process', { bookingId });

      if (response.data.success) {
        toast.success('Xác nhận thanh toán thành công');
        fetchPendingBookings();
      } else {
        toast.error(response.data.message || 'Xác nhận thanh toán thất bại');
      }
    } catch (error) {
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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pageList = useMemo(
    () => buildPageList(totalPages, currentPage),
    [totalPages, currentPage]
  );

  if (isLoading) {
    return (
      <section className="adm-pay" aria-busy="true">
        <div className="adm-pay__state">
          <div className="adm-pay__spinner" aria-hidden />
          <p className="adm-pay__state-text">Đang tải danh sách booking…</p>
        </div>
      </section>
    );
  }

  return (
    <section className="adm-pay">
      <header className="adm-pay__head">
        <div>
          <p className="adm-pay__eyebrow">Thanh toán</p>
          <h1 className="adm-pay__h1">Quản lý thanh toán</h1>
          <p className="adm-pay__lead">
            Xác nhận thanh toán cho các booking đang ở trạng thái chờ xử lý.
          </p>
        </div>
        <dl className="adm-pay__kpis">
          <div className="adm-pay__kpi">
            <dt className="adm-pay__kpi-label">Chờ thanh toán</dt>
            <dd className="adm-pay__kpi-value">{totalElements}</dd>
          </div>
          <div className="adm-pay__kpi adm-pay__kpi--warn">
            <dt className="adm-pay__kpi-label">Đang xử lý</dt>
            <dd className="adm-pay__kpi-value">{processingBookingId ? 1 : 0}</dd>
          </div>
        </dl>
      </header>

      {bookings.length === 0 ? (
        <div className="adm-pay__empty" role="status">
          <div className="adm-pay__empty-icon" aria-hidden>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 11l3 3L22 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
          <h2 className="adm-pay__empty-title">Không có booking chờ thanh toán</h2>
          <p className="adm-pay__empty-desc">Tất cả đơn đã xử lý hoặc chưa có dữ liệu.</p>
        </div>
      ) : (
        <>
          <div className="adm-pay__scroll">
            <table className="adm-pay__table">
              <caption className="adm-pay__caption">
                Danh sách booking chờ thanh toán
              </caption>
              <thead>
                <tr>
                  <th scope="col">Mã</th>
                  <th scope="col">Phim &amp; rạp</th>
                  <th scope="col">Khách</th>
                  <th scope="col">Suất</th>
                  <th scope="col">Ghế</th>
                  <th scope="col">Tổng tiền</th>
                  <th scope="col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.bookingId}>
                    <td>
                      <div className="adm-pay__cell-stack">
                        <span className="adm-pay__code">{booking.bookingCode}</span>
                        <span className="adm-pay__pill">Chờ TT</span>
                      </div>
                    </td>
                    <td>
                      <div className="adm-pay__cell-stack">
                        <span className="adm-pay__strong">{booking.movieTitle}</span>
                        <span className="adm-pay__muted">{booking.cinemaName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="adm-pay__cell-stack">
                        <span className="adm-pay__strong">{booking.customerName || 'Guest'}</span>
                        <span className="adm-pay__muted">{booking.customerEmail || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="adm-pay__cell-stack">
                        <span className="adm-pay__strong">
                          {booking.showDate && booking.startTime
                            ? `${new Date(booking.showDate).toLocaleDateString('vi-VN')} · ${booking.startTime}`
                            : '—'}
                        </span>
                        <span className="adm-pay__muted">Đặt: {formatDateTime(booking.bookingDate)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="adm-pay__seat">{booking.totalSeats} ghế</span>
                    </td>
                    <td>
                      <span className="adm-pay__money">{formatCurrency(booking.totalAmount)}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-pay__confirm"
                        onClick={() => handleConfirmPayment(booking.bookingId)}
                        disabled={processingBookingId === booking.bookingId}
                      >
                        {processingBookingId === booking.bookingId ? (
                          <>
                            <span className="adm-pay__confirm-spin" aria-hidden />
                            Đang xử lý
                          </>
                        ) : (
                          <>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              aria-hidden
                            >
                              <path d="M20 6L9 17l-5-5" strokeWidth="2" strokeLinecap="round" />
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
            <nav className="adm-pay__nav" aria-label="Phân trang">
              <button
                type="button"
                className="adm-pay__nav-btn"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Trước
              </button>

              <div className="adm-pay__nav-pages">
                {pageList.map((item, idx) =>
                  item === 'gap' ? (
                    <span key={`g-${idx}`} className="adm-pay__nav-gap" aria-hidden>
                      …
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={item}
                      className={`adm-pay__nav-page ${currentPage === item ? 'is-current' : ''}`}
                      onClick={() => setCurrentPage(item)}
                    >
                      {item + 1}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="adm-pay__nav-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Sau
              </button>

              <label className="adm-pay__nav-jump">
                <span className="adm-pay__nav-jump-label">Đến trang</span>
                <select
                  className="adm-pay__nav-select"
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  aria-label="Chọn trang"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i} value={i}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </label>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default AdminPaymentManager;

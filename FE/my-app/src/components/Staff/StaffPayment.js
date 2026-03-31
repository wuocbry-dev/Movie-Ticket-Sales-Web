import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { Scanner } from '@yudiel/react-qr-scanner';
import Cookies from 'js-cookie';
import {
  FaQrcode,
  FaUniversity,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
  FaSearch,
  FaTimes,
  FaWallet,
} from 'react-icons/fa';
import './StaffPayment.css';
import { API_BASE_URL } from '../../config/api';

const BANK_INFO = {
  bankName: 'Ngân hàng Vietcombank',
  accountNumber: '1234567890',
  accountName: 'CINEMA BOOKING SYSTEM',
  branch: 'Chi nhánh TP.HCM',
};

function mapBookingDto(data) {
  const seats = (data.tickets || []).map((t) => {
    const s = `${t.seatRow || ''}${t.seatNumber || ''}`.trim();
    return s || '—';
  });
  const showtime = [data.showDate, data.startTime].filter(Boolean).join(' · ') || 'N/A';
  const sub = data.subtotal != null ? Number(data.subtotal) : 0;
  const concessionAmt =
    data.concessionOrder?.totalAmount != null
      ? Number(data.concessionOrder.totalAmount)
      : 0;
  const total = data.totalAmount != null ? Number(data.totalAmount) : sub + concessionAmt;

  return {
    bookingId: data.bookingId,
    bookingCode: data.bookingCode,
    movieTitle: data.movieTitle || 'N/A',
    showtime,
    hall: data.hallName || 'N/A',
    cinemaName: data.cinemaName || 'N/A',
    seats,
    ticketPrice: sub,
    concessions: concessionAmt,
    total,
    customerName: data.customerName || 'N/A',
    customerPhone: data.customerPhone || 'N/A',
    paymentStatus: data.paymentStatus,
    bookingStatus: data.status,
  };
}

const StaffPayment = () => {
  const navigate = useNavigate();
  const [bookingCode, setBookingCode] = useState('');
  const [bookingInfo, setBookingInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const qrHandledRef = useRef(false);
  const successTimerRef = useRef(null);

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

  useEffect(() => {
    if (!showScanner) {
      document.body.style.overflow = '';
      qrHandledRef.current = false;
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setShowScanner(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [showScanner]);

  useEffect(
    () => () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    },
    []
  );

  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0),
    []
  );

  const qrUrls = useMemo(() => {
    if (!bookingInfo) return { momo: '', bank: '' };
    const payload = encodeURIComponent(
      `BOOKING:${bookingInfo.bookingCode}|AMOUNT:${bookingInfo.total}`
    );
    const base = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250';
    return {
      momo: `${base}&data=${encodeURIComponent(`MOMO:${payload}`)}`,
      bank: `${base}&data=${encodeURIComponent(`BANK:${BANK_INFO.accountNumber}:${bookingInfo.total}`)}`,
    };
  }, [bookingInfo]);

  const loadBookingByCode = useCallback(async (rawCode) => {
    const code = (rawCode || '').trim();
    if (!code) {
      toast.error('Vui lòng nhập mã đặt vé');
      return;
    }

    setIsProcessing(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/bookings/code/${encodeURIComponent(code)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Không tìm thấy thông tin đặt vé trong hệ thống');
        } else {
          let msg = 'Có lỗi xảy ra khi tìm kiếm';
          try {
            const err = await response.json();
            msg = err.message || msg;
          } catch {
            /* ignore */
          }
          toast.error(msg);
        }
        return;
      }

      const data = await response.json();
      if (!data.bookingId) {
        toast.error('Dữ liệu đặt vé không hợp lệ');
        return;
      }

      setBookingInfo(mapBookingDto(data));
    } catch {
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSearchBooking = useCallback(() => {
    loadBookingByCode(bookingCode);
  }, [bookingCode, loadBookingByCode]);

  const handleConfirmPayment = useCallback(async () => {
    if (!bookingInfo?.bookingId) return;

    setIsProcessing(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/payments/process`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: bookingInfo.bookingId }),
      });

      const json = await response.json().catch(() => ({}));

      if (!response.ok || json.success === false) {
        toast.error(json.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
        setIsProcessing(false);
        return;
      }

      const activity = {
        type: 'payment',
        title: 'Thanh toán thành công',
        details: `Mã: ${bookingCode} — ${paymentMethod === 'momo' ? 'MoMo' : 'Chuyển khoản'} — ${formatCurrency(bookingInfo.total)}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      };

      let activities = [];
      try {
        activities = JSON.parse(localStorage.getItem('staffActivities') || '[]');
        if (!Array.isArray(activities)) activities = [];
      } catch {
        activities = [];
      }
      activities.unshift(activity);
      if (activities.length > 20) activities.pop();
      localStorage.setItem('staffActivities', JSON.stringify(activities));

      setPaymentCompleted(true);
      toast.success('Thanh toán thành công!');

      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => {
        setBookingCode('');
        setBookingInfo(null);
        setPaymentCompleted(false);
        setPaymentMethod('momo');
      }, 3200);
    } catch {
      toast.error('Không thể kết nối đến server');
    } finally {
      setIsProcessing(false);
    }
  }, [bookingCode, bookingInfo, formatCurrency, paymentMethod]);

  const handleReset = useCallback(() => {
    setBookingCode('');
    setBookingInfo(null);
    setPaymentCompleted(false);
    setPaymentMethod('momo');
  }, []);

  const openScanner = useCallback(() => {
    qrHandledRef.current = false;
    setShowScanner(true);
  }, []);

  const closeScanner = useCallback(() => setShowScanner(false), []);

  const handleQRScan = useCallback(
    (result) => {
      if (!result?.[0]?.rawValue || qrHandledRef.current) return;
      qrHandledRef.current = true;
      const scannedCode = result[0].rawValue;
      setBookingCode(scannedCode);
      setShowScanner(false);
      loadBookingByCode(scannedCode);
    },
    [loadBookingByCode]
  );

  const handleQRError = useCallback(() => {
    toast.error('Lỗi khi quét QR. Vui lòng thử lại!');
  }, []);

  return (
    <div className="stf-pay">
      <header className="stf-pay__head">
        <span className="stf-pay__head-ico" aria-hidden>
          <FaWallet />
        </span>
        <div>
          <h1 className="stf-pay__title">Thanh toán tại quầy</h1>
          <p className="stf-pay__sub">Tìm booking theo mã và xác nhận đã nhận tiền</p>
        </div>
      </header>

      {!paymentCompleted ? (
        <>
          <section className="stf-pay__search" aria-label="Tìm booking">
            <input
              className="stf-pay__input"
              type="text"
              placeholder="Nhập mã đặt vé (ví dụ: BK20241205001)"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchBooking();
              }}
              disabled={isProcessing || !!bookingInfo}
              autoComplete="off"
            />
            <button
              type="button"
              className="stf-pay__btn stf-pay__btn--scan"
              onClick={openScanner}
              disabled={isProcessing || !!bookingInfo}
              title="Quét mã QR"
            >
              <FaQrcode aria-hidden /> Quét QR
            </button>
            <button
              type="button"
              className="stf-pay__btn stf-pay__btn--go"
              onClick={handleSearchBooking}
              disabled={isProcessing || !!bookingInfo}
            >
              <FaSearch aria-hidden /> {isProcessing ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </section>

          {showScanner && (
            <div
              className="stf-pay__modal"
              role="dialog"
              aria-modal="true"
              aria-label="Quét mã QR"
            >
              <div className="stf-pay__modal-inner">
                <button
                  type="button"
                  className="stf-pay__modal-close"
                  onClick={closeScanner}
                  aria-label="Đóng"
                >
                  <FaTimes aria-hidden />
                </button>
                <h2 className="stf-pay__modal-title">Quét mã QR vé</h2>
                <div className="stf-pay__scanner">
                  <Scanner
                    onScan={handleQRScan}
                    onError={handleQRError}
                    containerStyle={{ width: '100%' }}
                    videoStyle={{ width: '100%', borderRadius: '12px' }}
                  />
                  <p className="stf-pay__scanner-hint">Đưa mã QR vào khung hình</p>
                </div>
              </div>
            </div>
          )}

          {bookingInfo && (
            <article className="stf-pay__card">
              <h2 className="stf-pay__card-title">Thông tin đặt vé</h2>
              <dl className="stf-pay__grid">
                <div className="stf-pay__row">
                  <dt>Mã đặt vé</dt>
                  <dd>{bookingInfo.bookingCode}</dd>
                </div>
                <div className="stf-pay__row">
                  <dt>Khách hàng</dt>
                  <dd>{bookingInfo.customerName}</dd>
                </div>
                <div className="stf-pay__row">
                  <dt>Số điện thoại</dt>
                  <dd>{bookingInfo.customerPhone}</dd>
                </div>
                <div className="stf-pay__row">
                  <dt>Phim</dt>
                  <dd>{bookingInfo.movieTitle}</dd>
                </div>
                <div className="stf-pay__row">
                  <dt>Rạp</dt>
                  <dd>{bookingInfo.cinemaName}</dd>
                </div>
                <div className="stf-pay__row">
                  <dt>Suất chiếu</dt>
                  <dd>{bookingInfo.showtime}</dd>
                </div>
                <div className="stf-pay__row">
                  <dt>Phòng</dt>
                  <dd>{bookingInfo.hall}</dd>
                </div>
                <div className="stf-pay__row">
                  <dt>Ghế</dt>
                  <dd>{bookingInfo.seats.join(', ')}</dd>
                </div>
              </dl>

              <div className="stf-pay__summary">
                <div className="stf-pay__sum-row">
                  <span>Tiền vé</span>
                  <span>{formatCurrency(bookingInfo.ticketPrice)}</span>
                </div>
                <div className="stf-pay__sum-row">
                  <span>Đồ ăn &amp; nước</span>
                  <span>{formatCurrency(bookingInfo.concessions)}</span>
                </div>
                <div className="stf-pay__sum-row stf-pay__sum-row--total">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(bookingInfo.total)}</span>
                </div>
              </div>

              <div className="stf-pay__methods">
                <h3 className="stf-pay__methods-title">Phương thức thanh toán (tham khảo)</h3>
                <div className="stf-pay__method-btns">
                  <button
                    type="button"
                    className={`stf-pay__method ${paymentMethod === 'momo' ? 'is-active' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                  >
                    <FaMoneyBillWave aria-hidden />
                    <span>MoMo QR</span>
                  </button>
                  <button
                    type="button"
                    className={`stf-pay__method ${paymentMethod === 'bank' ? 'is-active' : ''}`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <FaUniversity aria-hidden />
                    <span>Chuyển khoản</span>
                  </button>
                </div>
              </div>

              <div className="stf-pay__qr-block">
                {paymentMethod === 'momo' ? (
                  <div className="stf-pay__qr-inner">
                    <FaQrcode className="stf-pay__qr-ico" aria-hidden />
                    <h3>QR MoMo (minh họa)</h3>
                    <div className="stf-pay__qr-img-wrap">
                      <img src={qrUrls.momo} alt="" />
                    </div>
                    <p className="stf-pay__qr-hint">Khách mở MoMo và quét để chuyển khoản</p>
                    <div className="stf-pay__amount">{formatCurrency(bookingInfo.total)}</div>
                  </div>
                ) : (
                  <div className="stf-pay__qr-inner">
                    <FaCreditCard className="stf-pay__qr-ico" aria-hidden />
                    <h3>Chuyển khoản ngân hàng</h3>
                    <div className="stf-pay__bank">
                      <div className="stf-pay__bank-row">
                        <span>Ngân hàng</span>
                        <span>{BANK_INFO.bankName}</span>
                      </div>
                      <div className="stf-pay__bank-row">
                        <span>Số tài khoản</span>
                        <span>{BANK_INFO.accountNumber}</span>
                      </div>
                      <div className="stf-pay__bank-row">
                        <span>Chủ TK</span>
                        <span>{BANK_INFO.accountName}</span>
                      </div>
                      <div className="stf-pay__bank-row">
                        <span>Chi nhánh</span>
                        <span>{BANK_INFO.branch}</span>
                      </div>
                      <div className="stf-pay__bank-row">
                        <span>Số tiền</span>
                        <span className="stf-pay__bank-amt">{formatCurrency(bookingInfo.total)}</span>
                      </div>
                      <div className="stf-pay__bank-row">
                        <span>Nội dung</span>
                        <span>{bookingInfo.bookingCode}</span>
                      </div>
                    </div>
                    <div className="stf-pay__qr-img-wrap">
                      <img src={qrUrls.bank} alt="" />
                    </div>
                  </div>
                )}
              </div>

              <div className="stf-pay__actions">
                <button
                  type="button"
                  className="stf-pay__btn stf-pay__btn--confirm"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Đang xử lý...' : 'Xác nhận đã thanh toán'}
                </button>
                <button
                  type="button"
                  className="stf-pay__btn stf-pay__btn--ghost"
                  onClick={handleReset}
                  disabled={isProcessing}
                >
                  Hủy
                </button>
              </div>
            </article>
          )}
        </>
      ) : (
        <div className="stf-pay__success" role="status">
          <FaCheckCircle className="stf-pay__success-ico" aria-hidden />
          <h2>Thanh toán thành công</h2>
          <p>Mã đặt vé: {bookingInfo.bookingCode}</p>
          <p>Số tiền: {formatCurrency(bookingInfo.total)}</p>
        </div>
      )}
    </div>
  );
};

export default StaffPayment;

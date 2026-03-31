import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { FaFilm, FaBuilding, FaDoorOpen, FaCalendarAlt, FaWallet, FaCheck, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';
import bookingService from '../../services/bookingService';
import { loyaltyService } from '../../services/loyaltyService';
import { calculateBookingPrice, formatPrice as formatCurrency } from '../../utils/priceCalculation';
import ConcessionSelection from './ConcessionSelection';
import './BookingConfirmation.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const NOTICE_KEY = 'mtw:lastBookingNotice:v1';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedSeats, sessionId, showtime } = location.state || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [userLoaded, setUserLoaded] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [concessionData, setConcessionData] = useState({ items: [], total: 0 });
  const [showConcessionStep, setShowConcessionStep] = useState(true);
  const [pointsBalance, setPointsBalance] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const priceDetails = calculateBookingPrice(showtime?.basePrice || 0, selectedSeats?.length || 0);
  const grandTotal = Math.max(0, priceDetails.total + concessionData.total - pointsDiscount);

  useEffect(() => {
    if (user?.userId) {
      loyaltyService
        .getPointsBalance(user.userId)
        .then(setPointsBalance)
        .catch(() => setPointsBalance({ availablePoints: 0 }));
    }
  }, [user]);

  useEffect(() => {
    if (pointsToUse > 0) {
      const discountFromPoints = pointsToUse * 1000;
      const totalBefore = priceDetails.total + concessionData.total;
      setPointsDiscount(Math.min(discountFromPoints, totalBefore * 0.5));
    } else setPointsDiscount(0);
  }, [pointsToUse, priceDetails.total, concessionData.total]);

  const handlePointsChange = (e) => {
    const val = parseInt(e.target.value, 10) || 0;
    setPointsToUse(Math.min(Math.max(0, val), pointsBalance?.availablePoints || 0));
  };
  const handleUseAllPoints = () => {
    const max = pointsBalance?.availablePoints || 0;
    const totalBefore = priceDetails.total + concessionData.total;
    setPointsToUse(Math.min(max, Math.floor((totalBefore * 0.5) / 1000)));
  };
  const handleClearPoints = () => setPointsToUse(0);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setUserLoaded(true);
  }, []);

  useEffect(() => {
    if (!userLoaded) return;
    if (!selectedSeats?.length || !sessionId || !showtime) {
      toast.error('Thông tin đặt vé không hợp lệ');
      navigate('/');
    }
  }, [userLoaded, navigate, selectedSeats, sessionId, showtime]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
  };

  const handleConcessionChange = useCallback((data) => setConcessionData(data), []);
  const handleContinueToPayment = () => setShowConcessionStep(false);

  const computeShowtimeEndMs = () => {
    try {
      const showDate = showtime?.showDate ? String(showtime.showDate).slice(0, 10) : null; // YYYY-MM-DD
      const start = showtime?.startTime ? String(showtime.startTime).slice(0, 8) : null; // HH:mm[:ss]
      const end = showtime?.endTime ? String(showtime.endTime).slice(0, 8) : null;

      const normalizeTime = (t) => {
        if (!t) return null;
        const parts = t.split(':');
        if (parts.length === 2) return `${parts[0]}:${parts[1]}:00`;
        if (parts.length >= 3) return `${parts[0]}:${parts[1]}:${parts[2]}`;
        return null;
      };

      const startIso = showDate && start ? `${showDate}T${normalizeTime(start)}` : null;
      const endIso = showDate && end ? `${showDate}T${normalizeTime(end)}` : null;

      const startMs = startIso ? new Date(startIso).getTime() : NaN;
      const endMs = endIso ? new Date(endIso).getTime() : NaN;
      if (Number.isFinite(endMs) && endMs > 0) return endMs;
      if (Number.isFinite(startMs) && startMs > 0) return startMs + 4 * 60 * 60 * 1000; // fallback 4h
    } catch {
      // ignore
    }
    return Date.now() + 24 * 60 * 60 * 1000; // fallback 24h
  };

  const upsertBookingNotice = (entry) => {
    try {
      const raw = localStorage.getItem(NOTICE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;

      // Support legacy single-object shape
      const prevList = Array.isArray(parsed?.bookings)
        ? parsed.bookings
        : parsed && typeof parsed === 'object' && (parsed.bookingCode || parsed.ts)
          ? [parsed]
          : [];

      const now = Date.now();
      const cleaned = prevList
        .filter((b) => b && typeof b === 'object')
        .filter((b) => !(typeof b.showtimeEnd === 'number' && b.showtimeEnd > 0 && now > b.showtimeEnd));

      const next = [entry, ...cleaned].filter((b, idx, arr) => {
        const code = b?.bookingCode || '';
        if (!code) return idx === 0; // keep the newest even if no code
        return arr.findIndex((x) => x?.bookingCode === code) === idx;
      });

      localStorage.setItem(
        NOTICE_KEY,
        JSON.stringify({
          version: 2,
          bookings: next.slice(0, 20), // cap
        })
      );
      window.dispatchEvent(new Event('mtw:lastBookingNotice'));
    } catch (e) {
      console.warn('Could not persist booking notice:', e);
    }
  };

  const generateVietQR = (paymentReference) => {
    const bankId = '970422';
    const accountNumber = '0915232119';
    const accountName = 'CINEMA BOOKING';
    const template = 'compact2';
    const description = paymentReference
      ? `${paymentReference} ${(showtime?.movieTitle || '').substring(0, 15)}`
      : `BOOKING ${(showtime?.movieTitle || '').substring(0, 20)} GHE ${(selectedSeats || []).map((s) => s.seatRow + s.seatNumber).join(' ')}`;
    setQrCodeUrl(`https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${grandTotal}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`);
    setShowQRCode(true);
  };

  const isGuest = !user;

  const getGuestContactError = () => {
    const name = (guestName || '').trim();
    const email = (guestEmail || '').trim();
    const phone = (guestPhone || '').replace(/\s/g, '');
    if (!name) return 'Vui lòng nhập họ tên.';
    if (!email) return 'Vui lòng nhập email.';
    if (!phone) return 'Vui lòng nhập số điện thoại.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email không hợp lệ.';
    if (!/^[0-9]{10,20}$/.test(phone)) return 'Số điện thoại 10–20 chữ số.';
    return null;
  };

  const handleConfirmBooking = async () => {
    if (!selectedSeats?.length) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }
    if (isGuest) {
      const err = getGuestContactError();
      if (err) {
        toast.error(err);
        return;
      }
    }
    setIsProcessing(true);
    const bookingData = {
      showtimeId: parseInt(showtime.showtimeId, 10),
      seatIds: selectedSeats.map((s) => s.seatId),
      sessionId,
      voucherCode: null,
      paymentMethod: 'BANK_TRANSFER',
      concessionItems: concessionData.items?.length > 0 ? concessionData.items.map((item) => ({ itemId: item.itemId, quantity: item.quantity, price: item.price })) : null,
    };
    if (user?.userId) {
      bookingData.userId = user.userId;
      if (pointsToUse > 0) bookingData.pointsToUse = pointsToUse;
    } else {
      bookingData.customerName = guestName.trim();
      bookingData.customerEmail = guestEmail.trim();
      bookingData.customerPhone = guestPhone.replace(/\s/g, '');
    }
    try {
      const verifyUrl = `${API_BASE_URL}/seats/verify-hold?showtimeId=${bookingData.showtimeId}&sessionId=${sessionId}&seatIds=${bookingData.seatIds.join(',')}`;
      const verifyRes = await fetch(verifyUrl);
      const verifyData = await verifyRes.json();
      if (!verifyData.allSeatsHeld) {
        toast.error('Một số ghế không còn được giữ. Vui lòng chọn lại ghế!');
        setIsProcessing(false);
        navigate(`/showtime/${bookingData.showtimeId}`);
        return;
      }
    } catch (e) {
      console.warn(e);
    }
    try {
      const response = await bookingService.createBooking(bookingData);
      generateVietQR(response.paymentReference || response.bookingCode);
      toast.success('Đặt vé thành công! Vui lòng quét mã QR để thanh toán 🎉');
      upsertBookingNotice({
        bookingCode: response?.bookingCode ?? response?.data?.bookingCode ?? null,
        total: grandTotal,
        ts: Date.now(),
        showtimeEnd: computeShowtimeEndMs(),
      });
      if (user && pointsToUse > 0) window.dispatchEvent(new Event('pointsChanged'));
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Đặt vé thất bại. Vui lòng thử lại!';
      toast.error(msg);
      setShowQRCode(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmed = () => {
    toast.success('Cảm ơn bạn đã thanh toán!');
    if (user?.userId) window.dispatchEvent(new Event('pointsChanged'));
    navigate('/q2k-thank-you', {
      state: {
        totalAmount: grandTotal,
        seatsCount: selectedSeats?.length,
        isGuest: !user?.userId,
      },
    });
  };

  if (!userLoaded || !selectedSeats?.length || !showtime) {
    return (
      <div className="bcf bcf--state">
        <div className="bcf__state-msg">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="bcf">
      <header className="bcf__head">
        <h1 className="bcf__title">Xác nhận đặt vé</h1>
        <div className="bcf__steps">
          <div className={`bcf__step ${!showConcessionStep ? 'bcf__step--done' : 'bcf__step--active'}`}>
            <span className="bcf__step-num">{!showConcessionStep ? <FaCheck /> : '1'}</span>
            <span className="bcf__step-txt">Chọn đồ ăn</span>
          </div>
          <span className="bcf__step-line" aria-hidden="true" />
          <div className={`bcf__step ${!showConcessionStep ? 'bcf__step--active' : ''}`}>
            <span className="bcf__step-num">2</span>
            <span className="bcf__step-txt">Thanh toán</span>
          </div>
        </div>
      </header>

      <div className="bcf__content">
        {showConcessionStep ? (
          <>
            <ConcessionSelection cinemaId={showtime.cinemaId != null ? Number(showtime.cinemaId) : undefined} onConcessionChange={handleConcessionChange} />
            <div className="bcf__concession-actions">
              <button type="button" className="bcf__btn bcf__btn--ghost" onClick={handleContinueToPayment}>Bỏ qua</button>
              <button type="button" className="bcf__btn bcf__btn--primary" onClick={handleContinueToPayment}>Tiếp tục thanh toán →</button>
            </div>
          </>
        ) : (
          <div className="bcf__main">
            {isGuest && (
              <section className="bcf__block bcf__block--guest">
                <h2 className="bcf__block-title">Thông tin liên hệ (để nhận vé)</h2>
                <p className="bcf__guest-hint">Nhập số điện thoại hoặc email để nhận thông tin đặt vé.</p>
                <div className="bcf__guest-fields">
                  <label className="bcf__guest-label">
                    <span className="bcf__guest-caption"><FaUser className="bcf__guest-ico" /> Họ tên <em>*</em></span>
                    <input type="text" className="bcf__guest-input" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Nguyễn Văn A" maxLength={100} />
                  </label>
                  <label className="bcf__guest-label">
                    <span className="bcf__guest-caption"><FaEnvelope className="bcf__guest-ico" /> Email <em>*</em></span>
                    <input type="email" className="bcf__guest-input" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="email@example.com" />
                  </label>
                  <label className="bcf__guest-label">
                    <span className="bcf__guest-caption"><FaPhone className="bcf__guest-ico" /> Số điện thoại <em>*</em></span>
                    <input type="tel" className="bcf__guest-input" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="0912345678" maxLength={20} />
                  </label>
                </div>
              </section>
            )}
            <section className="bcf__block">
              <h2 className="bcf__block-title">Thông tin suất chiếu</h2>
              <ul className="bcf__info-list">
                <li><FaFilm className="bcf__info-ico" /><span className="bcf__info-lbl">Phim</span><span className="bcf__info-val">{showtime.movieTitle}</span></li>
                <li><FaBuilding className="bcf__info-ico" /><span className="bcf__info-lbl">Rạp</span><span className="bcf__info-val">{showtime.cinemaName}</span></li>
                <li><FaDoorOpen className="bcf__info-ico" /><span className="bcf__info-lbl">Phòng</span><span className="bcf__info-val">{showtime.hallName}</span></li>
                <li><FaCalendarAlt className="bcf__info-ico" /><span className="bcf__info-lbl">Suất chiếu</span><span className="bcf__info-val">{formatDateTime(showtime.showDate)}</span></li>
              </ul>
            </section>

            <section className="bcf__block">
              <div className="bcf__block-head">
                <h2 className="bcf__block-title">Ghế đã chọn</h2>
                <span className="bcf__pill">{selectedSeats.length} ghế</span>
              </div>
              <div className="bcf__seats">
                {selectedSeats.map((seat) => (
                  <span key={seat.seatId} className={`bcf__seat ${(seat.seatType || '').toLowerCase()}`}>
                    {seat.seatRow}{seat.seatNumber}
                    <em className="bcf__seat-type">{seat.seatType}</em>
                  </span>
                ))}
              </div>
            </section>

            {concessionData.items?.length > 0 && (
              <section className="bcf__block">
                <div className="bcf__block-head">
                  <h2 className="bcf__block-title">Đồ ăn & nước</h2>
                  <button type="button" className="bcf__link" onClick={() => setShowConcessionStep(true)}>Sửa</button>
                </div>
                <ul className="bcf__concession-list">
                  {concessionData.items.map((item, i) => (
                    <li key={i}>
                      <span>{item.itemName} x{item.quantity}</span>
                      <span className="bcf__price">{formatCurrency(item.total)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bcf__block">
              <h2 className="bcf__block-title">Phương thức thanh toán</h2>
              <div className="bcf__payment-box">
                <FaWallet className="bcf__payment-ico" />
                <div>
                  <strong>Chuyển khoản ngân hàng</strong>
                  <span className="bcf__muted">Quét mã QR để thanh toán</span>
                </div>
              </div>
              {showQRCode && qrCodeUrl && (
                <div className="bcf__qr">
                  <p className="bcf__qr-title">Quét mã QR thanh toán</p>
                  <div className="bcf__qr-wrap"><img src={qrCodeUrl} alt="VietQR" className="bcf__qr-img" /></div>
                  <ol className="bcf__qr-steps">
                    <li>Mở app ngân hàng</li>
                    <li>Quét mã QR</li>
                    <li>Kiểm tra và xác nhận</li>
                  </ol>
                  <p className="bcf__qr-warn">Không thay đổi nội dung chuyển khoản</p>
                  <button type="button" className="bcf__btn bcf__btn--success" onClick={handlePaymentConfirmed}>✓ Tôi đã thanh toán</button>
                </div>
              )}
            </section>

            <section className="bcf__block bcf__block--summary">
              <h2 className="bcf__block-title">Chi tiết thanh toán</h2>
              <div className="bcf__summary">
                <div className="bcf__summary-part">
                  <span className="bcf__summary-sub">Vé ({selectedSeats.length} ghế)</span>
                  <div className="bcf__summary-rows">
                    <div><span>Giá vé</span><span>{formatCurrency(priceDetails.subtotal)}</span></div>
                    <div><span>Phí dịch vụ</span><span>{formatCurrency(priceDetails.serviceFee)}</span></div>
                    <div><span>VAT 10%</span><span>{formatCurrency(priceDetails.tax)}</span></div>
                    <div className="bcf__summary-subrow"><span>Tạm tính vé</span><span>{formatCurrency(priceDetails.total)}</span></div>
                  </div>
                </div>
                {concessionData.total > 0 && (
                  <div className="bcf__summary-part">
                    <span className="bcf__summary-sub">Đồ ăn ({concessionData.items?.length || 0} món)</span>
                    <div className="bcf__summary-rows"><div><span>Tổng</span><span>{formatCurrency(concessionData.total)}</span></div></div>
                  </div>
                )}
                {isGuest && !showQRCode && (
                  <div className="bcf__guest-points-msg">
                    <span className="bcf__guest-points-text">Cần tạo tài khoản để tích điểm và đổi điểm.</span>
                  </div>
                )}
                {!isGuest && pointsBalance?.availablePoints > 0 && !showQRCode && (
                  <div className="bcf__points">
                    <span className="bcf__points-label">Điểm: {pointsBalance.availablePoints.toLocaleString()} (1đ = 1.000₫, tối đa 50%)</span>
                    <div className="bcf__points-row">
                      <input type="number" className="bcf__points-input" value={pointsToUse} onChange={handlePointsChange} min={0} max={pointsBalance.availablePoints} placeholder="Số điểm" />
                      <button type="button" className="bcf__btn bcf__btn--small" onClick={handleUseAllPoints}>Dùng tối đa</button>
                      {pointsToUse > 0 && <button type="button" className="bcf__btn bcf__btn--small bcf__btn--ghost" onClick={handleClearPoints}>Xóa</button>}
                    </div>
                    {pointsToUse > 0 && <p className="bcf__points-discount">Giảm: -{formatCurrency(pointsDiscount)}</p>}
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div className="bcf__summary-row bcf__summary-row--discount">
                    <span>Giảm điểm ({pointsToUse}đ)</span><span>-{formatCurrency(pointsDiscount)}</span>
                  </div>
                )}
                <div className="bcf__total">
                  <span>Tổng thanh toán</span>
                  <strong>{formatCurrency(grandTotal)}</strong>
                </div>
              </div>
            </section>

            <div className="bcf__actions">
              {!showQRCode ? (
                <>
                  <button type="button" className="bcf__btn bcf__btn--outline" onClick={() => navigate(-1)} disabled={isProcessing}>← Quay lại</button>
                  <button type="button" className="bcf__btn bcf__btn--primary" onClick={handleConfirmBooking} disabled={isProcessing || !selectedSeats.length}>
                    {isProcessing ? (<><span className="bcf__spinner" aria-hidden /> Đang xử lý...</>) : 'Tạo mã QR thanh toán'}
                  </button>
                </>
              ) : (
                <button type="button" className="bcf__btn bcf__btn--primary" onClick={() => navigate(user ? '/bookings' : '/')}>
                  {user ? 'Xem lịch sử đặt vé' : 'Về trang chủ'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmation;

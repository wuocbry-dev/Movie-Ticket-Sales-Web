import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../services/bookingService';
import paymentService from '../services/paymentService';
import { loyaltyService } from '../services/loyaltyService';
import { calculateBookingPrice, formatPrice as formatCurrency, SERVICE_FEE_PER_TICKET } from '../utils/priceCalculation';
import ConcessionSelection from './ConcessionSelection';
import './BookingConfirmation.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedSeats, totalPrice, sessionId, showtime } = location.state || {};
  
  const [paymentMethod] = useState('BANK_TRANSFER');
  const [voucherCode, setVoucherCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQRCode, setShowQRCode] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [bookingCode, setBookingCode] = useState(null);
  const [concessionData, setConcessionData] = useState({ items: [], total: 0 });
  const [showConcessionStep, setShowConcessionStep] = useState(true);
  
  // Points redemption states
  const [pointsBalance, setPointsBalance] = useState(null);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  // Tính toán giá tiền sử dụng utility (đồng bộ với backend)
  const priceDetails = calculateBookingPrice(
    showtime?.basePrice || 0,
    selectedSeats?.length || 0
  );

  // Tổng tiền bao gồm cả đồ ăn và giảm giá từ điểm
  const grandTotal = Math.max(0, priceDetails.total + concessionData.total - pointsDiscount);

  // Fetch points balance when user is loaded
  useEffect(() => {
    const fetchPointsBalance = async () => {
      if (user && user.userId) {
        setLoadingPoints(true);
        try {
          const balance = await loyaltyService.getPointsBalance(user.userId);
          setPointsBalance(balance);
          console.log('💰 User points balance:', balance);
        } catch (error) {
          console.error('Error fetching points balance:', error);
          setPointsBalance({ availablePoints: 0 });
        } finally {
          setLoadingPoints(false);
        }
      }
    };
    
    fetchPointsBalance();
  }, [user]);

  // Calculate points discount when points to use changes
  useEffect(() => {
    if (pointsToUse > 0) {
      const discountFromPoints = pointsToUse * 1000; // 1 point = 1000 VND
      const totalBeforeDiscount = priceDetails.total + concessionData.total;
      const maxDiscount = totalBeforeDiscount * 0.5; // Max 50% discount
      const actualDiscount = Math.min(discountFromPoints, maxDiscount);
      setPointsDiscount(actualDiscount);
    } else {
      setPointsDiscount(0);
    }
  }, [pointsToUse, priceDetails.total, concessionData.total]);

  const handlePointsChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const maxPoints = pointsBalance?.availablePoints || 0;
    // Limit to available points
    setPointsToUse(Math.min(Math.max(0, value), maxPoints));
  };

  const handleUseAllPoints = () => {
    const maxPoints = pointsBalance?.availablePoints || 0;
    const totalBeforeDiscount = priceDetails.total + concessionData.total;
    // Calculate max points that gives 50% discount
    const maxPointsFor50Percent = Math.floor((totalBeforeDiscount * 0.5) / 1000);
    setPointsToUse(Math.min(maxPoints, maxPointsFor50Percent));
  };

  const handleClearPoints = () => {
    setPointsToUse(0);
  };

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const userData = localStorage.getItem('user');
    if (userData && userData !== 'undefined') {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Vui lòng đăng nhập lại');
        navigate('/login');
      }
    } else {
      toast.error('Vui lòng đăng nhập để tiếp tục');
      navigate('/login');
    }

    // Validate state data
    if (!selectedSeats || !sessionId || !showtime) {
      toast.error('Thông tin đặt vé không hợp lệ');
      navigate('/');
    }

    // Debug: Log showtime data to check cinemaId
    console.log('🎬 Showtime data in BookingConfirmation:', showtime);
    console.log('🏢 Cinema ID:', showtime?.cinemaId);
  }, [navigate, selectedSeats, sessionId, showtime]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleConcessionChange = useCallback((data) => {
    setConcessionData(data);
    console.log('🍿 Concession updated:', data);
  }, []);

  const handleContinueToPayment = () => {
    setShowConcessionStep(false);
  };

  const generateVietQR = (paymentReference) => {
    // VietQR API format
    // https://img.vietqr.io/image/[BANK_ID]-[ACCOUNT_NUMBER]-[TEMPLATE].png?amount=[AMOUNT]&addInfo=[DESCRIPTION]&accountName=[ACCOUNT_NAME]
    
    const bankId = '970422'; // MB Bank (có thể thay đổi)
    const accountNumber = '0915232119'; // Số tài khoản (thay bằng số thật)
    const accountName = 'CINEMA BOOKING'; // Tên tài khoản
    const template = 'compact2'; // Template: compact, compact2, qr_only, print
    const amount = grandTotal; // Sử dụng tổng tiền bao gồm cả đồ ăn
    
    // Nội dung chuyển khoản: Payment Reference + thông tin booking
    const description = paymentReference 
      ? `${paymentReference} ${showtime.movieTitle.substring(0, 15)}`
      : `BOOKING ${showtime.movieTitle.substring(0, 20)} GHE ${selectedSeats.map(s => s.seatRow + s.seatNumber).join(' ')}`;
    
    const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
    
    setQrCodeUrl(qrUrl);
    setShowQRCode(true);
    
    console.log('💰 === PRICE CALCULATION ===');
    console.log('Base Price:', showtime.basePrice);
    console.log('Number of Seats:', selectedSeats.length);
    console.log('Subtotal:', priceDetails.subtotal);
    console.log('Service Fee:', priceDetails.serviceFee);
    console.log('Tax (10%):', priceDetails.tax);
    console.log('Ticket Total:', priceDetails.total);
    console.log('Concession Total:', concessionData.total);
    console.log('Points Discount:', pointsDiscount);
    console.log('Grand Total:', grandTotal);
    console.log('🏦 Payment Reference:', paymentReference);
    console.log('🏦 VietQR Generated:', qrUrl);
  };

  const handleConfirmBooking = async () => {
    if (!user || !user.userId) {
      toast.error('Không tìm thấy thông tin người dùng');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ghế');
      return;
    }
    
    setIsProcessing(true);

    const bookingData = {
      userId: user.userId,
      showtimeId: parseInt(showtime.showtimeId),
      seatIds: selectedSeats.map(seat => seat.seatId),
      sessionId: sessionId,
      voucherCode: voucherCode.trim() || null,
      pointsToUse: pointsToUse > 0 ? pointsToUse : null,
      paymentMethod: 'BANK_TRANSFER',
      concessionItems: concessionData.items.length > 0 ? concessionData.items.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price
      })) : null
    };

    console.log('🎫 === BOOKING REQUEST ===');
    console.log('Request Body:', JSON.stringify(bookingData, null, 2));
    console.log('Points to use:', pointsToUse);
    console.log('Points discount:', pointsDiscount);
    console.log('Endpoint: POST /api/bookings');

    // IMPORTANT: Re-verify seats are still held before booking
    try {
      const verifyUrl = `${API_BASE_URL}/seats/verify-hold?showtimeId=${bookingData.showtimeId}&sessionId=${sessionId}&seatIds=${bookingData.seatIds.join(',')}`;
      console.log('🔍 Verifying seat holds:', verifyUrl);
      
      const verifyResponse = await fetch(verifyUrl);
      const verifyData = await verifyResponse.json();
      
      console.log('✅ Verification result:', verifyData);
      
      if (!verifyData.allSeatsHeld) {
        console.error('❌ Not all seats are held:', verifyData);
        toast.error('Một số ghế không còn được giữ. Vui lòng chọn lại ghế!');
        setIsProcessing(false);
        navigate(`/showtime/${bookingData.showtimeId}`);
        return;
      }
    } catch (verifyError) {
      console.warn('⚠️ Could not verify seat holds:', verifyError);
      // Continue anyway - backend will validate
    }

    try {
      const response = await bookingService.createBooking(bookingData);
      
      console.log('✅ Booking Success:', response);
      
      // Lưu bookingId và bookingCode
      setBookingId(response.bookingId);
      setBookingCode(response.bookingCode);
      
      // Lấy payment_reference từ response và tạo QR code
      const paymentReference = response.paymentReference || response.bookingCode || null;
      generateVietQR(paymentReference);
      
      toast.success('Đặt vé thành công! Vui lòng quét mã QR để thanh toán 🎉');
      
      // Nếu có dùng điểm, dispatch event để Header cập nhật
      if (pointsToUse > 0) {
        window.dispatchEvent(new Event('pointsChanged'));
      }

    } catch (error) {
      console.error('❌ Booking Failed:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Đặt vé thất bại. Vui lòng thử lại!';
      
      toast.error(errorMessage);
      setShowQRCode(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!bookingId) {
      toast.error('Không tìm thấy thông tin booking');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('💳 Confirming payment for booking:', bookingId);
      const response = await paymentService.processPayment(bookingId);
      
      console.log('✅ Payment confirmed:', response);
      
      if (response.success) {
        toast.success('Xác nhận thanh toán thành công! 🎉');
        
        // Chuyển đến trang lịch sử đặt vé
        setTimeout(() => {
          navigate('/bookings');
        }, 1500);
      } else {
        toast.error(response.message || 'Xác nhận thanh toán thất bại');
      }
    } catch (error) {
      console.error('❌ Payment confirmation failed:', error);
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || 'Xác nhận thanh toán thất bại. Vui lòng thử lại!';
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmed = () => {
    toast.success('Cảm ơn bạn đã thanh toán!');
    // Dispatch event để Header cập nhật điểm tích lũy
    window.dispatchEvent(new Event('pointsChanged'));
    navigate('/bookings'); // Chuyển đến trang lịch sử booking
  };

  if (!user || !selectedSeats || !showtime) {
    return (
      <div className="booking-confirmation-page">
        <div className="bc-loading">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="booking-confirmation-page">
      <div className="booking-confirmation-container">
        <h1 className="booking-confirmation-title">🎬 Xác nhận đặt vé</h1>

        {/* Progress Steps */}
        <div className="bc-booking-progress">
          <div className={`bc-progress-step ${!showConcessionStep ? 'completed' : 'active'}`}>
            <div className="bc-step-number">1</div>
            <div className="bc-step-label">Chọn đồ ăn</div>
          </div>
          <div className="bc-progress-line"></div>
          <div className={`bc-progress-step ${!showConcessionStep ? 'active' : ''}`}>
            <div className="bc-step-number">2</div>
            <div className="bc-step-label">Thanh toán</div>
          </div>
        </div>

        <div className="booking-confirmation-content">
          {/* Concession Selection Step */}
          {showConcessionStep && (
            <div className="bc-concession-step">
              <ConcessionSelection 
                cinemaId={showtime?.cinemaId} 
                onConcessionChange={handleConcessionChange}
              />
              
              <div className="bc-concession-step-actions">
                <button
                  className="bc-btn-skip-concession"
                  onClick={handleContinueToPayment}
                >
                  Bỏ qua
                </button>
                <button
                  className="bc-btn-continue-payment"
                  onClick={handleContinueToPayment}
                >
                  Tiếp tục thanh toán →
                </button>
              </div>
            </div>
          )}

          {/* Payment Step */}
          {!showConcessionStep && (
            <>
          {/* Layout 2 cột */}
          <div className="bc-booking-layout">
            {/* Cột trái - Thông tin */}
            <div className="bc-booking-left">
              {/* Thông tin phim */}
              <div className="bc-booking-card bc-movie-card">
                <div className="bc-card-header">
                  <h2>🎥 Thông tin suất chiếu</h2>
                </div>
                <div className="bc-card-body">
                  <div className="bc-info-row">
                    <span className="bc-info-icon">🎬</span>
                    <div className="bc-info-content">
                      <span className="bc-info-label">Phim</span>
                      <span className="bc-info-value">{showtime.movieTitle}</span>
                    </div>
                  </div>
                  <div className="bc-info-row">
                    <span className="bc-info-icon">🏢</span>
                    <div className="bc-info-content">
                      <span className="bc-info-label">Rạp</span>
                      <span className="bc-info-value">{showtime.cinemaName}</span>
                    </div>
                  </div>
                  <div className="bc-info-row">
                    <span className="bc-info-icon">🚪</span>
                    <div className="bc-info-content">
                      <span className="bc-info-label">Phòng chiếu</span>
                      <span className="bc-info-value">{showtime.hallName}</span>
                    </div>
                  </div>
                  <div className="bc-info-row">
                    <span className="bc-info-icon">📅</span>
                    <div className="bc-info-content">
                      <span className="bc-info-label">Suất chiếu</span>
                      <span className="bc-info-value">{formatDateTime(showtime.showDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghế đã chọn */}
              <div className="bc-booking-card bc-seats-card">
                <div className="bc-card-header">
                  <h2>🪑 Ghế đã chọn</h2>
                  <span className="bc-seat-count">{selectedSeats.length} ghế</span>
                </div>
                <div className="bc-card-body">
                  <div className="bc-seats-grid">
                    {selectedSeats.map((seat) => (
                      <div key={seat.seatId} className="bc-seat-badge">
                        <div className="bc-seat-badge-header">
                          <span className="bc-seat-badge-label">{seat.seatRow}{seat.seatNumber}</span>
                          <span className={`bc-seat-badge-type ${seat.seatType.toLowerCase()}`}>
                            {seat.seatType}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Voucher */}
              {/* Phương thức thanh toán */}
              <div className="bc-booking-card bc-payment-card">
                <div className="bc-card-header">
                  <h2>🏦 Phương thức thanh toán</h2>
                </div>
                <div className="bc-card-body">
                  <div className="bc-payment-info-box">
                    <div className="bc-payment-method-display">
                      <span className="bc-payment-icon">🏦</span>
                      <div className="bc-payment-info">
                        <span className="bc-payment-name">Chuyển khoản ngân hàng</span>
                        <span className="bc-payment-desc">Quét mã QR để thanh toán nhanh</span>
                      </div>
                    </div>
                  </div>

                  {showQRCode && qrCodeUrl && (
                    <div className="bc-qr-code-section">
                      <div className="bc-qr-code-header">
                        <span className="bc-qr-icon">📱</span>
                        <h3>Quét mã QR để thanh toán</h3>
                      </div>
                      <div className="bc-qr-code-container">
                        <img src={qrCodeUrl} alt="VietQR Payment" className="bc-qr-code-image" />
                      </div>
                      <div className="bc-qr-instructions">
                        <p>1. Mở ứng dụng ngân hàng của bạn</p>
                        <p>2. Quét mã QR phía trên</p>
                        <p>3. Kiểm tra thông tin và xác nhận thanh toán</p>
                        <p className="bc-qr-note">⚠️ Vui lòng không thay đổi nội dung chuyển khoản</p>
                      </div>
                      <button 
                        className="bc-btn-payment-confirmed"
                        onClick={handlePaymentConfirmed}
                      >
                        ✓ Tôi đã thanh toán
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Đồ ăn đã chọn */}
              {concessionData.items.length > 0 && (
                <div className="bc-booking-card bc-concession-summary-card">
                  <div className="bc-card-header">
                    <h2>🍿 Đồ ăn & Nước uống</h2>
                    <button 
                      className="bc-btn-edit-concession"
                      onClick={() => setShowConcessionStep(true)}
                    >
                      ✏️ Sửa
                    </button>
                  </div>
                  <div className="bc-card-body">
                    {concessionData.items.map((item, index) => (
                      <div key={index} className="bc-concession-item-row">
                        <div className="bc-concession-item-info">
                          <span className="bc-concession-item-name">{item.itemName}</span>
                          <span className="bc-concession-item-qty">x{item.quantity}</span>
                        </div>
                        <span className="bc-concession-item-price">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tổng tiền */}
              <div className="bc-booking-card bc-summary-card">
                <div className="bc-card-header">
                  <h2>💰 Chi tiết thanh toán</h2>
                </div>
                <div className="bc-card-body">
                  <div className="bc-summary-section">
                    <div className="bc-summary-section-title">🎫 Vé xem phim</div>
                    <div className="bc-summary-row">
                      <span className="bc-summary-label">Giá vé ({selectedSeats.length} ghế × {formatCurrency(showtime.basePrice || 0)})</span>
                      <span className="bc-summary-value">{formatCurrency(priceDetails.subtotal)}</span>
                    </div>
                    <div className="bc-summary-row">
                      <span className="bc-summary-label">Phí dịch vụ ({selectedSeats.length} × {formatCurrency(SERVICE_FEE_PER_TICKET)})</span>
                      <span className="bc-summary-value">{formatCurrency(priceDetails.serviceFee)}</span>
                    </div>
                    <div className="bc-summary-row">
                      <span className="bc-summary-label">Thuế VAT (10%)</span>
                      <span className="bc-summary-value">{formatCurrency(priceDetails.tax)}</span>
                    </div>
                    <div className="bc-summary-row bc-subtotal-row">
                      <span className="bc-summary-label">Tạm tính vé</span>
                      <span className="bc-summary-value">{formatCurrency(priceDetails.total)}</span>
                    </div>
                  </div>

                  {concessionData.total > 0 && (
                    <div className="bc-summary-section">
                      <div className="bc-summary-section-title">🍿 Đồ ăn & Nước</div>
                      <div className="bc-summary-row">
                        <span className="bc-summary-label">{concessionData.items.length} món</span>
                        <span className="bc-summary-value">{formatCurrency(concessionData.total)}</span>
                      </div>
                    </div>
                  )}

                  {/* Points Redemption Section */}
                  {pointsBalance && pointsBalance.availablePoints > 0 && !showQRCode && (
                    <div className="bc-summary-section bc-points-section">
                      <div className="bc-summary-section-title">🎁 Sử dụng điểm thưởng</div>
                      <div className="bc-points-info-box">
                        <div className="bc-points-balance">
                          <span className="bc-points-label">Điểm hiện có:</span>
                          <span className="bc-points-value">{pointsBalance.availablePoints.toLocaleString()} điểm</span>
                        </div>
                        <div className="bc-points-rate">
                          <span className="bc-points-hint">💡 1 điểm = 1,000 VND (Tối đa giảm 50%)</span>
                        </div>
                      </div>
                      <div className="bc-points-input-group">
                        <input
                          type="number"
                          className="bc-points-input"
                          value={pointsToUse}
                          onChange={handlePointsChange}
                          min="0"
                          max={pointsBalance.availablePoints}
                          placeholder="Nhập số điểm muốn dùng"
                        />
                        <div className="bc-points-buttons">
                          <button 
                            type="button" 
                            className="bc-btn-use-all-points"
                            onClick={handleUseAllPoints}
                          >
                            Dùng tối đa
                          </button>
                          {pointsToUse > 0 && (
                            <button 
                              type="button" 
                              className="bc-btn-clear-points"
                              onClick={handleClearPoints}
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      </div>
                      {pointsToUse > 0 && (
                        <div className="bc-points-discount-preview">
                          <span className="discount-label">Giảm giá từ điểm:</span>
                          <span className="discount-amount">- {formatCurrency(pointsDiscount)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {pointsDiscount > 0 && (
                    <div className="bc-summary-row bc-points-discount-row">
                      <span className="bc-summary-label">🎁 Giảm giá điểm ({pointsToUse} điểm)</span>
                      <span className="bc-summary-value discount">- {formatCurrency(pointsDiscount)}</span>
                    </div>
                  )}

                  {priceDetails.discount > 0 && (
                    <div className="bc-summary-row">
                      <span className="bc-summary-label">Giảm giá</span>
                      <span className="bc-summary-value discount">- {formatCurrency(priceDetails.discount)}</span>
                    </div>
                  )}
                  <div className="bc-summary-divider"></div>
                  <div className="bc-summary-total">
                    <span className="total-label">Tổng thanh toán</span>
                    <span className="total-amount">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="bc-booking-actions">
                {!showQRCode ? (
                  <>
                    <button
                      className="bc-btn-back"
                      onClick={() => navigate(-1)}
                      disabled={isProcessing}
                    >
                      ← Quay lại
                    </button>
                    <button
                      className="bc-btn-confirm"
                      onClick={handleConfirmBooking}
                      disabled={isProcessing || selectedSeats.length === 0}
                    >
                      {isProcessing ? (
                        <>
                          <span className="bc-spinner"></span>
                          Đang xử lý...
                        </>
                      ) : (
                        <>
                          <span>🏦</span>
                          Tạo mã QR thanh toán
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    className="bc-btn-confirm btn-center"
                    onClick={() => navigate('/bookings')}
                  >
                    📋 Xem lịch sử đặt vé
                  </button>
                )}
              </div>
            </div>
            {/* Cột trái kết thúc */}
          </div>
          {/* Layout kết thúc */}
            </>
          )}
        </div>
        {/* Content kết thúc */}
      </div>
      {/* Container kết thúc */}
    </div>
    /* Page kết thúc */
  );
};

export default BookingConfirmation;
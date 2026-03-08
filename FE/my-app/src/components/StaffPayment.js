import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { Scanner } from '@yudiel/react-qr-scanner';
import './StaffPayment.css';
import { 
  FaQrcode, 
  FaUniversity, 
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle
} from 'react-icons/fa';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const StaffPayment = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [bookingInfo, setBookingInfo] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('momo'); // 'momo' or 'bank'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Mock QR code URLs - Replace with actual API calls
  const momoQR = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MOMO:0123456789:50000';
  const bankQR = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BANK:9876543210:50000';

  const bankInfo = {
    bankName: 'Ngân hàng Vietcombank',
    accountNumber: '1234567890',
    accountName: 'CINEMA BOOKING SYSTEM',
    branch: 'Chi nhánh TP.HCM'
  };

  const handleSearchBooking = async () => {
    if (!bookingCode.trim()) {
      toast.error('Vui lòng nhập mã đặt vé');
      return;
    }

    setIsProcessing(true);
    try {
      // Call API to get booking details from database
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/bookings/code/${bookingCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Không tìm thấy thông tin đặt vé trong hệ thống');
        } else {
          toast.error('Có lỗi xảy ra khi tìm kiếm');
        }
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      
      setBookingInfo({
        bookingCode: data.bookingCode,
        movieTitle: data.movieTitle || 'N/A',
        showtime: data.showtime || 'N/A',
        hall: data.hallName || data.hall || 'N/A',
        seats: data.seatNumbers || data.seats || [],
        ticketPrice: data.totalAmount || data.ticketPrice || 0,
        concessions: data.concessions || 0,
        total: data.totalAmount || data.total || 0,
        customerName: data.customerName || 'N/A',
        customerPhone: data.customerPhone || 'N/A'
      });
      setIsProcessing(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      // Call API to confirm payment
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingCode: bookingCode,
          paymentMethod: paymentMethod.toUpperCase(),
          amount: bookingInfo.total
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || 'Có lỗi xảy ra khi xác nhận thanh toán');
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      
      // Save to activity log
      const activity = {
        type: 'payment',
        title: 'Thanh toán thành công',
        details: `Mã: ${bookingCode} - ${paymentMethod === 'momo' ? 'MoMo' : 'Chuyển khoản'} - ${formatCurrency(bookingInfo.total)}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };
      
      const activities = JSON.parse(localStorage.getItem('staffActivities') || '[]');
      activities.unshift(activity);
      if (activities.length > 20) activities.pop();
      localStorage.setItem('staffActivities', JSON.stringify(activities));

      setPaymentCompleted(true);
      toast.success('Thanh toán thành công!');
      setIsProcessing(false);
      
      // Reset after 3 seconds
      setTimeout(() => {
        setBookingCode('');
        setBookingInfo(null);
        setPaymentCompleted(false);
        setPaymentMethod('momo');
      }, 3000);
    } catch (error) {
      console.error('Error during payment:', error);
      toast.error('Không thể kết nối đến server');
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleReset = () => {
    setBookingCode('');
    setBookingInfo(null);
    setPaymentCompleted(false);
    setPaymentMethod('momo');
  };

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleQRScan = (result) => {
    if (result) {
      const scannedCode = result[0].rawValue;
      setBookingCode(scannedCode);
      setShowScanner(false);
      toast.success('Quét QR thành công!');
      setTimeout(() => {
        handleSearchBooking();
      }, 500);
    }
  };

  const handleQRError = (error) => {
    console.error('QR Scanner Error:', error);
    toast.error('Lỗi khi quét QR. Vui lòng thử lại!');
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
  };

  return (
    <div className="staff-payment-container">
      <div className="payment-header">
        <h1>💳 Thanh Toán</h1>
        <p>Xử lý thanh toán đặt vé cho khách hàng</p>
      </div>

      {!paymentCompleted ? (
        <>
          {/* Search Section */}
          <div className="payment-search">
            <input
              type="text"
              placeholder="Nhập mã đặt vé (ví dụ: BK20241205001)"
              value={bookingCode}
              onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchBooking()}
              disabled={isProcessing || bookingInfo}
            />
            <button
              onClick={handleScanQR}
              disabled={isProcessing || bookingInfo}
              className="qr-scan-btn"
              title="Quét mã QR"
            >
              📷 Quét QR
            </button>
            <button 
              onClick={handleSearchBooking}
              disabled={isProcessing || bookingInfo}
              className="search-btn"
            >
              {isProcessing ? 'Đang tìm...' : '🔍 Tìm kiếm'}
            </button>
          </div>

          {/* QR Scanner Modal */}
          {showScanner && (
            <div className="qr-scanner-modal">
              <div className="qr-scanner-content">
                <button className="close-scanner" onClick={handleCloseScanner}>✕</button>
                <h3>📷 Quét Mã QR Vé</h3>
                <div className="scanner-box">
                  <Scanner
                    onScan={handleQRScan}
                    onError={handleQRError}
                    containerStyle={{ width: '100%' }}
                    videoStyle={{ width: '100%', borderRadius: '15px' }}
                  />
                  <p>Đưa mã QR vào khung hình để quét</p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Info */}
          {bookingInfo && (
            <div className="booking-info-card">
              <h2>Thông Tin Đặt Vé</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Mã đặt vé:</span>
                  <span className="value">{bookingInfo.bookingCode}</span>
                </div>
                <div className="info-item">
                  <span className="label">Khách hàng:</span>
                  <span className="value">{bookingInfo.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{bookingInfo.customerPhone}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phim:</span>
                  <span className="value">{bookingInfo.movieTitle}</span>
                </div>
                <div className="info-item">
                  <span className="label">Suất chiếu:</span>
                  <span className="value">{bookingInfo.showtime}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phòng:</span>
                  <span className="value">{bookingInfo.hall}</span>
                </div>
                <div className="info-item">
                  <span className="label">Ghế:</span>
                  <span className="value">{bookingInfo.seats.join(', ')}</span>
                </div>
              </div>

              <div className="payment-summary">
                <div className="summary-row">
                  <span>Tiền vé:</span>
                  <span>{formatCurrency(bookingInfo.ticketPrice)}</span>
                </div>
                <div className="summary-row">
                  <span>Đồ ăn & nước:</span>
                  <span>{formatCurrency(bookingInfo.concessions)}</span>
                </div>
                <div className="summary-row total">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(bookingInfo.total)}</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="payment-methods">
                <h3>Chọn Phương Thức Thanh Toán</h3>
                <div className="method-buttons">
                  <button
                    className={`method-btn ${paymentMethod === 'momo' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('momo')}
                  >
                    <FaMoneyBillWave />
                    <span>MoMo QR</span>
                  </button>
                  <button
                    className={`method-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <FaUniversity />
                    <span>Chuyển Khoản</span>
                  </button>
                </div>
              </div>

              {/* QR Code Display */}
              <div className="qr-section">
                {paymentMethod === 'momo' ? (
                  <div className="qr-content">
                    <FaQrcode className="qr-icon" />
                    <h3>Quét Mã QR MoMo</h3>
                    <div className="qr-code">
                      <img src={momoQR} alt="MoMo QR Code" />
                    </div>
                    <p className="qr-instruction">
                      Mở ứng dụng MoMo và quét mã QR để thanh toán
                    </p>
                    <div className="amount-display">
                      {formatCurrency(bookingInfo.total)}
                    </div>
                  </div>
                ) : (
                  <div className="qr-content">
                    <FaCreditCard className="qr-icon" />
                    <h3>Chuyển Khoản Ngân Hàng</h3>
                    <div className="bank-info">
                      <div className="bank-detail">
                        <span className="bank-label">Ngân hàng:</span>
                        <span className="bank-value">{bankInfo.bankName}</span>
                      </div>
                      <div className="bank-detail">
                        <span className="bank-label">Số tài khoản:</span>
                        <span className="bank-value">{bankInfo.accountNumber}</span>
                      </div>
                      <div className="bank-detail">
                        <span className="bank-label">Chủ tài khoản:</span>
                        <span className="bank-value">{bankInfo.accountName}</span>
                      </div>
                      <div className="bank-detail">
                        <span className="bank-label">Chi nhánh:</span>
                        <span className="bank-value">{bankInfo.branch}</span>
                      </div>
                      <div className="bank-detail">
                        <span className="bank-label">Số tiền:</span>
                        <span className="bank-value amount">{formatCurrency(bookingInfo.total)}</span>
                      </div>
                      <div className="bank-detail">
                        <span className="bank-label">Nội dung:</span>
                        <span className="bank-value">{bookingInfo.bookingCode}</span>
                      </div>
                    </div>
                    <div className="qr-code">
                      <img src={bankQR} alt="Bank QR Code" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="payment-actions">
                <button
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                  className="confirm-btn"
                >
                  {isProcessing ? 'Đang xử lý...' : '✓ Xác Nhận Đã Thanh Toán'}
                </button>
                <button
                  onClick={handleReset}
                  disabled={isProcessing}
                  className="cancel-btn"
                >
                  ✗ Hủy
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="payment-success">
          <FaCheckCircle className="success-icon" />
          <h2>Thanh Toán Thành Công!</h2>
          <p>Mã đặt vé: {bookingInfo.bookingCode}</p>
          <p>Số tiền: {formatCurrency(bookingInfo.total)}</p>
        </div>
      )}
    </div>
  );
};

export default StaffPayment;

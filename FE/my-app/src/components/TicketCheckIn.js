import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Scanner } from '@yudiel/react-qr-scanner';
import Cookies from 'js-cookie';
import './TicketCheckIn.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const TicketCheckIn = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [staffCinema, setStaffCinema] = useState(null);

  // Lấy thông tin rạp của staff khi component mount
  useEffect(() => {
    const fetchStaffCinema = async () => {
      try {
        const token = Cookies.get('accessToken');
        const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
        const staffId = userInfo.userId;
        
        if (!staffId) return;
        
        const response = await fetch(`${API_BASE_URL}/tickets/staff/my-cinema?staffId=${staffId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStaffCinema(data);
          console.log('Staff cinema:', data);
        }
      } catch (error) {
        console.error('Error fetching staff cinema:', error);
      }
    };
    
    fetchStaffCinema();
  }, []);

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Chưa thanh toán',
      'CONFIRMED': 'Đã xác nhận',
      'PAID': 'Đã thanh toán',
      'COMPLETED': 'Đã check-in',
      'CANCELLED': 'Đã hủy',
      'REFUNDED': 'Đã hoàn tiền',
      'CHECKED_IN': 'Đã check-in'
    };
    return statusMap[status] || 'Không hợp lệ';
  };

  const handleScan = async () => {
    if (!bookingCode.trim()) {
      toast.error('Vui lòng nhập mã đặt vé');
      return;
    }

    // Kiểm tra staff đã được gán rạp chưa
    if (!staffCinema || !staffCinema.cinemaId) {
      toast.error('Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.');
      return;
    }

    setIsLoading(true);
    try {
      // Call API to get booking details with cinema validation
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/tickets/staff/${staffCinema.cinemaId}/booking-details?bookingCode=${bookingCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        // Hiển thị thông báo lỗi từ backend (vé không thuộc rạp này)
        toast.error(data.message || 'Có lỗi xảy ra khi tìm kiếm vé');
        setIsLoading(false);
        return;
      }
      
      console.log('API Response:', data);
      console.log('Tickets:', data.tickets);
      
      // Extract cinema info from response
      let cinemaName = staffCinema.cinemaName;
      let cinemaId = staffCinema.cinemaId;
      
      if (data.showtime?.hall?.cinema) {
        cinemaName = data.showtime.hall.cinema.cinemaName || cinemaName;
        cinemaId = data.showtime.hall.cinema.cinemaId || cinemaId;
      }
      
      // Extract ticket info - API trả về cấu trúc khác
      const tickets = data.tickets || [];
      
      // Log detailed check-in info for each ticket
      tickets.forEach((ticket, index) => {
        console.log(`Ticket ${index}:`, {
          seat: ticket.seat ? `${ticket.seat.seatRow}${ticket.seat.seatNumber}` : 'N/A',
          checkedInAt: ticket.checkedInAt
        });
      });
      
      // Check if booking is already completed (checked in)
      const isCompleted = data.status === 'COMPLETED';
      
      // Check if booking is valid for check-in
      const validStatuses = ['CONFIRMED', 'PAID'];
      const isStatusValid = validStatuses.includes(data.status);
      
      // Check if any ticket has already been checked in
      const hasCheckedInTicket = tickets.some(t => t.checkedInAt !== null && t.checkedInAt !== undefined);
      
      console.log('Status:', data.status);
      console.log('Is Completed:', isCompleted);
      console.log('Status Valid:', isStatusValid);
      console.log('Has Checked In:', hasCheckedInTicket);
      
      // Show warning if already checked in
      if (isCompleted || hasCheckedInTicket) {
        toast.warning('Vé đã được check-in trước đó! Không thể check-in lại.');
      }
      
      // Valid only if status is valid AND not completed AND not checked in yet
      const isValid = isStatusValid && !isCompleted && !hasCheckedInTicket;
      
      // Extract seat information from tickets
      const seats = tickets.map(t => t.seat ? `${t.seat.seatRow}${t.seat.seatNumber}` : 'N/A');
      
      // Extract movie and showtime info
      const movieTitle = data.showtime?.movie?.title || 'N/A';
      const showDate = data.showtime?.showDate || 'N/A';
      const startTime = data.showtime?.startTime || 'N/A';
      const hallName = data.showtime?.hall?.hallName || 'N/A';
      
      setTicketInfo({
        bookingCode: data.bookingCode,
        customerName: data.customerName || 'N/A',
        movieTitle: movieTitle,
        showtime: startTime,
        date: showDate,
        hall: hallName,
        cinemaId: cinemaId,
        cinemaName: cinemaName,
        seats: seats,
        totalTickets: data.totalSeats || seats.length,
        totalAmount: data.totalAmount || 0,
        status: isValid ? 'valid' : 'invalid',
        originalStatus: (isCompleted || hasCheckedInTicket) ? 'COMPLETED' : data.status,
        tickets: tickets
      });
      toast.success('Tìm thấy vé');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!ticketInfo) return;

    setIsLoading(true);
    try {
      // Get user info to get staffId
      const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      const staffId = userInfo.userId;

      console.log('User Info:', userInfo);
      console.log('Staff ID:', staffId);

      if (!staffId) {
        toast.error('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        setIsLoading(false);
        return;
      }

      // Call API to confirm check-in
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/tickets/check-in`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingCode: bookingCode,
          staffId: staffId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Show specific error message from backend
        const errorMessage = errorData.message || errorData.error || 'Có lỗi xảy ra khi check-in';
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      // Save activity to localStorage
      const activity = {
        type: 'check-in',
        title: 'Check-in vé thành công',
        details: `Mã vé: ${bookingCode} - Phim: ${ticketInfo.movieTitle} - Ghế: ${ticketInfo.seats.join(', ')}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      };
      
      const activities = JSON.parse(localStorage.getItem('staffActivities') || '[]');
      activities.unshift(activity);
      if (activities.length > 20) activities.pop();
      localStorage.setItem('staffActivities', JSON.stringify(activities));
      
      toast.success('Check-in thành công!');
      setTicketInfo(null);
      setBookingCode('');
      setIsLoading(false);
    } catch (error) {
      console.error('Error during check-in:', error);
      toast.error('Không thể kết nối đến server');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBookingCode('');
    setTicketInfo(null);
  };

  const handleScanQR = () => {
    setShowScanner(true);
  };

  const handleQRScan = async (result) => {
    if (result) {
      const scannedCode = result[0].rawValue;
      setBookingCode(scannedCode);
      setShowScanner(false);
      toast.success('Quét QR thành công!');
      
      // Kiểm tra staff đã được gán rạp chưa
      if (!staffCinema || !staffCinema.cinemaId) {
        toast.error('Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.');
        return;
      }
      
      // Auto search immediately after scan with cinema validation
      setIsLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const response = await fetch(`${API_BASE_URL}/tickets/staff/${staffCinema.cinemaId}/booking-details?bookingCode=${scannedCode}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          // Hiển thị thông báo lỗi từ backend (vé không thuộc rạp này)
          toast.error(data.message || 'Có lỗi xảy ra khi tìm kiếm vé');
          setIsLoading(false);
          return;
        }
        
        // Extract cinema info from response
        let cinemaName = staffCinema.cinemaName;
        let cinemaId = staffCinema.cinemaId;
        
        if (data.showtime?.hall?.cinema) {
          cinemaName = data.showtime.hall.cinema.cinemaName || cinemaName;
          cinemaId = data.showtime.hall.cinema.cinemaId || cinemaId;
        }
        
        // Extract ticket info
        const tickets = data.tickets || [];
        
        // Check if booking is valid for check-in
        const validStatuses = ['CONFIRMED', 'PAID'];
        const isStatusValid = validStatuses.includes(data.status);
        const isCompleted = data.status === 'COMPLETED';
        
        // Check if any ticket has already been checked in
        const hasCheckedInTicket = tickets.some(t => t.checkedInAt !== null && t.checkedInAt !== undefined);
        
        // Valid only if status is valid AND not checked in yet
        const isValid = isStatusValid && !isCompleted && !hasCheckedInTicket;
        
        // Show warning if already checked in
        if (isCompleted || hasCheckedInTicket) {
          toast.warning('Vé đã được check-in trước đó! Không thể check-in lại.');
        }
        
        // Extract seat information from tickets
        const seats = tickets.map(t => t.seat ? `${t.seat.seatRow}${t.seat.seatNumber}` : 'N/A');
        
        // Extract movie and showtime info
        const movieTitle = data.showtime?.movie?.title || 'N/A';
        const showDate = data.showtime?.showDate || 'N/A';
        const startTime = data.showtime?.startTime || 'N/A';
        const hallName = data.showtime?.hall?.hallName || 'N/A';
        
        setTicketInfo({
          bookingCode: data.bookingCode,
          customerName: data.customerName || 'N/A',
          movieTitle: movieTitle,
          showtime: startTime,
          date: showDate,
          hall: hallName,
          cinemaId: cinemaId,
          cinemaName: cinemaName,
          seats: seats,
          totalTickets: data.totalSeats || seats.length,
          totalAmount: data.totalAmount || 0,
          status: isValid ? 'valid' : 'invalid',
          originalStatus: (isCompleted || hasCheckedInTicket) ? 'COMPLETED' : data.status,
          tickets: tickets
        });
        toast.success('Tìm thấy vé');
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
        setIsLoading(false);
      }
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
    <div className="ticket-checkin-container">
      <div className="checkin-header">
        <h1>🎫 Xác Nhận Check-in Vé</h1>
        <p>Quét mã QR hoặc nhập mã đặt vé để xác nhận</p>
        {staffCinema && (
          <div className="staff-cinema-badge">
            🏢 Đang làm việc tại: <strong>{staffCinema.cinemaName}</strong>
          </div>
        )}
      </div>

      <div className="checkin-scanner">
        <div className="scanner-input">
          <input
            type="text"
            placeholder="Nhập mã đặt vé (ví dụ: BK20241205001)"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
            disabled={isLoading || ticketInfo}
          />
          <button 
            onClick={handleScanQR}
            disabled={isLoading || ticketInfo}
            className="qr-scan-btn"
            title="Quét mã QR"
          >
            📷 Quét QR
          </button>
          <button 
            onClick={handleScan} 
            disabled={isLoading || ticketInfo}
            className="scan-btn"
          >
            {isLoading ? 'Đang tìm...' : '🔍 Tìm Vé'}
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
        )}        {ticketInfo && (
          <div className="ticket-info-card">
            <div className="ticket-header">
              <h2>Thông Tin Vé</h2>
              <span className={`status-badge ${ticketInfo.status}`}>
                {ticketInfo.status === 'valid' ? '✓ Hợp lệ' : `✗ ${getStatusText(ticketInfo.originalStatus)}`}
              </span>
            </div>
            
            <div className="ticket-details">
              <div className="detail-row">
                <span className="label">Mã đặt vé:</span>
                <span className="value">{ticketInfo.bookingCode}</span>
              </div>
              <div className="detail-row">
                <span className="label">Họ và tên:</span>
                <span className="value">{ticketInfo.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phim:</span>
                <span className="value">{ticketInfo.movieTitle}</span>
              </div>
              <div className="detail-row">
                <span className="label">Rạp:</span>
                <span className="value cinema-highlight">{ticketInfo.cinemaName}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ngày chiếu:</span>
                <span className="value">{ticketInfo.date}</span>
              </div>
              <div className="detail-row">
                <span className="label">Suất chiếu:</span>
                <span className="value">{ticketInfo.showtime}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phòng:</span>
                <span className="value">{ticketInfo.hall}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ghế:</span>
                <span className="value">{ticketInfo.seats.join(', ')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Tổng vé:</span>
                <span className="value">{ticketInfo.totalTickets} vé</span>
              </div>
              <div className="detail-row total-row">
                <span className="label">Tổng tiền:</span>
                <span className="value price">{ticketInfo.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>

            <div className="ticket-actions">
              <button 
                onClick={handleCheckIn}
                disabled={isLoading || ticketInfo.status !== 'valid'}
                className="checkin-confirm-btn"
              >
                ✓ Xác Nhận Check-in
              </button>
              <button 
                onClick={handleReset}
                disabled={isLoading}
                className="checkin-cancel-btn"
              >
                ✗ Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketCheckIn;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCouch, FaTv, FaArrowLeft, FaClock } from 'react-icons/fa';
import seatService from '../services/seatService';
import showtimeService from '../services/showtimeService';
import cinemaHallService from '../services/cinemaHallService';
import './SeatSelection.css';

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  
  const [showtime, setShowtime] = useState(null);
  const [hallInfo, setHallInfo] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => `UUID-${Date.now()}-HOLD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [holdTimer, setHoldTimer] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    // Lấy email user nếu đã đăng nhập
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const user = JSON.parse(userStr);
        setUserEmail(user.email || null);
      }
    } catch (e) {
      console.error('Error getting user email:', e);
    }

    fetchShowtimeAndSeats();
    
    return () => {
      // Cleanup: release seats khi rời trang
      if (selectedSeats.length > 0) {
        releaseAllSeats();
      }
      if (holdTimer) {
        clearInterval(holdTimer);
      }
    };
  }, [showtimeId]);

  // Countdown timer
  useEffect(() => {
    if (selectedSeats.length > 0 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      // Gia hạn khi còn 60 giây
      if (timeLeft === 60) {
        extendSeatHold();
      }

      // Hết thời gian
      if (timeLeft === 0) {
        toast.error('Hết thời gian giữ ghế. Vui lòng chọn lại!');
        releaseAllSeats();
        setSelectedSeats([]);
      }

      return () => clearTimeout(timer);
    }
  }, [timeLeft, selectedSeats]);

  const fetchShowtimeAndSeats = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin suất chiếu
      const showtimeResponse = await showtimeService.getShowtimeById(showtimeId);
      if (showtimeResponse.success) {
        setShowtime(showtimeResponse.data);
        
        // Lấy thông tin phòng chiếu
        const hallResponse = await cinemaHallService.getHallById(showtimeResponse.data.hallId);
        if (hallResponse.success) {
          setHallInfo(hallResponse.data);
          console.log('Hall info:', hallResponse.data);
        }
      }

      // Lấy sơ đồ ghế
      const seatsResponse = await seatService.getSeatAvailability(showtimeId, sessionId);
      console.log('Seats response:', seatsResponse);
      if (seatsResponse && seatsResponse.seats) {
        setSeats(seatsResponse.seats);
        console.log('Loaded seats:', seatsResponse.seats.length);
      } else {
        toast.warning('Không có ghế nào trong phòng chiếu này');
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Không thể tải sơ đồ ghế');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat) => {
    console.log('=== Seat Clicked ===');
    console.log('Seat Object:', seat);
    console.log('Seat ID:', seat.seatId);
    console.log('Seat Position:', `${seat.seatRow}${seat.seatNumber}`);
    console.log('Seat Type:', seat.seatType);
    console.log('Seat Status:', seat.status);
    
    // Không cho chọn ghế đã bán hoặc đang giữ bởi người khác
    if (seat.status === 'SOLD' || seat.status === 'BOOKED') {
      toast.warning('Ghế này đã được đặt');
      return;
    }

    if (seat.status === 'HELD' && seat.sessionId !== sessionId) {
      toast.warning('Ghế này đang được giữ bởi người khác');
      return;
    }

    // Tối đa 10 ghế
    if (selectedSeats.length >= 10 && !selectedSeats.find(s => s.seatId === seat.seatId)) {
      toast.warning('Bạn chỉ có thể chọn tối đa 10 ghế');
      return;
    }

    const isSelected = selectedSeats.find(s => s.seatId === seat.seatId);

    if (isSelected) {
      // Bỏ chọn ghế
      try {
        console.log('🔓 Releasing seat:', seat.seatId);
        await seatService.releaseSeats(sessionId, parseInt(showtimeId), [seat.seatId]);
        setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
        
        // Cập nhật trạng thái ghế
        setSeats(seats.map(s => 
          s.seatId === seat.seatId ? { ...s, status: 'AVAILABLE' } : s
        ));
        
        toast.success(`Đã bỏ chọn ghế ${seat.seatRow}${seat.seatNumber}`);
      } catch (error) {
        console.error('❌ Error releasing seat:', error);
        toast.error('Không thể bỏ chọn ghế');
      }
    } else {
      // Chọn ghế - Hold TẤT CẢ ghế (đã chọn + ghế mới)
      try {
        const newSelectedSeats = [...selectedSeats, seat];
        const allSeatIds = newSelectedSeats.map(s => s.seatId);
        
        const holdRequest = {
          showtimeId: parseInt(showtimeId),
          seatIds: allSeatIds, // Hold ALL seats at once
          sessionId: sessionId,
          customerEmail: userEmail
        };
        
        console.log('🔒 === HOLD ALL SEATS REQUEST ===');
        console.log('Request Body:', JSON.stringify(holdRequest, null, 2));
        console.log(`Holding ${allSeatIds.length} seat(s) including new: ${seat.seatRow}${seat.seatNumber}`);
        
        const holdResponse = await seatService.holdSeats(holdRequest);
        
        console.log('✅ Hold Response:', holdResponse);
        toast.success(`Đã chọn ghế ${seat.seatRow}${seat.seatNumber}`);

        setSelectedSeats(newSelectedSeats);
        
        // Cập nhật trạng thái tất cả ghế
        setSeats(seats.map(s => 
          allSeatIds.includes(s.seatId) ? { ...s, status: 'HELD', sessionId } : s
        ));

        // Reset timer
        if (selectedSeats.length === 0) {
          setTimeLeft(300);
        }
      } catch (error) {
        console.error('❌ Error holding seats:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error(`Không thể giữ ghế ${seat.seatRow}${seat.seatNumber}: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const extendSeatHold = async () => {
    if (selectedSeats.length > 0) {
      try {
        const seatIds = selectedSeats.map(s => s.seatId);
        await seatService.extendHold(sessionId, parseInt(showtimeId), seatIds, 5);
        setTimeLeft(300); // Reset về 5 phút
      } catch (error) {
        console.error('Error extending hold:', error);
      }
    }
  };

  const releaseAllSeats = async () => {
    if (selectedSeats.length > 0) {
      try {
        const seatIds = selectedSeats.map(s => s.seatId);
        await seatService.releaseSeats(sessionId, parseInt(showtimeId), seatIds);
      } catch (error) {
        console.error('Error releasing seats:', error);
      }
    }
  };

  const getSeatTypeFromLayout = (row, number) => {
    if (!hallInfo || !hallInfo.seatLayout) return 'STANDARD';
    
    const seatKey = `${row}${number}`;
    const layout = hallInfo.seatLayout;
    
    // Kiểm tra ghế cụ thể
    if (layout[seatKey]) {
      return layout[seatKey];
    }
    
    // Kiểm tra theo hàng
    if (layout.VIP_Rows && layout.VIP_Rows.includes(row)) {
      return 'VIP';
    }
    if (layout.COUPLE_Rows && layout.COUPLE_Rows.includes(row)) {
      return 'COUPLE';
    }
    if (layout.WHEELCHAIR_Rows && layout.WHEELCHAIR_Rows.includes(row)) {
      return 'WHEELCHAIR';
    }
    
    return 'STANDARD';
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeats.find(s => s.seatId === seat.seatId);
    
    if (isSelected) return 'seat selected';
    if (seat.status === 'SOLD' || seat.status === 'BOOKED') return 'seat sold';
    if (seat.status === 'HELD' && seat.sessionId !== sessionId) return 'seat held';
    
    // Lấy loại ghế từ layout hoặc từ database
    const seatType = hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType;
    
    // Màu theo loại ghế
    switch (seatType) {
      case 'VIP':
        return 'seat vip';
      case 'COUPLE':
        return 'seat couple';
      case 'WHEELCHAIR':
        return 'seat wheelchair';
      case 'STANDARD':
      default:
        return 'seat available';
    }
  };

  const getSeatPrice = (seat) => {
    if (!showtime) return 0;
    
    const basePrice = showtime.basePrice || 0;
    const seatType = hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType;
    
    switch (seatType) {
      case 'VIP':
        return basePrice * 1.5;
      case 'COUPLE':
        return basePrice * 2;
      case 'WHEELCHAIR':
        return basePrice * 0.8; // Giảm giá cho người khuyết tật
      case 'STANDARD':
      default:
        return basePrice;
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isAisleAfterRow = (row) => {
    if (!hallInfo || !hallInfo.seatLayout || !hallInfo.seatLayout.aisles) return false;
    
    // Kiểm tra xem có lối đi sau hàng này không (ví dụ: "B-C" nghĩa là lối đi giữa B và C)
    return hallInfo.seatLayout.aisles.some(aisle => {
      const [beforeRow] = aisle.split('-');
      return beforeRow === row;
    });
  };

  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach(seat => {
      if (!grouped[seat.seatRow]) {
        grouped[seat.seatRow] = [];
      }
      grouped[seat.seatRow].push(seat);
    });
    
    // Sắp xếp theo số ghế
    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => a.seatNumber - b.seatNumber);
    });
    
    return grouped;
  };

  const copyRequestToClipboard = () => {
    const requestBody = {
      showtimeId: parseInt(showtimeId),
      seatIds: selectedSeats.map(s => s.seatId),
      sessionId: sessionId,
      customerEmail: userEmail
    };
    
    navigator.clipboard.writeText(JSON.stringify(requestBody, null, 2));
    toast.success('Đã copy request body vào clipboard!');
    console.log('📋 Request Body Copied:', requestBody);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một ghế');
      return;
    }

    console.log('🎬 Navigating to booking confirmation with data:', {
      selectedSeats: selectedSeats.map(s => ({ seatId: s.seatId, row: s.seatRow, number: s.seatNumber })),
      totalPrice: getTotalPrice(),
      sessionId,
      showtime
    });

    // Chuyển sang trang xác nhận booking
    navigate(`/booking-confirmation`, {
      state: {
        selectedSeats,
        totalPrice: getTotalPrice(),
        sessionId,
        showtime
      }
    });
  };

  if (loading) {
    return (
      <div className="seat-selection-loading">
        <div className="loading-spinner-box">
          <div className="spinner"></div>
          <span>Đang tải sơ đồ ghế...</span>
        </div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="seat-selection-error">
        <h2>Không tìm thấy suất chiếu</h2>
        <button onClick={() => navigate(-1)}>Quay lại</button>
      </div>
    );
  }

  const groupedSeats = groupSeatsByRow();
  const rows = Object.keys(groupedSeats).sort();

  return (
    <div className="seat-selection-page">
      <div className="seat-selection-header">
        {/* Cột trái: Nút quay lại + Rạp + Ngày giờ */}
        <div className="ss-header-left">
          <button className="ss-btn-back" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Quay lại
          </button>
          <div className="location-time">
            <p className="cinema-hall">{showtime.cinemaName} - {showtime.hallName}</p>
            <p className="show-datetime">{showtime.showDate} - {showtime.startTime?.substring(0, 5)}</p>
          </div>
        </div>

        {/* Cột giữa: Tên phim */}
        <div className="header-center">
          <h2 className="movie-title">{showtime.movieTitle}</h2>
        </div>

        {/* Cột phải: Thông tin phòng + Email */}
        <div className="header-right">
          {hallInfo && (
            <span className="hall-specs">
              {hallInfo.screenType && <span>🎬 {hallInfo.screenType}</span>}
              {hallInfo.soundSystem && <span>🔊 {hallInfo.soundSystem}</span>}
              {hallInfo.totalSeats && <span>💺 {hallInfo.totalSeats}</span>}
            </span>
          )}
          {userEmail && <span className="user-session">👤 {userEmail}</span>}
        </div>
      </div>

      <div className="seat-selection-container">
        <div className="seat-map-section">
          <div className="screen">
            <FaTv className="screen-icon" />
            <div className="screen-label">MÀN HÌNH</div>
          </div>

          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Ghế thường</span>
            </div>
            <div className="legend-item">
              <div className="seat vip"></div>
              <span>VIP (+50%)</span>
            </div>
            <div className="legend-item">
              <div className="seat couple"></div>
              <span>Couple (x2)</span>
            </div>
            <div className="legend-item">
              <div className="seat wheelchair"></div>
              <span>Wheelchair (-20%)</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Đang chọn</span>
            </div>
            <div className="legend-item">
              <div className="seat sold"></div>
              <span>Đã bán</span>
            </div>
            <div className="legend-item">
              <div className="seat held"></div>
              <span>Đang giữ</span>
            </div>
          </div>

          <div className="seat-map">
            {rows.map((row, index) => (
              <React.Fragment key={row}>
                <div className="seat-row">
                  <div className="row-label">{row}</div>
                  <div className="seats-container">
                    {groupedSeats[row].map(seat => {
                      const seatType = hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType;
                      return (
                        <button
                          key={seat.seatId}
                          className={getSeatClass(seat)}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.status === 'SOLD' || seat.status === 'BOOKED' || 
                                   (seat.status === 'HELD' && seat.sessionId !== sessionId)}
                          title={`${row}${seat.seatNumber} - ${seatType} - ${formatPrice(getSeatPrice(seat))}`}
                        >
                          <FaCouch />
                          <span className="seat-number">{seat.seatNumber}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="row-label">{row}</div>
                </div>
                {isAisleAfterRow(row) && (
                  <div className="aisle-separator">
                    <span className="aisle-label">Lối đi</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="booking-summary">
          {/* Timer countdown - luôn hiển thị */}
          <div className={`summary-timer ${timeLeft <= 60 ? 'warning' : ''}`}>
            <FaClock />
            <span className="timer-label">Thời gian giữ ghế:</span>
            <strong className="timer-value">{formatTime(timeLeft)}</strong>
          </div>
          
          <h3>Thông tin đặt vé</h3>
          
          <div className="summary-section">
            <h4>Ghế đã chọn ({selectedSeats.length})</h4>
            {selectedSeats.length === 0 ? (
              <p className="no-seats">Chưa chọn ghế nào</p>
            ) : (
              <div className="selected-seats-list">
                {selectedSeats.map(seat => {
                  const seatType = hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType;
                  return (
                    <div key={seat.seatId} className="selected-seat-item">
                      <span className="seat-label">
                        {seat.seatRow}{seat.seatNumber} 
                        <span className={`seat-type-badge ${seatType.toLowerCase()}`}>{seatType}</span>
                      </span>
                      <span className="seat-price">{formatPrice(getSeatPrice(seat))}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="summary-section">
            <div className="total-price">
              <span>Tổng cộng:</span>
              <strong>{formatPrice(getTotalPrice())}</strong>
            </div>
          </div>

          <button 
            className="btn-continue"
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
          >
            Tiếp tục
          </button>

          <div className="booking-notes">
            <p>• Vui lòng chọn ghế và tiến hành thanh toán trong vòng 5 phút</p>
            <p>• Ghế sẽ tự động được giải phóng nếu hết thời gian</p>
            <p>• Tối đa 10 ghế cho mỗi lần đặt</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;

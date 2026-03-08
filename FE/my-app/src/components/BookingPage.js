import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
import bookingService from '../services/bookingService';
import './BookingPage.css';

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookingInfo, setBookingInfo] = useState({
    cinema: '',
    movie: '',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(true);
  const [movieData, setMovieData] = useState(null);
  const [cinemaData, setCinemaData] = useState(null);
  const [showtimeData, setShowtimeData] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketTypes, setTicketTypes] = useState({
    adult: 0,
    student: 0,
    senior: 0
  });
  
  // Dropdown states
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  useEffect(() => {
    const cinema = searchParams.get('cinema');
    const movie = searchParams.get('movie');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    if (!cinema || !movie || !date || !time) {
      toast.error('Thông tin đặt vé không hợp lệ');
      navigate('/');
      return;
    }

    setBookingInfo({ cinema, movie, date, time });
    loadBookingData(cinema, movie, date, time);
    loadAvailableDates(cinema, movie);
  }, [searchParams, navigate]);

  const loadBookingData = async (cinemaId, movieId, showDate, showtimeId) => {
    try {
      setLoading(true);
      
      const movieResponse = await movieService.getMovieById(movieId);
      if (movieResponse.success) {
        setMovieData(movieResponse.data);
      }

      const cinemasResponse = await bookingService.getAllCinemas();
      if (cinemasResponse.success) {
        const cinema = cinemasResponse.data.find(c => c.cinemaId === parseInt(cinemaId));
        setCinemaData(cinema);
      }

      const showtimesResponse = await bookingService.getShowtimes(movieId, cinemaId, showDate);
      if (showtimesResponse.success) {
        const showtime = showtimesResponse.data.find(s => s.showtimeId === parseInt(showtimeId));
        setShowtimeData(showtime);
        setAvailableTimes(showtimesResponse.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading booking data:', error);
      toast.error('Không thể tải thông tin đặt vé');
      setLoading(false);
    }
  };

  const loadAvailableDates = async (cinemaId, movieId) => {
    try {
      const datesResponse = await bookingService.getAvailableDates(movieId, cinemaId);
      if (datesResponse.success) {
        setAvailableDates(datesResponse.data);
      }
    } catch (error) {
      console.error('Error loading dates:', error);
    }
  };

  const handleDateChange = async (newDate) => {
    setShowDateDropdown(false);
    setBookingInfo({ ...bookingInfo, date: newDate });
    
    // Load showtimes for new date
    const showtimesResponse = await bookingService.getShowtimes(bookingInfo.movie, bookingInfo.cinema, newDate);
    if (showtimesResponse.success && showtimesResponse.data.length > 0) {
      setAvailableTimes(showtimesResponse.data);
      const firstShowtime = showtimesResponse.data[0];
      setShowtimeData(firstShowtime);
      setBookingInfo(prev => ({ ...prev, date: newDate, time: firstShowtime.showtimeId }));
      
      // Update URL
      navigate(`/booking?cinema=${bookingInfo.cinema}&movie=${bookingInfo.movie}&date=${newDate}&time=${firstShowtime.showtimeId}`, { replace: true });
    }
  };

  const handleTimeChange = (newShowtime) => {
    setShowTimeDropdown(false);
    setShowtimeData(newShowtime);
    setBookingInfo(prev => ({ ...prev, time: newShowtime.showtimeId }));
    
    // Update URL
    navigate(`/booking?cinema=${bookingInfo.cinema}&movie=${bookingInfo.movie}&date=${bookingInfo.date}&time=${newShowtime.showtimeId}`, { replace: true });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Generate seat map (10 rows x 12 seats) with aisles support
  const generateSeats = () => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
    const seatsPerRow = 12;
    // Demo aisles configuration - should come from API's seatLayout
    // Example: ["C-D", "F-G"] means aisles after row C and after row F
    const aisles = ["C-D", "F-G"];
    const seats = [];
    
    rows.forEach(row => {
      const rowSeats = [];
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${row}${i}`;
        // Random sold seats for demo
        const isSold = Math.random() < 0.3;
        rowSeats.push({ id: seatId, row, number: i, isSold });
      }
      
      // Check if this row has an aisle after it
      const hasAisleAfter = aisles.some(aisle => {
        const [firstRow] = aisle.split('-');
        return row === firstRow;
      });
      
      seats.push({ row, seats: rowSeats, hasAisleAfter });
    });
    
    return seats;
  };

  const seatMap = generateSeats();

  const toggleSeat = (seatId, isSold) => {
    if (isSold) return;
    
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getTotalTickets = () => {
    return ticketTypes.adult + ticketTypes.student + ticketTypes.senior;
  };

  const getTotalPrice = () => {
    if (!showtimeData) return 0;
    const basePrice = showtimeData.basePrice;
    return (ticketTypes.adult * basePrice) + 
           (ticketTypes.student * basePrice * 0.8) + 
           (ticketTypes.senior * basePrice * 0.7);
  };

  const updateTicketType = (type, change) => {
    const newValue = Math.max(0, ticketTypes[type] + change);
    const totalTickets = getTotalTickets() - ticketTypes[type] + newValue;
    
    if (totalTickets <= selectedSeats.length || change < 0) {
      setTicketTypes({ ...ticketTypes, [type]: newValue });
    }
  };

  if (loading) {
    return (
      <div className="booking-page">
        <div className="container">
          <h1>Đang tải...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* Movie Banner */}
      {movieData && (
        <div className="movie-banner">
          <div className="banner-background" style={{ backgroundImage: `url(${movieData.backdropUrl || movieData.posterUrl})` }}>
            <div className="banner-overlay"></div>
          </div>
          <div className="container">
            <div className="banner-content">
              <div className="movie-poster-container">
                <img src={movieData.posterUrl} alt={movieData.title} className="banner-poster" />
                <div className="age-rating">{movieData.ageRating}</div>
              </div>
              <div className="movie-info-detail">
                <h1 className="movie-title-large">{movieData.title}</h1>
                
                <div className="movie-meta-items">
                  <div className="meta-item-banner">
                    <span className="meta-icon">🎭</span>
                    <span>{movieData.genres?.map(g => g.genreName).join(', ') || 'Tâm Lý'}</span>
                  </div>
                  <div className="meta-item-banner">
                    <span className="meta-icon">⏱</span>
                    <span>{movieData.durationMinutes || 135}'</span>
                  </div>
                  <div className="meta-item-banner">
                    <span className="meta-icon">🌍</span>
                    <span>{movieData.country || 'Việt Nam'}</span>
                  </div>
                  <div className="meta-item-banner">
                    <span className="meta-icon">💬</span>
                    <span>{movieData.language || 'VN'}</span>
                  </div>
                </div>

                <div className="rating-badge">
                  {movieData.ageRating}: Phim dành cho khán giá từ {movieData.ageRating === 'T16' ? '16' : movieData.ageRating === 'T18' ? '18' : '13'} tuổi trở lên ({movieData.ageRating}+)
                </div>

                <div className="movie-credits">
                  <div className="credit-item">
                    <strong>Đạo diễn:</strong> {movieData.director || 'Lê Nhật Quang'}
                  </div>
                  <div className="credit-item">
                    <strong>Diễn viên:</strong> {movieData.cast || 'Liên Bỉnh Phát, Đỗ Thị Hải Yến, Trần Thế Mạnh'}
                  </div>
                  <div className="credit-item">
                    <strong>Khởi chiếu:</strong> {movieData.releaseDate ? formatDate(movieData.releaseDate) : 'Thứ Sáu, 28/11/2025'}
                  </div>
                </div>

                {movieData.synopsis && (
                  <>
                    <h3 className="section-title">NỘI DUNG PHIM</h3>
                    <p className="movie-synopsis">{movieData.synopsis.substring(0, 300)}...</p>
                  </>
                )}

                {movieData.trailerUrl && (
                  <button className="btn-trailer" onClick={() => window.open(movieData.trailerUrl, '_blank')}>
                    ▶ Xem Trailer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">        
        <div className="booking-info-card">
          <h2>Lịch Chiếu</h2>
          <div className="schedule-info">
            <div className="schedule-item clickable" onClick={() => setShowDateDropdown(!showDateDropdown)}>
              <span className="schedule-label">Ngày chiếu:</span>
              <span className="schedule-value">{bookingInfo.date ? formatDate(bookingInfo.date) : 'Đang tải...'} ▼</span>
              {showDateDropdown && availableDates.length > 0 && (
                <div className="dropdown-menu">
                  {availableDates.map((date) => (
                    <div 
                      key={date} 
                      className={`dropdown-item ${date === bookingInfo.date ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDateChange(date);
                      }}
                    >
                      {formatDate(date)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="schedule-item clickable" onClick={() => setShowTimeDropdown(!showTimeDropdown)}>
              <span className="schedule-label">Giờ chiếu:</span>
              <span className="schedule-value">{showtimeData?.startTime ? showtimeData.startTime.substring(0, 5) : 'Đang tải...'} ▼</span>
              {showTimeDropdown && availableTimes.length > 0 && (
                <div className="dropdown-menu">
                  {availableTimes.map((showtime) => (
                    <div 
                      key={showtime.showtimeId} 
                      className={`dropdown-item ${showtime.showtimeId === showtimeData?.showtimeId ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimeChange(showtime);
                      }}
                    >
                      {showtime.startTime.substring(0, 5)} - {showtime.hallName} ({showtime.availableSeats} ghế trống)
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="schedule-item">
              <span className="schedule-label">Phòng chiếu:</span>
              <span className="schedule-value">{showtimeData?.hallName || 'Đang tải...'}</span>
            </div>
            <div className="schedule-item">
              <span className="schedule-label">Định dạng:</span>
              <span className="schedule-value">{showtimeData?.formatType || 'Đang tải...'}</span>
            </div>
          </div>
        </div>

        {/* Ticket Type Selection */}
        <div className="booking-info-card">
          <h2>Chọn Loại Vé</h2>
          <div className="ticket-types">
            <div className="ticket-type-item">
              <div className="ticket-type-header">
                <span className="ticket-type-name">NGƯỜI LỚN</span>
                <span className="ticket-type-price">{showtimeData ? formatPrice(showtimeData.basePrice) : '0 ₫'}</span>
              </div>
              <div className="ticket-type-controls">
                <button onClick={() => updateTicketType('adult', -1)} disabled={ticketTypes.adult === 0}>−</button>
                <span>{ticketTypes.adult}</span>
                <button onClick={() => updateTicketType('adult', 1)}>+</button>
              </div>
            </div>
            
            <div className="ticket-type-item">
              <div className="ticket-type-header">
                <span className="ticket-type-name">HSSV-UBND</span>
                <span className="ticket-type-price">{showtimeData ? formatPrice(showtimeData.basePrice * 0.8) : '0 ₫'}</span>
              </div>
              <div className="ticket-type-controls">
                <button onClick={() => updateTicketType('student', -1)} disabled={ticketTypes.student === 0}>−</button>
                <span>{ticketTypes.student}</span>
                <button onClick={() => updateTicketType('student', 1)}>+</button>
              </div>
            </div>

            <div className="ticket-type-item">
              <div className="ticket-type-header">
                <span className="ticket-type-name">NGƯỜI CAO TUỔI</span>
                <span className="ticket-type-price">{showtimeData ? formatPrice(showtimeData.basePrice * 0.7) : '0 ₫'}</span>
              </div>
              <div className="ticket-type-controls">
                <button onClick={() => updateTicketType('senior', -1)} disabled={ticketTypes.senior === 0}>−</button>
                <span>{ticketTypes.senior}</span>
                <button onClick={() => updateTicketType('senior', 1)}>+</button>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Selection */}
        <div className="booking-info-card">
          <h2>Chọn Ghế - Rạp 02</h2>
          <div className="seat-selection">
            <div className="screen-wrapper">
              <div className="screen">Màn hình</div>
            </div>
            
            <div className="seat-map">
              {seatMap.map(({ row, seats, hasAisleAfter }) => (
                <div key={row} className={`seat-row ${hasAisleAfter ? 'with-aisle-after' : ''}`}>
                  <span className="row-label">{row}</span>
                  <div className="seats-container">
                    {seats.map(seat => (
                      <button
                        key={seat.id}
                        className={`seat ${seat.isSold ? 'sold' : ''} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                        onClick={() => toggleSeat(seat.id, seat.isSold)}
                        disabled={seat.isSold}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-box available"></div>
                <span>Ghế Trống</span>
              </div>
              <div className="legend-item">
                <div className="legend-box selected"></div>
                <span>Ghế Đã Chọn (Người)</span>
              </div>
              <div className="legend-item">
                <div className="legend-box sold"></div>
                <span>Ghế đã bán</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="booking-info-card payment-summary">
          <div className="summary-row">
            <span>Ghế đã chọn:</span>
            <span className="summary-value">{selectedSeats.join(', ') || 'Chưa chọn ghế'}</span>
          </div>
          <div className="summary-row">
            <span>Số lượng vé:</span>
            <span className="summary-value">{getTotalTickets()} vé</span>
          </div>
          <div className="summary-row total">
            <span>TỔNG CỘNG:</span>
            <span className="total-price">{formatPrice(getTotalPrice())}</span>
          </div>
        </div>

        <div className="booking-actions">
          <button className="btn-back" onClick={() => navigate('/')}>
            ← Quay lại
          </button>
          <button 
            className="btn-continue" 
            onClick={() => {
              if (getTotalTickets() === 0) {
                toast.error('Vui lòng chọn loại vé!');
              } else if (selectedSeats.length !== getTotalTickets()) {
                toast.error(`Vui lòng chọn ${getTotalTickets()} ghế!`);
              } else {
                toast.success(`Đặt vé thành công! Ghế: ${selectedSeats.join(', ')} - Tổng: ${formatPrice(getTotalPrice())}`);
              }
            }}
            disabled={getTotalTickets() === 0 || selectedSeats.length !== getTotalTickets()}
          >
            Thanh toán {formatPrice(getTotalPrice())} →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;

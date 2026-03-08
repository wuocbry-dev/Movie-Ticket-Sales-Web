import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';
import './QuickBookingModal.css';

const QuickBookingModal = ({ isOpen, onClose, initialStep = 1 }) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [selectedMovie, setSelectedMovie] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  
  const [loading, setLoading] = useState({
    cinemas: false,
    movies: false,
    dates: false,
    times: false
  });

  // Mock data cho rạp chiếu
  const mockCinemas = [
    { id: 1, name: 'CGV Vincom Center', location: 'Hà Nội', address: 'Bà Triệu' },
    { id: 2, name: 'CGV Aeon Long Biên', location: 'Hà Nội', address: 'Long Biên' },
    { id: 3, name: 'CGV Paragon', location: 'Hồ Chí Minh', address: 'Quận 1' },
    { id: 4, name: 'Galaxy Nguyễn Du', location: 'Hà Nội', address: 'Hai Bà Trưng' },
    { id: 5, name: 'Lotte Cinema Landmark', location: 'Hồ Chí Minh', address: 'Bình Thạnh' }
  ];

  // Mock data cho phim
  const mockMovies = [
    { id: 1, title: 'Godzilla Minus One', genre: 'Hành động', duration: '125 phút', ageRating: 'T16' },
    { id: 2, title: 'Trái Tim Quỷ Dữ', genre: 'Kinh dị', duration: '110 phút', ageRating: 'T18' },
    { id: 3, title: 'Cậu Thứ 13', genre: 'Hài kịch', duration: '98 phút', ageRating: 'P' },
    { id: 4, title: 'Oppenheimer', genre: 'Tiểu sử', duration: '180 phút', ageRating: 'T16' },
    { id: 5, title: 'Barbie', genre: 'Phiêu lưu', duration: '114 phút', ageRating: 'K' }
  ];

  // Reset khi mở modal
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(initialStep);
      loadCinemas();
      // Reset selections nếu cần
      if (initialStep === 1) {
        setSelectedCinema('');
        setSelectedMovie('');
        setSelectedDate('');
        setSelectedTime('');
      }
    }
  }, [isOpen, initialStep]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadCinemas = async () => {
    setLoading(prev => ({ ...prev, cinemas: true }));
    try {
      setTimeout(() => {
        setCinemas(mockCinemas);
        setLoading(prev => ({ ...prev, cinemas: false }));
      }, 300);
    } catch (error) {
      console.error('Error loading cinemas:', error);
      toast.error('Không thể tải danh sách rạp');
      setLoading(prev => ({ ...prev, cinemas: false }));
    }
  };

  const loadMovies = async (cinemaId) => {
    setLoading(prev => ({ ...prev, movies: true }));
    try {
      setTimeout(() => {
        setMovies(mockMovies);
        setLoading(prev => ({ ...prev, movies: false }));
      }, 300);
    } catch (error) {
      console.error('Error loading movies:', error);
      toast.error('Không thể tải danh sách phim');
      setLoading(prev => ({ ...prev, movies: false }));
    }
  };

  const loadAvailableDates = async (cinemaId, movieId) => {
    setLoading(prev => ({ ...prev, dates: true }));
    try {
      const dates = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        dates.push({
          value: date.toISOString().split('T')[0],
          label: formatDate(date),
          dayOfWeek: getDayOfWeek(date),
          fullDate: date
        });
      }
      
      setTimeout(() => {
        setAvailableDates(dates);
        setLoading(prev => ({ ...prev, dates: false }));
      }, 300);
    } catch (error) {
      console.error('Error loading dates:', error);
      toast.error('Không thể tải danh sách ngày chiếu');
      setLoading(prev => ({ ...prev, dates: false }));
    }
  };

  const loadAvailableTimes = async (cinemaId, movieId, date) => {
    setLoading(prev => ({ ...prev, times: true }));
    try {
      const times = [
        { id: 1, time: '09:00', available: true, roomName: 'Phòng 1', format: '2D' },
        { id: 2, time: '11:30', available: true, roomName: 'Phòng 2', format: '3D' },
        { id: 3, time: '14:00', available: true, roomName: 'Phòng 1', format: '2D' },
        { id: 4, time: '16:30', available: false, roomName: 'Phòng 3', format: 'IMAX' },
        { id: 5, time: '19:00', available: true, roomName: 'Phòng 2', format: '2D' },
        { id: 6, time: '21:30', available: true, roomName: 'Phòng 1', format: '3D' }
      ];
      
      setTimeout(() => {
        setAvailableTimes(times);
        setLoading(prev => ({ ...prev, times: false }));
      }, 300);
    } catch (error) {
      console.error('Error loading times:', error);
      toast.error('Không thể tải danh sách giờ chiếu');
      setLoading(prev => ({ ...prev, times: false }));
    }
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const getDayOfWeek = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    return days[date.getDay()];
  };

  const handleCinemaSelect = (cinemaId) => {
    setSelectedCinema(cinemaId);
    setSelectedMovie('');
    setSelectedDate('');
    setSelectedTime('');
    loadMovies(cinemaId);
  };

  const handleMovieSelect = (movieId) => {
    setSelectedMovie(movieId);
    setSelectedDate('');
    setSelectedTime('');
    loadAvailableDates(selectedCinema, movieId);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    loadAvailableTimes(selectedCinema, selectedMovie, date);
  };

  const handleTimeSelect = (timeId) => {
    setSelectedTime(timeId);
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !selectedCinema) {
      toast.warning('Vui lòng chọn rạp chiếu');
      return;
    }
    if (currentStep === 2 && !selectedMovie) {
      toast.warning('Vui lòng chọn phim');
      return;
    }
    if (currentStep === 3 && !selectedDate) {
      toast.warning('Vui lòng chọn ngày chiếu');
      return;
    }
    if (currentStep === 4 && !selectedTime) {
      toast.warning('Vui lòng chọn giờ chiếu');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleBookTicket = () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      toast.warning('Vui lòng chọn đầy đủ thông tin để đặt vé');
      return;
    }

    toast.success('Chuyển đến trang đặt vé...');
    const bookingUrl = `/booking?cinema=${selectedCinema}&movie=${selectedMovie}&date=${selectedDate}&time=${selectedTime}`;
    onClose();
    navigate(bookingUrl);
  };

  const getSelectedCinemaName = () => {
    const cinema = cinemas.find(c => c.id === parseInt(selectedCinema));
    return cinema ? `${cinema.name} - ${cinema.location}` : '';
  };

  const getSelectedMovieName = () => {
    const movie = movies.find(m => m.id === parseInt(selectedMovie));
    return movie ? movie.title : '';
  };

  if (!isOpen) return null;

  return (
    <div className="qbm-modal-overlay">
      <div className="qbm-modal-content">
        <button className="qbm-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="qbm-modal-header">
          <h2>ĐẶT VÉ NHANH</h2>
          <div className="qbm-step-indicators">
            {[1, 2, 3, 4].map(step => (
              <div 
                key={step} 
                className={`qbm-step-indicator ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="qbm-modal-body">
          {/* Bước 1: Chọn Rạp */}
          {currentStep === 1 && (
            <div className="qbm-booking-step-content">
              <h3>Bước 1: Chọn Rạp Chiếu</h3>
              {loading.cinemas ? (
                <div className="qbm-loading-spinner">Đang tải danh sách rạp...</div>
              ) : (
                <div className="qbm-cinema-grid">
                  {cinemas.map(cinema => (
                    <div
                      key={cinema.id}
                      className={`qbm-cinema-card ${selectedCinema === cinema.id ? 'selected' : ''}`}
                      onClick={() => handleCinemaSelect(cinema.id)}
                    >
                      <div className="qbm-cinema-name">{cinema.name}</div>
                      <div className="qbm-cinema-location">{cinema.location}</div>
                      <div className="qbm-cinema-address">{cinema.address}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bước 2: Chọn Phim */}
          {currentStep === 2 && (
            <div className="qbm-booking-step-content">
              <h3>Bước 2: Chọn Phim</h3>
              <div className="qbm-selected-info">
                <span className="qbm-info-label">Rạp đã chọn:</span>
                <span className="qbm-info-value">{getSelectedCinemaName()}</span>
              </div>
              {loading.movies ? (
                <div className="qbm-loading-spinner">Đang tải danh sách phim...</div>
              ) : (
                <div className="qbm-movie-grid">
                  {movies.map(movie => (
                    <div
                      key={movie.id}
                      className={`qbm-movie-card ${selectedMovie === movie.id ? 'selected' : ''}`}
                      onClick={() => handleMovieSelect(movie.id)}
                    >
                      <div className="qbm-movie-age-rating">{movie.ageRating}</div>
                      <div className="qbm-movie-title">{movie.title}</div>
                      <div className="qbm-movie-details">
                        <span>{movie.genre}</span> • <span>{movie.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bước 3: Chọn Ngày */}
          {currentStep === 3 && (
            <div className="qbm-booking-step-content">
              <h3>Bước 3: Chọn Ngày Chiếu</h3>
              <div className="qbm-selected-info">
                <span className="qbm-info-label">Phim đã chọn:</span>
                <span className="qbm-info-value">{getSelectedMovieName()}</span>
              </div>
              {loading.dates ? (
                <div className="qbm-loading-spinner">Đang tải lịch chiếu...</div>
              ) : (
                <div className="qbm-date-grid">
                  {availableDates.map(date => (
                    <div
                      key={date.value}
                      className={`qbm-date-card ${selectedDate === date.value ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(date.value)}
                    >
                      <div className="qbm-date-day">{date.dayOfWeek}</div>
                      <div className="qbm-date-number">{date.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bước 4: Chọn Giờ */}
          {currentStep === 4 && (
            <div className="qbm-booking-step-content">
              <h3>Bước 4: Chọn Giờ Chiếu</h3>
              <div className="qbm-selected-info">
                <span className="qbm-info-label">Ngày đã chọn:</span>
                <span className="qbm-info-value">{selectedDate}</span>
              </div>
              {loading.times ? (
                <div className="qbm-loading-spinner">Đang tải suất chiếu...</div>
              ) : (
                <div className="qbm-time-grid">
                  {availableTimes.map(time => (
                    <div
                      key={time.id}
                      className={`qbm-time-card ${selectedTime === time.id ? 'selected' : ''} ${!time.available ? 'disabled' : ''}`}
                      onClick={() => time.available && handleTimeSelect(time.id)}
                    >
                      <div className="qbm-time-value">{time.time}</div>
                      <div className="qbm-time-room">{time.roomName}</div>
                      <div className="qbm-time-format">{time.format}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="qbm-modal-footer">
          <button 
            className="qbm-btn-prev" 
            onClick={handlePrevStep}
            disabled={currentStep === 1}
          >
            Quay lại
          </button>
          {currentStep < 4 ? (
            <button className="qbm-btn-next" onClick={handleNextStep}>
              Tiếp tục
            </button>
          ) : (
            <button className="qbm-btn-book" onClick={handleBookTicket}>
              Đặt Vé Ngay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickBookingModal;

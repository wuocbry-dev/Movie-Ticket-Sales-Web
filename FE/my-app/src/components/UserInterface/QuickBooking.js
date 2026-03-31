import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaFilm, FaCalendarAlt, FaClock } from 'react-icons/fa';
import './QuickBooking.css';

const QuickBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Data states
  const [cinemaChains, setCinemaChains] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  
  // Selected values
  const [selectedChain, setSelectedChain] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

  // Fetch cinema chains on mount
  useEffect(() => {
    fetchCinemaChains();
    generateDates();
  }, []);

  // Fetch cinemas when chain is selected
  useEffect(() => {
    if (selectedChain) {
      fetchCinemas(selectedChain.chainId);
    }
  }, [selectedChain]);

  // Fetch movies when cinema is selected
  useEffect(() => {
    if (selectedCinema) {
      fetchMovies();
    }
  }, [selectedCinema]);

  // Fetch showtimes when movie and date are selected
  useEffect(() => {
    if (selectedMovie && selectedDate && selectedCinema) {
      fetchShowtimes();
    }
  }, [selectedMovie, selectedDate, selectedCinema]);

  const fetchCinemaChains = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains`);
      const result = await response.json();
      if (result.success && result.data && result.data.data) {
        setCinemaChains(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching cinema chains:', error);
    }
  };

  const fetchCinemas = async (chainId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/chain/${chainId}?page=0&size=100`);
      const result = await response.json();
      if (result.success && result.data && result.data.data) {
        setCinemas(result.data.data);
      }
    } catch (error) {
      console.error('Error fetching cinemas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/movies?status=NOW_SHOWING&page=0&size=100`);
      const result = await response.json();
      if (result.success && result.data && result.data.content) {
        setMovies(result.data.content);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDates = () => {
    const datesArray = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      // Format ngày theo local timezone (YYYY-MM-DD)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      
      datesArray.push({
        value: dateValue,
        label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : formatDate(date),
        day: date.toLocaleDateString('vi-VN', { weekday: 'short' })
      });
    }
    
    setDates(datesArray);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/movie/${selectedMovie.movieId}`);
      const result = await response.json();
      console.log('Showtimes API response:', result);
      console.log('Selected date:', selectedDate);
      console.log('Selected cinema:', selectedCinema.cinemaId);
      if (result.success && result.data) {
        // Filter by selected date AND cinema (show all halls in that cinema)
        const filtered = result.data.filter(showtime => {
          // Normalize both dates to YYYY-MM-DD format
          const showtimeDate = showtime.showDate.split('T')[0]; // Remove time part if exists
          console.log('Comparing:', showtimeDate, '===', selectedDate, '&&', showtime.cinemaId, '===', selectedCinema.cinemaId);
          return showtimeDate === selectedDate && showtime.cinemaId === selectedCinema.cinemaId;
        });
        // Sort by hall and start time
        filtered.sort((a, b) => {
          if (a.hallId !== b.hallId) {
            return a.hallId - b.hallId;
          }
          return a.startTime.localeCompare(b.startTime);
        });
        console.log('Filtered showtimes (all halls in cinema):', filtered);
        setShowtimes(filtered);
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChainSelect = (chain) => {
    setSelectedChain(chain);
    setSelectedCinema(null);
    setSelectedMovie(null);
    setSelectedDate(null);
    setSelectedShowtime(null);
    setStep(1);
  };

  const handleCinemaSelect = (cinema) => {
    setSelectedCinema(cinema);
    setSelectedMovie(null);
    setSelectedDate(null);
    setSelectedShowtime(null);
    setStep(2);
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setSelectedDate(null);
    setSelectedShowtime(null);
    setStep(3);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedShowtime(null);
    setStep(4);
  };

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime);
    // Navigate to booking page
    navigate(`/booking/${showtime.showtimeId}`);
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Chọn Rạp', icon: FaMapMarkerAlt },
      { number: 2, label: 'Chọn Phim', icon: FaFilm },
      { number: 3, label: 'Chọn Ngày', icon: FaCalendarAlt },
      { number: 4, label: 'Chọn Giờ', icon: FaClock }
    ];

    return (
      <div className="step-indicator">
        {steps.map((s, index) => (
          <React.Fragment key={s.number}>
            <div className={`step ${step >= s.number ? 'active' : ''} ${step > s.number ? 'completed' : ''}`}>
              <div className="step-number">
                <s.icon />
              </div>
              <span className="step-label">{s.label}</span>
            </div>
            {index < steps.length - 1 && <div className="step-line"></div>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Collapsed Button */}
      {!isExpanded && (
        <div className="quick-booking-trigger">
          <button className="quick-booking-btn" onClick={() => setIsExpanded(true)}>
            ĐẶT VÉ NHANH
          </button>
        </div>
      )}

      {/* Expanded Modal */}
      {isExpanded && (
        <>
          <div className="quick-booking-overlay" onClick={() => setIsExpanded(false)}></div>
          <div className={`quick-booking-modal ${selectedCinema || selectedMovie || selectedDate ? 'expanded' : ''}`}>
            <div className="quick-booking-header-bar">
              <h2 className="quick-booking-title">ĐẶT VÉ NHANH</h2>
              <button className="quick-booking-close" onClick={() => setIsExpanded(false)}>×</button>
            </div>

            <div className="quick-booking-content">
        {/* Step 1: Select Cinema Chain & Cinema */}
        <div className="booking-step">
          <label><FaMapMarkerAlt /> Chọn Rạp</label>
          <select 
            value={selectedChain?.chainId || ''} 
            onChange={(e) => {
              const chain = cinemaChains.find(c => c.chainId === parseInt(e.target.value));
              handleChainSelect(chain);
            }}
            className="booking-select"
          >
            <option value="">Chọn chuỗi rạp</option>
            {cinemaChains.map(chain => (
              <option key={chain.chainId} value={chain.chainId}>
                {chain.chainName}
              </option>
            ))}
          </select>

          {selectedChain && cinemas.length > 0 && (
            <select
              value={selectedCinema?.cinemaId || ''}
              onChange={(e) => {
                const cinema = cinemas.find(c => c.cinemaId === parseInt(e.target.value));
                handleCinemaSelect(cinema);
              }}
              className="booking-select"
            >
              <option value="">Chọn rạp</option>
              {cinemas.map(cinema => (
                <option key={cinema.cinemaId} value={cinema.cinemaId}>
                  {cinema.cinemaName}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: Select Movie */}
        <div className={`booking-step ${!selectedCinema ? 'disabled' : ''}`}>
          <label><FaFilm /> Chọn Phim</label>
          {!selectedCinema ? (
            <div className="no-data">Vui lòng chọn rạp trước</div>
          ) : loading ? (
            <div className="loading">Đang tải...</div>
          ) : movies.length === 0 ? (
            <div className="no-data">Không có phim</div>
          ) : (
            <div className="movie-grid">
              {movies.map(movie => (
                <div
                  key={movie.movieId}
                  className={`movie-card ${selectedMovie?.movieId === movie.movieId ? 'selected' : ''}`}
                  onClick={() => handleMovieSelect(movie)}
                >
                  <img src={movie.posterUrl} alt={movie.title} />
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Select Date */}
        <div className={`booking-step ${!selectedMovie ? 'disabled' : ''}`}>
          <label><FaCalendarAlt /> Chọn Ngày</label>
          {!selectedMovie ? (
            <div className="no-data">Vui lòng chọn phim trước</div>
          ) : (
            <div className="date-grid">
              {dates.map(date => (
                <button
                  key={date.value}
                  className={`date-btn ${selectedDate === date.value ? 'selected' : ''}`}
                  onClick={() => handleDateSelect(date.value)}
                >
                  <span className="date-label">{date.label}</span>
                </button>
              ))}
            </div>
          )
        }
        </div>

        {/* Step 4: Select Showtime */}
        <div className={`booking-step ${!selectedDate ? 'disabled' : ''}`}>
          <label><FaClock /> Chọn Giờ</label>
          {!selectedDate ? (
            <div className="no-data">Vui lòng chọn ngày trước</div>
          ) : loading ? (
            <div className="loading">Đang tải...</div>
          ) : showtimes.length === 0 ? (
            <div className="no-data">Không có suất chiếu</div>
          ) : (
            <div className="showtime-grid">
              {showtimes.map(showtime => (
                <button
                  key={showtime.showtimeId}
                  className="showtime-btn"
                  onClick={() => handleShowtimeSelect(showtime)}
                >
                  <div className="showtime-time">{showtime.startTime.substring(0, 5)}</div>
                  <div className="showtime-info">
                    <span className="showtime-cinema">{showtime.cinemaName}</span>
                    <span className="showtime-hall">{showtime.hallName}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default QuickBooking;

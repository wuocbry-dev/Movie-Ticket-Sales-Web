import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaFilm, FaCalendarAlt, FaClock, FaChevronDown } from 'react-icons/fa';
import './QuickBookingMini.css';

const QuickBookingMini = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const cinemaListRef = useRef(null);
  
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

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

  // Auto scroll to cinema list when cinemas are loaded
  useEffect(() => {
    if (cinemas.length > 0 && cinemaListRef.current && activeDropdown === 'cinema') {
      cinemaListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [cinemas, activeDropdown]);

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
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateValue = `${year}-${month}-${day}`;
      
      datesArray.push({
        value: dateValue,
        label: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `${day}-${month}`,
        day: date.toLocaleDateString('vi-VN', { weekday: 'short' })
      });
    }
    
    setDates(datesArray);
  };

  const fetchShowtimes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/movie/${selectedMovie.movieId}`);
      const result = await response.json();
      if (result.success && result.data) {
        const filtered = result.data.filter(showtime => {
          const showtimeDate = showtime.showDate.split('T')[0];
          return showtimeDate === selectedDate && showtime.cinemaId === selectedCinema.cinemaId;
        });
        filtered.sort((a, b) => {
          if (a.hallId !== b.hallId) return a.hallId - b.hallId;
          return a.startTime.localeCompare(b.startTime);
        });
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
    setCinemas([]);
    setMovies([]);
    setShowtimes([]);
  };

  const handleCinemaSelect = (cinema) => {
    setSelectedCinema(cinema);
    setSelectedMovie(null);
    setSelectedDate(null);
    setSelectedShowtime(null);
    setSelectedShowtime(null);
    setShowtimes([]);
    setActiveDropdown(null);
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setSelectedDate(null);
    setSelectedShowtime(null);
    setShowtimes([]);
    setActiveDropdown(null);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedShowtime(null);
    setActiveDropdown(null);
  };

  const handleShowtimeSelect = (showtime) => {
    setSelectedShowtime(showtime);
    setActiveDropdown(null);
  };

  const handleBookNow = () => {
    if (selectedShowtime) {
      setIsExpanded(false);
      navigate(`/booking/${selectedShowtime.showtimeId}`);
    }
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeModal = () => {
    setIsExpanded(false);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Trigger Button */}
      {!isExpanded && (
        <button className="qbm-trigger" onClick={() => setIsExpanded(true)}>
          ĐẶT VÉ NHANH
        </button>
      )}

      {/* Modal */}
      {isExpanded && (
        <div className="qbm-overlay" onClick={closeModal}>
          <div className="qbm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="qbm-header">
              <h2>ĐẶT VÉ NHANH</h2>
              <button className="qbm-close" onClick={closeModal}>×</button>
            </div>

            <div className="qbm-content">
              {/* Step 1: Cinema */}
              <div className="qbm-step">
                <div 
                  className={`qbm-selector ${activeDropdown === 'cinema' ? 'active' : ''}`}
                  onClick={() => toggleDropdown('cinema')}
                >
                  <FaMapMarkerAlt className="qbm-icon" />
                  <span className="qbm-value">
                    {selectedCinema 
                      ? `${selectedChain?.chainName} - ${selectedCinema.cinemaName}` 
                      : 'Chọn Rạp'}
                  </span>
                  <FaChevronDown className={`qbm-chevron ${activeDropdown === 'cinema' ? 'rotated' : ''}`} />
                </div>
                {activeDropdown === 'cinema' && (
                  <div className="qbm-dropdown">
                    <div className="qbm-dropdown-section">
                      <div className="qbm-dropdown-label">Chuỗi rạp</div>
                      {cinemaChains.map(chain => (
                        <div 
                          key={chain.chainId}
                          className={`qbm-dropdown-item ${selectedChain?.chainId === chain.chainId ? 'selected' : ''}`}
                          onClick={() => handleChainSelect(chain)}
                        >
                          {chain.chainName}
                        </div>
                      ))}
                    </div>
                    {selectedChain && cinemas.length > 0 && (
                      <div className="qbm-dropdown-section" ref={cinemaListRef}>
                        <div className="qbm-dropdown-label">Chọn rạp</div>
                        {cinemas.map(cinema => (
                          <div 
                            key={cinema.cinemaId}
                            className={`qbm-dropdown-item ${selectedCinema?.cinemaId === cinema.cinemaId ? 'selected' : ''}`}
                            onClick={() => handleCinemaSelect(cinema)}
                          >
                            {cinema.cinemaName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: Movie */}
              <div className={`qbm-step ${!selectedCinema ? 'disabled' : ''}`}>
                <div 
                  className={`qbm-selector ${activeDropdown === 'movie' ? 'active' : ''}`}
                  onClick={() => selectedCinema && toggleDropdown('movie')}
                >
                  <FaFilm className="qbm-icon" />
                  <span className="qbm-value">
                    {selectedMovie ? selectedMovie.title : 'Chọn Phim'}
                  </span>
                  <FaChevronDown className={`qbm-chevron ${activeDropdown === 'movie' ? 'rotated' : ''}`} />
                </div>
                {activeDropdown === 'movie' && (
                  <div className="qbm-dropdown">
                    {loading ? (
                      <div className="qbm-dropdown-loading">
                        <div className="spinner spinner-small"></div>
                        <span>Đang tải...</span>
                      </div>
                    ) : movies.length === 0 ? (
                      <div className="qbm-dropdown-empty">Không có phim</div>
                    ) : (
                      movies.map(movie => (
                        <div 
                          key={movie.movieId}
                          className={`qbm-dropdown-item ${selectedMovie?.movieId === movie.movieId ? 'selected' : ''}`}
                          onClick={() => handleMovieSelect(movie)}
                        >
                          <span>{movie.title}</span>
                          <span className="qbm-item-sub">{movie.durationMinutes} phút</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Step 3: Date */}
              <div className={`qbm-step ${!selectedMovie ? 'disabled' : ''}`}>
                <div 
                  className={`qbm-selector ${activeDropdown === 'date' ? 'active' : ''}`}
                  onClick={() => selectedMovie && toggleDropdown('date')}
                >
                  <FaCalendarAlt className="qbm-icon" />
                  <span className="qbm-value">
                    {selectedDate 
                      ? dates.find(d => d.value === selectedDate)?.label 
                      : 'Chọn Ngày'}
                  </span>
                  <FaChevronDown className={`qbm-chevron ${activeDropdown === 'date' ? 'rotated' : ''}`} />
                </div>
                {activeDropdown === 'date' && (
                  <div className="qbm-dropdown">
                    {dates.map(date => (
                      <div 
                        key={date.value}
                        className={`qbm-dropdown-item ${selectedDate === date.value ? 'selected' : ''}`}
                        onClick={() => handleDateSelect(date.value)}
                      >
                        {date.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 4: Showtime */}
              <div className={`qbm-step ${!selectedDate ? 'disabled' : ''}`}>
                <div 
                  className={`qbm-selector ${activeDropdown === 'time' ? 'active' : ''}`}
                  onClick={() => selectedDate && toggleDropdown('time')}
                >
                  <FaClock className="qbm-icon" />
                  <span className="qbm-value">
                    {selectedShowtime 
                      ? `${selectedShowtime.startTime.substring(0, 5)} - ${selectedShowtime.hallName}` 
                      : 'Chọn Giờ Chiếu'}
                  </span>
                  <FaChevronDown className={`qbm-chevron ${activeDropdown === 'time' ? 'rotated' : ''}`} />
                </div>
                {activeDropdown === 'time' && (
                  <div className="qbm-dropdown">
                    {loading ? (
                      <div className="qbm-dropdown-loading">
                        <div className="spinner spinner-small"></div>
                        <span>Đang tải...</span>
                      </div>
                    ) : showtimes.length === 0 ? (
                      <div className="qbm-dropdown-empty">Không có suất chiếu</div>
                    ) : (
                      showtimes.map(showtime => (
                        <div 
                          key={showtime.showtimeId}
                          className={`qbm-dropdown-item qbm-showtime-item ${selectedShowtime?.showtimeId === showtime.showtimeId ? 'selected' : ''}`}
                          onClick={() => handleShowtimeSelect(showtime)}
                        >
                          <span className="qbm-showtime-time">{showtime.startTime.substring(0, 5)}</span>
                          <span className="qbm-item-sub">{showtime.hallName}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Book Now Button */}
              {selectedShowtime && (
                <button className="qbm-book-btn" onClick={handleBookNow}>
                  ĐẶT VÉ NGAY
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickBookingMini;

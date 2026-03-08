import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
import bookingService from '../services/bookingService';
import QuickBooking from './QuickBooking';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Quick Booking States
  const [activeStep, setActiveStep] = useState(null);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [times, setTimes] = useState([]);

  // Dữ liệu banner slides cho trailer phim
  const bannerSlides = [
    {
      id: 1,
      title: 'GODZILLA MINUS ONE',
      image: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1400&h=500&fit=crop',
      releaseDate: 'Khởi chiếu 07.12.2025'
    },
    {
      id: 2,
      title: 'TRÁI TIM QUỶ DỮ',
      image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&h=500&fit=crop',
      releaseDate: 'Đang chiếu'
    },
    {
      id: 3,
      title: 'CẬU THỨ 13 HÙNG MẠNH ĐẠO CHÍCH CHÓC',
      image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&h=500&fit=crop',
      releaseDate: 'Khởi chiếu 14.12.2025'
    }
  ];



  const promotions = [
    {
      id: 1,
      image: '/images/events/events1.png'
    },
    {
      id: 2,
      image: '/images/events/events2.png'
    },
    {
      id: 3,
      image: '/images/events/events3.png'
    }
  ];

  // Fetch movies from API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        const nowShowingResponse = await movieService.getMovies({
          status: 'NOW_SHOWING',
          page: 0,
          size: 4
        });
        
        if (nowShowingResponse.success) {
          setNowShowingMovies(nowShowingResponse.data.content);
        }
        
        const comingSoonResponse = await movieService.getMovies({
          status: 'COMING_SOON',
          page: 0,
          size: 4
        });
        
        if (comingSoonResponse.success) {
          setComingSoonMovies(comingSoonResponse.data.content);
        }
        
      } catch (error) {
        console.error('Error fetching movies:', error);
        toast.error('Không thể tải danh sách phim');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Auto slide banner
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [bannerSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const getGenreNames = (genres) => {
    if (!genres || genres.length === 0) return 'Đang cập nhật';
    return genres.map(g => g.name).join(', ');
  };

  const formatReleaseDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Quick Booking Functions
  const toggleStep = async (step) => {
    if (step === 1) {
      setActiveStep(activeStep === 1 ? null : 1);
      if (cinemas.length === 0) {
        try {
          const response = await bookingService.getAllCinemas();
          if (response.success && response.data) {
            setCinemas(response.data);
          }
        } catch (error) {
          console.error('Error loading cinemas:', error);
          toast.error('Không thể tải danh sách rạp');
        }
      }
    } else if (step === 2 && selectedCinema) {
      // Toggle step 2
      if (activeStep === 2) {
        setActiveStep(null);
      } else {
        setActiveStep(2);
        // Chỉ load lại movies nếu chưa có
        if (movies.length === 0) {
          try {
            const response = await bookingService.getMovies();
            if (response.success && response.data) {
              setMovies(response.data);
            }
          } catch (error) {
            console.error('Error loading movies:', error);
            toast.error('Không thể tải danh sách phim');
          }
        }
      }
    } else if (step === 3 && selectedMovie) {
      // Toggle step 3
      if (activeStep === 3) {
        setActiveStep(null);
      } else {
        setActiveStep(3);
        // Chỉ load lại dates nếu chưa có
        if (dates.length === 0) {
          try {
            const response = await bookingService.getAvailableDates(
              selectedMovie.movieId, 
              selectedCinema.cinemaId
            );
            if (response.success && response.data) {
              const formattedDates = response.data.map((dateStr, index) => {
                const date = new Date(dateStr);
                return {
                  id: index + 1,
                  date: dateStr,
                  display: date.toLocaleDateString('vi-VN', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: '2-digit' 
                  })
                };
              });
              setDates(formattedDates);
            }
          } catch (error) {
            console.error('Error loading dates:', error);
            toast.error('Không thể tải danh sách ngày chiếu');
          }
        }
      }
    } else if (step === 4 && selectedDate) {
      // Toggle step 4
      if (activeStep === 4) {
        setActiveStep(null);
      } else {
        setActiveStep(4);
        // Chỉ load lại times nếu chưa có
        if (times.length === 0) {
          try {
            const response = await bookingService.getShowtimes(
              selectedMovie.movieId,
              selectedCinema.cinemaId,
              selectedDate.date
            );
            if (response.success && response.data) {
              const formattedTimes = response.data.map(showtime => ({
                id: showtime.showtimeId,
                time: showtime.startTime,
                room: showtime.hallName,
                availableSeats: showtime.availableSeats,
                basePrice: showtime.basePrice
              }));
              setTimes(formattedTimes);
            }
          } catch (error) {
            console.error('Error loading showtimes:', error);
            toast.error('Không thể tải danh sách suất chiếu');
          }
        }
      }
    } else {
      toast.warning('Vui lòng chọn thông tin ở bước trước');
    }
  };

  const handleCinemaSelect = async (cinema) => {
    console.log('Selected cinema:', cinema);
    setSelectedCinema(cinema);
    setSelectedMovie(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setMovies([]);
    setDates([]);
    setTimes([]);
    
    // Tự động chuyển sang step 2 và load phim
    setActiveStep(2);
    try {
      console.log('Fetching movies for cinema:', cinema.cinemaId);
      // Tạm thời lấy tất cả phim đang chiếu thay vì theo rạp (do chưa có showtimes)
      const response = await bookingService.getMovies(); // Không truyền cinemaId
      console.log('Movies response:', response);
      
      if (response.success && response.data) {
        console.log('Setting movies:', response.data);
        setMovies(response.data);
        if (response.data.length === 0) {
          toast.info('Rạp này chưa có lịch chiếu. Vui lòng quay lại sau.');
        }
      } else {
        console.log('No movies data in response');
      }
    } catch (error) {
      console.error('Error loading movies:', error);
      toast.error('Không thể tải danh sách phim');
    }
  };

  const handleMovieSelect = async (movie) => {
    setSelectedMovie(movie);
    setSelectedDate(null);
    setSelectedTime(null);
    setDates([]);
    setTimes([]);
    
    // Tự động chuyển sang step 3 và load ngày chiếu
    setActiveStep(3);
    try {
      console.log('Loading dates for movie:', movie.movieId, 'cinema:', selectedCinema.cinemaId);
      const response = await bookingService.getAvailableDates(
        movie.movieId, 
        selectedCinema.cinemaId
      );
      console.log('Dates response:', response);
      if (response.success && response.data) {
        console.log('Raw dates data:', response.data);
        const formattedDates = response.data.map((dateStr, index) => {
          const date = new Date(dateStr);
          return {
            id: index + 1,
            date: dateStr,
            display: date.toLocaleDateString('vi-VN', { 
              weekday: 'short', 
              day: '2-digit', 
              month: '2-digit' 
            })
          };
        });
        console.log('Formatted dates:', formattedDates);
        setDates(formattedDates);
        if (formattedDates.length === 0) {
          toast.info('Phim này chưa có lịch chiếu tại rạp này');
        }
      } else {
        console.log('No dates data or unsuccessful response');
        toast.info('Không có lịch chiếu cho phim này');
      }
    } catch (error) {
      console.error('Error loading dates:', error);
      toast.error('Không thể tải danh sách ngày chiếu');
    }
  };

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setTimes([]);
    
    // Tự động chuyển sang step 4 và load giờ chiếu
    setActiveStep(4);
    try {
      console.log('Loading showtimes for cinema:', selectedCinema.cinemaId, 'movie:', selectedMovie.movieId, 'date:', date.date);
      const response = await bookingService.getShowtimes(
        selectedMovie.movieId,
        selectedCinema.cinemaId,
        date.date
      );
      console.log('Showtimes response:', response);
      if (response.success && response.data) {
        console.log('Raw showtimes data:', response.data);
        const formattedTimes = response.data.map(showtime => ({
          id: showtime.showtimeId,
          time: showtime.startTime.substring(0, 5), // HH:MM
          room: showtime.hallName,
          availableSeats: showtime.availableSeats,
          basePrice: showtime.basePrice
        }));
        console.log('Formatted times:', formattedTimes);
        setTimes(formattedTimes);
        if (formattedTimes.length === 0) {
          toast.info('Không có suất chiếu cho ngày này');
        }
      } else {
        console.log('No showtimes data or unsuccessful response');
        toast.info('Không có suất chiếu');
      }
    } catch (error) {
      console.error('Error loading showtimes:', error);
      toast.error('Không thể tải danh sách suất chiếu');
    }
  };

  const handleTimeSelect = (time) => {
    console.log('Time selected:', time);
    setSelectedTime(time);
    setActiveStep(null);
  };

  const handleBookTicket = () => {
    console.log('Book ticket clicked!');
    console.log('Selected data:', { selectedCinema, selectedMovie, selectedDate, selectedTime });
    
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedTime) {
      console.log('Missing data - showing warning');
      toast.warning('Vui lòng chọn đầy đủ thông tin để đặt vé');
      return;
    }
    
    const bookingUrl = `/booking?cinema=${selectedCinema.cinemaId}&movie=${selectedMovie.movieId}&date=${selectedDate.date}&time=${selectedTime.id}`;
    console.log('Navigating to:', bookingUrl);
    toast.success('Chuyển đến trang đặt vé...');
    navigate(bookingUrl);
  };

  return (
    <div className="homepage">
      <section className="hero-banner">
        <div className="banner-carousel">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`banner-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="banner-overlay">
                <div className="banner-content">
                  <h1>{slide.title}</h1>
                  <p>{slide.releaseDate}</p>
                </div>
              </div>
            </div>
          ))}
          
          <button className="banner-arrow left" onClick={prevSlide}>
            <FaChevronLeft />
          </button>
          <button className="banner-arrow right" onClick={nextSlide}>
            <FaChevronRight />
          </button>

          <div className="banner-indicators">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="booking-section-old" style={{ display: 'none' }}>
        <div className="container">
          <div className="booking-header">ĐẶT VÉ NHANH</div>
          <div className="booking-tabs">
            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedCinema ? 'selected' : ''} ${activeStep === 1 ? 'active' : ''}`}
                onClick={() => toggleStep(1)}
              >
                <span>1. Chọn Rạp</span>
                {selectedCinema && <span className="selected-text">{selectedCinema.cinemaName}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 1 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 1 && (
                <div className="dropdown-menu">
                  {cinemas.map(cinema => (
                    <div 
                      key={cinema.cinemaId}
                      className={`dropdown-item ${selectedCinema?.cinemaId === cinema.cinemaId ? 'selected' : ''}`}
                      onClick={() => handleCinemaSelect(cinema)}
                    >
                      <div className="item-name">{cinema.cinemaName}</div>
                      <div className="item-location">{cinema.city} - {cinema.district}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedMovie ? 'selected' : ''} ${activeStep === 2 ? 'active' : ''}`}
                onClick={() => toggleStep(2)}
                disabled={!selectedCinema}
              >
                <span>2. Chọn Phim</span>
                {selectedMovie && <span className="selected-text">{selectedMovie.title}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 2 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 2 && (
                <div className="dropdown-menu">
                  {movies.length === 0 ? (
                    <div className="dropdown-item">Đang tải phim...</div>
                  ) : (
                    movies.map(movie => (
                      <div 
                        key={movie.movieId}
                        className={`dropdown-item ${selectedMovie?.movieId === movie.movieId ? 'selected' : ''}`}
                        onClick={() => handleMovieSelect(movie)}
                      >
                        <div className="item-name">{movie.title}</div>
                        <div className="item-location">{movie.durationMinutes} phút</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedDate ? 'selected' : ''} ${activeStep === 3 ? 'active' : ''}`}
                onClick={() => toggleStep(3)}
                disabled={!selectedMovie}
              >
                <span>3. Chọn Ngày</span>
                {selectedDate && <span className="selected-text">{selectedDate.display}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 3 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 3 && (
                <div className="dropdown-menu">
                  {dates.length === 0 ? (
                    <div className="dropdown-item">Đang tải ngày chiếu...</div>
                  ) : (
                    dates.map(date => (
                      <div 
                        key={date.id}
                        className={`dropdown-item ${selectedDate?.id === date.id ? 'selected' : ''}`}
                        onClick={() => handleDateSelect(date)}
                      >
                        <div className="item-name">{date.display}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="booking-step-wrapper">
              <button 
                className={`booking-tab ${selectedTime ? 'selected' : ''} ${activeStep === 4 ? 'active' : ''}`}
                onClick={() => toggleStep(4)}
                disabled={!selectedDate}
              >
                <span>4. Chọn Giờ</span>
                {selectedTime && <span className="selected-text">{selectedTime.time}</span>}
                <FaChevronDown className={`dropdown-icon ${activeStep === 4 ? 'rotated' : ''}`} />
              </button>
              {activeStep === 4 && (
                <div className="dropdown-menu time-menu">
                  {times.length === 0 ? (
                    <div className="dropdown-item">Đang tải giờ chiếu...</div>
                  ) : (
                    times.map(time => (
                      <div 
                        key={time.id}
                        className={`dropdown-item time-item ${selectedTime?.id === time.id ? 'selected' : ''}`}
                        onClick={() => handleTimeSelect(time)}
                      >
                        <div className="item-name">{time.time}</div>
                        <div className="item-location">{time.room}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button 
              className="btn-book-ticket"
              onClick={handleBookTicket}
            >
              ĐẶT VÉ
            </button>
          </div>
        </div>
      </section>

      <section className="movies-section now-showing">
        <div className="container">
          <div className="section-header">
            <h2>PHIM ĐANG CHIẾU</h2>
            <button className="btn-see-more" onClick={() => navigate('/now-showing')}>
              XEM THÊM
            </button>
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="movies-grid">
              {nowShowingMovies.length > 0 ? (
                nowShowingMovies.map((movie) => (
                  <div key={movie.movieId} className="movie-card" onClick={() => navigate(`/movie/${movie.movieId}`)}>
                    <div className="movie-poster">
                      <div className="age-rating">{movie.ageRating}</div>
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} />
                      ) : (
                        <div className="poster-placeholder">
                          <span>Chưa có poster</span>
                        </div>
                      )}
                      <div className="movie-overlay">
                        <button className="btn-play">▶</button>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="movie-genre">{getGenreNames(movie.genres)}</p>
                      <button className="btn-book">ĐẶT VÉ</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-movies">Hiện chưa có phim đang chiếu</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="movies-section coming-soon">
        <div className="container">
          <div className="section-header">
            <h2>PHIM SẮP CHIẾU</h2>
            <button className="btn-see-more" onClick={() => navigate('/coming-soon')}>
              XEM THÊM
            </button>
          </div>
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="movies-grid">
              {comingSoonMovies.length > 0 ? (
                comingSoonMovies.map((movie) => (
                  <div key={movie.movieId} className="movie-card" onClick={() => navigate(`/movie/${movie.movieId}`)}>
                    <div className="movie-poster">
                      <div className="age-rating">{movie.ageRating}</div>
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} />
                      ) : (
                        <div className="poster-placeholder">
                          <span>Chưa có poster</span>
                        </div>
                      )}
                      <div className="movie-overlay">
                        <button className="btn-play">▶</button>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p className="release-info">Khởi chiếu: {formatReleaseDate(movie.releaseDate)}</p>
                      <button className="btn-book outline">TÌM HIỂU THÊM</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-movies">Hiện chưa có phim sắp chiếu</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="promotions-section">
        <div className="container">
          <div className="section-header">
            <h2>KHUYẾN MÃI</h2>
          </div>
          <div className="promotions-grid">
            {promotions.map((promo) => (
              <div key={promo.id} className="promo-card">
                <img src={promo.image} alt="Khuyến mãi" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

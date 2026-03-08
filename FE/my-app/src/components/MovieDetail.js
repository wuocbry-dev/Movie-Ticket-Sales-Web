import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaPlay, FaStar, FaClock, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
import showtimeService from '../services/showtimeService';
import './MovieDetail.css';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedMovies, setRelatedMovies] = useState([]);
  const [currentMovieIndex, setCurrentMovieIndex] = useState(0);
  const [showtimes, setShowtimes] = useState([]);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchMovieDetails();
    fetchRelatedMovies();
    fetchShowtimes();
  }, [id]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovieById(id);
      
      if (response.success) {
        setMovie(response.data);
      } else {
        toast.error('Không tìm thấy thông tin phim');
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      toast.error('Không thể tải thông tin phim');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedMovies = async () => {
    try {
      const response = await movieService.getMovies({
        status: 'NOW_SHOWING',
        page: 0,
        size: 8
      });
      
      if (response.success) {
        const filtered = response.data.content.filter(m => m.movieId !== parseInt(id));
        setRelatedMovies(filtered);
      }
    } catch (error) {
      console.error('Error fetching related movies:', error);
    }
  };

  const fetchShowtimes = async () => {
    try {
      setShowtimesLoading(true);
      const response = await showtimeService.getShowtimesByMovie(id);
      
      if (response.success && response.data) {
        setShowtimes(response.data);
        // Set first valid date as selected (from today onwards)
        if (response.data.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const sellingShowtimes = response.data.filter(s => s.status === 'SELLING');
          const dates = [...new Set(sellingShowtimes.map(s => s.showDate))];
          const validDates = dates.filter(date => {
            const showDate = new Date(date + 'T00:00:00');
            return showDate >= today;
          }).sort();
          
          if (validDates.length > 0) {
            setSelectedDate(validDates[0]);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching showtimes:', error);
    } finally {
      setShowtimesLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có thông tin';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getGenres = (genres) => {
    if (!genres || genres.length === 0) return 'Đang cập nhật';
    return genres.map(g => g.name).join(', ');
  };

  const getAgeRatingLabel = (ageRating) => {
    const ratings = {
      'P': 'P (Phim dành cho mọi lứa tuổi)',
      'T13': 'T13 (Phim dành cho khán giả từ đủ 13 tuổi trở lên)',
      'T16': 'T16 (Phim dành cho khán giả từ đủ 16 tuổi trở lên)',
      'T18': 'T18 (Phim dành cho khán giả từ đủ 18 tuổi trở lên)',
      'K': 'K (Phim không dành cho trẻ em dưới 13 tuổi và cần có người bảo hộ đi kèm)'
    };
    return ratings[ageRating] || ageRating;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5); // HH:MM
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getFormatLabel = (format) => {
    const formats = {
      '_2D': '2D',
      '_3D': '3D',
      'IMAX': 'IMAX',
      'IMAX_3D': 'IMAX 3D'
    };
    return formats[format] || format;
  };

  const getAvailableDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Chỉ lấy các suất chiếu có status SELLING
    const sellingShowtimes = showtimes.filter(s => s.status === 'SELLING');
    const dates = [...new Set(sellingShowtimes.map(s => s.showDate))];
    // Chỉ hiển thị các ngày từ hôm nay trở đi
    const validDates = dates.filter(date => {
      const showDate = new Date(date + 'T00:00:00');
      return showDate >= today;
    });
    return validDates.sort();
  };

  const isShowtimeBookable = (showtime) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Kiểm tra ngày chiếu
    const showDate = new Date(showtime.showDate + 'T00:00:00');
    
    // Nếu ngày chiếu trước hôm nay -> không được đặt
    if (showDate < today) {
      return false;
    }
    
    // Nếu là ngày hôm nay, kiểm tra giờ chiếu
    if (showDate.getTime() === today.getTime()) {
      const [hours, minutes] = showtime.startTime.split(':').map(Number);
      const showtimeDateTime = new Date();
      showtimeDateTime.setHours(hours, minutes, 0, 0);
      
      // Nếu giờ chiếu đã qua -> không được đặt
      if (showtimeDateTime <= now) {
        return false;
      }
    }
    
    // Kiểm tra còn chỗ
    return showtime.availableSeats > 0;
  };

  const getShowtimesByDateAndCinema = () => {
    if (!selectedDate) return {};
    
    // Lọc suất chiếu theo ngày đã chọn và status SELLING
    const filtered = showtimes.filter(s => 
      s.showDate === selectedDate && 
      s.status === 'SELLING'
    );
    const grouped = {};
    
    filtered.forEach(showtime => {
      const key = showtime.cinemaId;
      if (!grouped[key]) {
        grouped[key] = {
          cinemaName: showtime.cinemaName,
          showtimes: []
        };
      }
      grouped[key].showtimes.push(showtime);
    });
    
    return grouped;
  };

  useEffect(() => {
    if (relatedMovies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentMovieIndex((prev) => (prev + 1) % relatedMovies.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [relatedMovies.length]);

  useEffect(() => {
    setCurrentMovieIndex(0);
  }, [id]);

  const nextMovie = () => {
    setCurrentMovieIndex((prev) => (prev + 1) % relatedMovies.length);
  };

  const prevMovie = () => {
    setCurrentMovieIndex((prev) => (prev - 1 + relatedMovies.length) % relatedMovies.length);
  };

  const visibleMovies = [];
  for (let i = 0; i < Math.min(4, relatedMovies.length); i++) {
    const index = (currentMovieIndex + i) % relatedMovies.length;
    visibleMovies.push(relatedMovies[index]);
  }

  if (loading) {
    return (
      <div className='movie-detail-loading'>
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text-animated">Đang tải</span>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className='movie-detail-error'>
        <h2>Không tìm thấy phim</h2>
        <button onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className='movie-detail'>
      <div className='detail-banner' style={{ backgroundImage: `url(${movie.backdropUrl || movie.posterUrl})` }}>
        <div className='banner-overlay'>
          <div className='detail-container'>
            <div className='detail-content'>
              <div className='movie-poster-large'>
                <img src={movie.posterUrl} alt={movie.title} />
                {movie.trailerUrl && (
                  <button className='btn-trailer' onClick={() => window.open(movie.trailerUrl, '_blank')}>
                    <FaPlay /> XEM TRAILER
                  </button>
                )}
              </div>
              <div className='movie-details'>
                <h1>{movie.title}</h1>
                {movie.titleEn && <p className='title-en'>{movie.titleEn}</p>}
                <div className='movie-meta'>
                  {movie.imdbRating && (
                    <div className='meta-item'>
                      <FaStar className='meta-icon' />
                      <span>{movie.imdbRating}/10</span>
                    </div>
                  )}
                  <div className='meta-item'>
                    <FaClock className='meta-icon' />
                    <span>{movie.duration} phút</span>
                  </div>
                  <div className='meta-item'>
                    <FaCalendar className='meta-icon' />
                    <span>{formatDate(movie.releaseDate)}</span>
                  </div>
                </div>
                <div className='movie-info-grid'>
                  <div className='md-info-row'>
                    <span className='md-info-label'>Thể loại:</span>
                    <span className='md-info-value'>{getGenres(movie.genres)}</span>
                  </div>
                  {movie.director && (
                    <div className='md-info-row'>
                      <span className='md-info-label'>Đạo diễn:</span>
                      <span className='md-info-value'>{movie.director}</span>
                    </div>
                  )}
                  {movie.cast && (
                    <div className='md-info-row'>
                      <span className='md-info-label'>Diễn viên:</span>
                      <span className='md-info-value'>{movie.cast}</span>
                    </div>
                  )}
                  {movie.language && (
                    <div className='md-info-row'>
                      <span className='md-info-label'>Ngôn ngữ:</span>
                      <span className='md-info-value'>
                        {movie.language}
                        {movie.subtitleLanguage && ` - Phụ đề ${movie.subtitleLanguage}`}
                      </span>
                    </div>
                  )}
                  {movie.country && (
                    <div className='md-info-row'>
                      <span className='md-info-label'>Quốc gia:</span>
                      <span className='md-info-value'>{movie.country}</span>
                    </div>
                  )}
                  {movie.ageRating && (
                    <div className='md-info-row'>
                      <span className='md-info-label'>Rated:</span>
                      <span className='md-info-value rated'>{getAgeRatingLabel(movie.ageRating)}</span>
                    </div>
                  )}
                  {movie.availableFormats && movie.availableFormats.length > 0 && (
                    <div className='md-info-row'>
                      <span className='md-info-label'>Định dạng:</span>
                      <span className='md-info-value'>{movie.availableFormats.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='detail-container'>
        <section className='movie-description'>
          <h2>NỘI DUNG PHIM</h2>
          <p>{movie.synopsis || movie.synopsisEn || 'Nội dung phim đang được cập nhật...'}</p>
          {movie.contentWarning && (
            <div className='content-warning'>
              <strong>Cảnh báo nội dung:</strong> {movie.contentWarning}
            </div>
          )}
        </section>
        <section className='movie-schedule'>
          <h2>Lịch chiếu</h2>
          {showtimesLoading ? (
            <div className='schedule-loading'>
              <div className="spinner spinner-small"></div>
              <span>Đang tải lịch chiếu...</span>
            </div>
          ) : showtimes.length === 0 ? (
            <div className='schedule-placeholder'>
              <p>Hiện tại chưa có lịch chiếu cho phim này.</p>
              <p>Vui lòng quay lại sau hoặc liên hệ rạp để biết thêm chi tiết.</p>
            </div>
          ) : (
            <div className='schedule-content'>
              <div className='date-selector'>
                {getAvailableDates().map(date => (
                  <button
                    key={date}
                    className={`date-btn ${selectedDate === date ? 'active' : ''}`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className='date-day'>{new Date(date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'short' })}</div>
                    <div className='date-number'>{new Date(date + 'T00:00:00').getDate()}</div>
                    <div className='date-month'>Tháng {new Date(date + 'T00:00:00').getMonth() + 1}</div>
                  </button>
                ))}
              </div>
              <div className='cinema-showtimes'>
                {Object.entries(getShowtimesByDateAndCinema()).map(([cinemaId, data]) => (
                  <div key={cinemaId} className='cinema-group'>
                    <h3 className='cinema-name'>{data.cinemaName}</h3>
                    <div className='showtimes-grid'>
                      {data.showtimes.map(showtime => {
                        const isBookable = isShowtimeBookable(showtime);
                        return (
                        <div key={showtime.showtimeId} className='showtime-card'>
                          <div className='showtime-time'>{formatTime(showtime.startTime)}</div>
                          <div className='showtime-hall'>{showtime.hallName}</div>
                          <div className='showtime-info'>
                            <span className='showtime-format'>{getFormatLabel(showtime.formatType)}</span>
                            <span className='showtime-subtitle'>{showtime.subtitleLanguage}</span>
                          </div>
                          <div className='showtime-price'>{formatPrice(showtime.basePrice)}</div>
                          <div className='showtime-seats'>
                            {showtime.availableSeats > 0 ? (
                              <span className='seats-available'>Còn {showtime.availableSeats} ghế</span>
                            ) : (
                              <span className='seats-full'>Hết chỗ</span>
                            )}
                          </div>
                          <button 
                            className='btn-book-showtime'
                            disabled={!isBookable}
                            onClick={() => navigate(`/booking/${showtime.showtimeId}`)}
                          >
                            {!isBookable ? (showtime.availableSeats === 0 ? 'Hết chỗ' : 'Đã qua giờ') : 'Đặt vé'}
                          </button>
                        </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        {relatedMovies.length > 0 && (
          <section className='other-movies-section'>
            <h2>Phim Khác</h2>
            <div className='other-movies-carousel'>
              <button className='carousel-arrow carousel-arrow-left' onClick={prevMovie}>
                <FaChevronLeft />
              </button>
              <div className='other-movies-grid'>
                {visibleMovies.map((relatedMovie) => (
                  <div 
                    key={relatedMovie.movieId} 
                    className='other-movie-card'
                    onClick={() => navigate(`/movie/${relatedMovie.movieId}`)}
                  >
                    <div className='other-movie-poster'>
                      <img src={relatedMovie.posterUrl} alt={relatedMovie.title} />
                      <div className='other-movie-overlay'>
                        <button className='btn-play-small'>
                          <FaPlay />
                        </button>
                      </div>
                      {relatedMovie.imdbRating && (
                        <div className='other-movie-rating'>
                          <FaStar /> {relatedMovie.imdbRating}
                        </div>
                      )}
                    </div>
                    <div className='other-movie-info'>
                      <h3>{relatedMovie.title}</h3>
                      <p className='other-movie-genre'>{getGenres(relatedMovie.genres)}</p>
                      <button className='btn-book-small'>ĐẶT VÉ NGAY</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className='carousel-arrow carousel-arrow-right' onClick={nextMovie}>
                <FaChevronRight />
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFilter, FaSearch } from 'react-icons/fa';
import movieService from '../services/movieService';
import './NowShowingPage.css';

const NowShowingPage = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('releaseDate');

  useEffect(() => {
    fetchMovies();
  }, [currentPage, sortBy]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovies({
        status: 'NOW_SHOWING',
        page: currentPage,
        size: 12,
        sortBy: sortBy,
        sortDir: 'DESC'
      });

      if (response.success) {
        setMovies(response.data.content);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
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

  const filteredMovies = movies.filter(movie =>
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.titleEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="now-showing-page">
      <div className="now-showing-container">
        <div className="nsp-page-header">
          <h1>PHIM ĐANG CHIẾU</h1>
          <p className="nsp-page-subtitle">Tất cả phim hiện đang chiếu tại rạp</p>
        </div>

        <div className="controls-section">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sort-box">
            <FaFilter className="filter-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="releaseDate">Ngày phát hành</option>
              <option value="title">Tên phim</option>
              <option value="imdbRating">Đánh giá</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Đang tải...</div>
        ) : (
          <>
            <div className="movies-grid">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <div key={movie.movieId} className="movie-card" onClick={() => navigate(`/movie/${movie.movieId}`)}>
                    <div className="movie-poster">
                      <div className="age-rating">{movie.ageRating}</div>
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
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
                      <p className="movie-release">Khởi chiếu: {formatReleaseDate(movie.releaseDate)}</p>
                      {movie.imdbRating && (
                        <p className="movie-rating">⭐ {movie.imdbRating}/10</p>
                      )}
                      <button className="btn-book" onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/movie/${movie.movieId}`);
                      }}>
                        ĐẶT VÉ
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-movies">Không tìm thấy phim nào</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="btn-page"
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  ‹ Trước
                </button>
                
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      className={`btn-page-num ${currentPage === index ? 'active' : ''}`}
                      onClick={() => setCurrentPage(index)}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                <button 
                  className="btn-page"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Sau ›
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NowShowingPage;

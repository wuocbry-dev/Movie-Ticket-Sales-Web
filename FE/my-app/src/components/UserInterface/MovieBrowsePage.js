import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { FaSearch, FaFilter, FaFilm, FaTicketAlt, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import movieService from '../../services/movieService';
import './MovieBrowsePage.css';

const PAGE_SIZE = 12;

const CONFIG = {
  now: {
    status: 'NOW_SHOWING',
    title: 'Phim đang chiếu',
    subtitle: 'Chọn phim yêu thích — đặt vé chỉ với vài thao tác.',
    defaultSort: 'popularity',
    defaultDir: 'desc',
    aria: 'Phim đang chiếu',
  },
  soon: {
    status: 'COMING_SOON',
    title: 'Phim sắp chiếu',
    subtitle: 'Cập nhật lịch khởi chiếu — đặt vé khi suất mở bán.',
    defaultSort: 'releaseDate',
    defaultDir: 'asc',
    aria: 'Phim sắp chiếu',
  },
};

/**
 * Trang danh sách phim dùng chung: /now-showing (now) và /coming-soon (soon)
 */
function MovieBrowsePage({ mode = 'now' }) {
  const navigate = useNavigate();
  const cfg = CONFIG[mode] || CONFIG.now;

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState(cfg.defaultSort);
  const [sortDir, setSortDir] = useState(cfg.defaultDir);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const response = await movieService.getMovies({
        status: cfg.status,
        page: currentPage,
        size: PAGE_SIZE,
        sortBy,
        sortDir: sortDir.toUpperCase(),
      });
      if (response?.success && response.data) {
        setMovies(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
      } else {
        setMovies([]);
        setTotalPages(0);
      }
    } catch (e) {
      console.error(e);
      toast.error('Không thể tải danh sách phim');
      setMovies([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [cfg.status, currentPage, sortBy, sortDir]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const getGenreNames = (genres) => {
    if (!genres?.length) return 'Đang cập nhật';
    return genres.map((g) => g.name).join(', ');
  };

  const formatReleaseDate = (d) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleDateString('vi-VN');
    } catch {
      return '—';
    }
  };

  const filteredMovies = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return movies;
    return movies.filter((m) => {
      const t = (m.title || '').toLowerCase();
      const te = (m.titleEn || '').toLowerCase();
      return t.includes(q) || te.includes(q);
    });
  }, [movies, searchTerm]);

  const onSortChange = (e) => {
    const v = e.target.value;
    if (v === 'popularity') {
      setSortBy('popularity');
      setSortDir('desc');
    } else if (v === 'releaseDate_desc') {
      setSortBy('releaseDate');
      setSortDir('desc');
    } else if (v === 'releaseDate_asc') {
      setSortBy('releaseDate');
      setSortDir('asc');
    } else if (v === 'title') {
      setSortBy('title');
      setSortDir('asc');
    }
    setCurrentPage(0);
  };

  const sortSelectValue = useMemo(() => {
    if (sortBy === 'popularity') return 'popularity';
    if (sortBy === 'title') return 'title';
    if (sortBy === 'releaseDate' && sortDir === 'desc') return 'releaseDate_desc';
    return 'releaseDate_asc';
  }, [sortBy, sortDir]);

  const pageNumbers = useMemo(() => {
    const n = totalPages;
    if (n <= 0) return [];
    return [...Array(n)].map((_, i) => i);
  }, [totalPages]);

  const isSoon = mode === 'soon';

  return (
    <main className={`mbp ${isSoon ? 'mbp--soon' : ''}`} role="main" aria-label={cfg.aria}>
      <div className="mbp__inner">
        <header className="mbp__hero">
          <h1 className="mbp__title">{cfg.title}</h1>
          <p className="mbp__subtitle">{cfg.subtitle}</p>
        </header>

        <div className="mbp__toolbar">
          <label className="mbp__search">
            <FaSearch className="mbp__toolbar-ico" aria-hidden />
            <input
              type="search"
              className="mbp__search-input"
              placeholder="Tìm theo tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
              aria-label="Tìm phim"
            />
          </label>
          <label className="mbp__sort">
            <FaFilter className="mbp__toolbar-ico" aria-hidden />
            <select
              className="mbp__sort-select"
              value={sortSelectValue}
              onChange={onSortChange}
              aria-label="Sắp xếp"
            >
              <option value="popularity">Nổi bật</option>
              <option value="releaseDate_desc">Ngày khởi chiếu (mới nhất)</option>
              <option value="releaseDate_asc">Ngày khởi chiếu (cũ nhất)</option>
              <option value="title">Tên A–Z</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="mbp__loading" aria-live="polite">
            <div className="mbp__spinner" />
            <p>Đang tải...</p>
          </div>
        ) : (
          <>
            <section className="mbp__grid" aria-label="Danh sách phim">
              {filteredMovies.length > 0 ? (
                filteredMovies.map((movie) => (
                  <article
                    key={movie.movieId}
                    className="mbp__card"
                    onClick={() => navigate(`/movie/${movie.movieId}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/movie/${movie.movieId}`)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Xem ${movie.title}`}
                  >
                    <div className="mbp__poster">
                      {movie.ageRating ? (
                        <span className="mbp__age">{movie.ageRating}</span>
                      ) : null}
                      {movie.posterUrl ? (
                        <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                      ) : (
                        <div className="mbp__placeholder">
                          <FaFilm aria-hidden />
                          <span>Chưa có poster</span>
                        </div>
                      )}
                      {isSoon ? (
                        <div className="mbp__ribbon">
                          <FaCalendarAlt aria-hidden />
                          <span>Sắp chiếu</span>
                        </div>
                      ) : (
                        <div className="mbp__hoverlay" aria-hidden>
                          <span className="mbp__play">▶</span>
                        </div>
                      )}
                    </div>
                    <div className="mbp__body">
                      <h2 className="mbp__name">{movie.title}</h2>
                      <div className="mbp__meta-foot">
                        <div className="mbp__row-split">
                          <p className="mbp__genres">{getGenreNames(movie.genres)}</p>
                          <div className="mbp__imdb-slot" aria-hidden={movie.imdbRating == null}>
                            {movie.imdbRating != null ? (
                              <p className="mbp__imdb">⭐ {Number(movie.imdbRating).toFixed(1)}/10</p>
                            ) : null}
                          </div>
                        </div>
                        <p className="mbp__date">
                          Khởi chiếu: <strong>{formatReleaseDate(movie.releaseDate)}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        className={`mbp__cta ${isSoon ? 'mbp__cta--ghost' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/movie/${movie.movieId}`);
                        }}
                      >
                        {isSoon ? (
                          <>
                            <FaInfoCircle aria-hidden /> Chi tiết
                          </>
                        ) : (
                          <>
                            <FaTicketAlt aria-hidden /> Đặt vé
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="mbp__empty" role="status">
                  <FaFilm aria-hidden />
                  <p>{searchTerm.trim() ? 'Không có phim khớp tìm kiếm trên trang này.' : 'Chưa có phim trong danh sách.'}</p>
                </div>
              )}
            </section>

            {totalPages > 1 && (
              <nav className="mbp__pagination" aria-label="Phân trang">
                <button
                  type="button"
                  className="mbp__page"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                >
                  ‹ Trước
                </button>
                <div className="mbp__pages">
                  {pageNumbers.map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={`mbp__num ${currentPage === i ? 'mbp__num--on' : ''}`}
                      onClick={() => setCurrentPage(i)}
                      aria-current={currentPage === i ? 'page' : undefined}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="mbp__page"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                >
                  Sau ›
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default MovieBrowsePage;

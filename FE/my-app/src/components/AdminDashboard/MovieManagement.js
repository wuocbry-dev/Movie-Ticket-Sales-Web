import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '../../utils/toast';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import movieService from '../../services/movieService';
import MovieForm from './MovieForm';
import { hasRole, ROLES } from '../../utils/roleUtils';
import './MovieManagement.css';

const STATUS_LABEL = {
  NOW_SHOWING: 'Đang chiếu',
  COMING_SOON: 'Sắp chiếu',
  END_SHOWING: 'Ngừng chiếu',
};

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [genres, setGenres] = useState([]);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = hasRole(user.roles, ROLES.SYSTEM_ADMIN);
  const canView = hasRole(user.roles, ROLES.CINEMA_MANAGER) || canEdit;

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [sortDir, setSortDir] = useState('desc');

  const fetchGenres = useCallback(async () => {
    try {
      const response = await movieService.getGenres();
      if (response.success) {
        setGenres(response.data);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  }, []);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir,
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await movieService.getMovies(params);
      if (response.success) {
        setMovies(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Không thể tải danh sách phim!');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortBy, sortDir, statusFilter]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  const handleCreate = () => {
    setEditingMovie(null);
    setShowModal(true);
  };

  const handleEdit = async (movie) => {
    try {
      const response = await movieService.getMovieById(movie.movieId);
      if (response.success) {
        setEditingMovie(response.data);
        setShowModal(true);
      } else {
        toast.error('Không thể tải thông tin phim!');
      }
    } catch (error) {
      console.error('Error fetching movie details:', error);
      toast.error('Không thể tải thông tin phim!');
    }
  };

  const handleDelete = async (movieId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      return;
    }
    try {
      const response = await movieService.deleteMovie(movieId);
      if (response.success) {
        toast.success('Xóa phim thành công!');
        await fetchMovies();
      } else {
        toast.error(response.message || 'Không thể xóa phim!');
      }
    } catch (error) {
      console.error('Error deleting movie:', error);
      toast.error(error.response?.data?.message || 'Không thể xóa phim!');
    }
  };

  const handleFormSubmit = async (movieData) => {
    try {
      let response;
      if (editingMovie) {
        response = await movieService.updateMovie(editingMovie.movieId, movieData);
      } else {
        response = await movieService.createMovie(movieData);
      }
      if (response.success) {
        toast.success(editingMovie ? 'Cập nhật phim thành công!' : 'Thêm phim mới thành công!');
        setShowModal(false);
        setEditingMovie(null);
        await fetchMovies();
      } else {
        toast.error(response.message || 'Lỗi khi lưu phim!');
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error(
        error.response?.data?.message ||
          (editingMovie ? 'Không thể cập nhật phim!' : 'Không thể thêm phim!')
      );
      throw error;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setCurrentPage(0);
  };

  const handleSortFieldChange = (field) => {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setCurrentPage(0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMovie(null);
  };

  const filteredMovies = useMemo(
    () =>
      movies.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (movie.titleEn && movie.titleEn.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [movies, searchTerm]
  );

  const title = canEdit ? 'Quản lý phim' : 'Danh sách phim';

  return (
    <div className="adm-mv">
      <header className="adm-mv__hero">
        <div className="adm-mv__hero-main">
          <p className="adm-mv__eyebrow">Nội dung</p>
          <h1 className="adm-mv__title">{title}</h1>
          <p className="adm-mv__subtitle">
            {canEdit ? 'Thêm, sửa hoặc xóa phim trong hệ thống.' : 'Xem thông tin phim được phân quyền.'}
          </p>
        </div>
        <div className="adm-mv__hero-actions">
          {canEdit && (
            <button type="button" className="adm-mv__btn adm-mv__btn--primary" onClick={handleCreate}>
              <FaPlus aria-hidden />
              Thêm phim
            </button>
          )}
          {!canEdit && canView && (
            <span className="adm-mv__readonly">
              <FaEye aria-hidden />
              Chỉ xem
            </span>
          )}
        </div>
      </header>

      <div className="adm-mv__toolbar">
        <div className="adm-mv__search">
          <FaSearch className="adm-mv__search-icon" aria-hidden />
          <input
            type="search"
            className="adm-mv__search-input"
            placeholder="Tìm theo tên phim (VI / EN)…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="adm-mv__filters">
          <FaFilter className="adm-mv__filters-icon" aria-hidden />
          <select
            className="adm-mv__select"
            value={statusFilter}
            onChange={(e) => handleFilterChange(e.target.value)}
            aria-label="Lọc trạng thái"
          >
            <option value="">Mọi trạng thái</option>
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
            <option value="END_SHOWING">Ngừng chiếu</option>
          </select>

          <select
            className="adm-mv__select"
            value={sortBy}
            onChange={(e) => handleSortFieldChange(e.target.value)}
            aria-label="Sắp xếp theo"
          >
            <option value="releaseDate">Ngày phát hành</option>
            <option value="title">Tên phim</option>
            <option value="popularity">Độ phổ biến</option>
          </select>

          <select
            className="adm-mv__select"
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            aria-label="Số phim mỗi trang"
          >
            <option value={12}>12 / trang</option>
            <option value={24}>24 / trang</option>
            <option value={48}>48 / trang</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="adm-mv__state" aria-busy="true">
          <div className="adm-mv__spinner" />
          <p className="adm-mv__state-text">Đang tải danh sách…</p>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="adm-mv__empty" role="status">
          <p className="adm-mv__empty-title">Không có phim phù hợp</p>
          <p className="adm-mv__empty-desc">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
        </div>
      ) : (
        <>
          <div className="adm-mv__table-wrap">
            <table className="adm-mv__table">
              <thead>
                <tr>
                  <th scope="col">Poster</th>
                  <th scope="col">Tên phim</th>
                  <th scope="col">Thể loại</th>
                  <th scope="col">Tuổi</th>
                  <th scope="col">Phút</th>
                  <th scope="col">Phát hành</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">IMDb</th>
                  {canEdit && <th scope="col">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((movie) => (
                  <tr key={movie.movieId}>
                    <td>
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt=""
                          className="adm-mv__thumb"
                        />
                      ) : (
                        <div className="adm-mv__thumb adm-mv__thumb--empty" aria-hidden>
                          —
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="adm-mv__titles">
                        <span className="adm-mv__titles-vi">{movie.title}</span>
                        {movie.titleEn && (
                          <span className="adm-mv__titles-en">{movie.titleEn}</span>
                        )}
                      </div>
                    </td>
                    <td className="adm-mv__genres">
                      {movie.genres && movie.genres.length > 0
                        ? movie.genres.map((g) => g.name).join(', ')
                        : '—'}
                    </td>
                    <td>
                      <span
                        className={`adm-mv__tag adm-mv__tag--age adm-mv__tag--age-${movie.ageRating}`}
                      >
                        {movie.ageRating}
                      </span>
                    </td>
                    <td className="adm-mv__num">{movie.duration}′</td>
                    <td className="adm-mv__num">
                      {movie.releaseDate
                        ? new Date(movie.releaseDate).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td>
                      <span
                        className={`adm-mv__tag adm-mv__tag--st adm-mv__tag--st-${(movie.status || '')
                          .toLowerCase()}`}
                      >
                        {STATUS_LABEL[movie.status] || movie.status || '—'}
                      </span>
                    </td>
                    <td className="adm-mv__num">
                      {movie.imdbRating != null ? `★ ${movie.imdbRating}` : '—'}
                    </td>
                    {canEdit && (
                      <td>
                        <div className="adm-mv__row-actions">
                          <button
                            type="button"
                            className="adm-mv__icon-btn adm-mv__icon-btn--edit"
                            onClick={() => handleEdit(movie)}
                            title="Sửa"
                            aria-label={`Sửa ${movie.title}`}
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            className="adm-mv__icon-btn adm-mv__icon-btn--del"
                            onClick={() => handleDelete(movie.movieId)}
                            title="Xóa"
                            aria-label={`Xóa ${movie.title}`}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav className="adm-mv__pager" aria-label="Phân trang">
              <button
                type="button"
                className="adm-mv__pager-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
              >
                ← Trước
              </button>
              <div className="adm-mv__pager-meta">
                <span>
                  Trang {currentPage + 1} / {totalPages}
                </span>
                <span className="adm-mv__pager-total">({totalElements} phim)</span>
              </div>
              <button
                type="button"
                className="adm-mv__pager-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Sau →
              </button>
            </nav>
          )}
        </>
      )}

      {showModal && (
        <MovieForm
          movie={editingMovie}
          genres={genres}
          onSubmit={handleFormSubmit}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MovieManagement;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye } from 'react-icons/fa';
import movieService from '../services/movieService';
import MovieForm from './MovieForm';
import { hasRole, ROLES } from '../utils/roleUtils';
import './MovieManagement.css';

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  
  // Check user permissions
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = hasRole(user.roles, ROLES.SYSTEM_ADMIN);
  const canView = hasRole(user.roles, ROLES.CINEMA_MANAGER) || canEdit;
  
  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(12);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchMovies();
    fetchGenres();
  }, [currentPage, pageSize, statusFilter, sortBy, sortDir]);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        size: pageSize,
        sortBy: sortBy,
        sortDir: sortDir,
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
  };

  const fetchGenres = async () => {
    try {
      const response = await movieService.getGenres();
      if (response.success) {
        setGenres(response.data);
      }
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const handleCreate = () => {
    setEditingMovie(null);
    setShowModal(true);
  };

  const handleEdit = async (movie) => {
    try {
      // Fetch full movie details before editing
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
      toast.error(error.response?.data?.message || (editingMovie ? 'Không thể cập nhật phim!' : 'Không thể thêm phim!'));
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

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
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

  const filteredMovies = movies.filter(movie => 
    movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movie.titleEn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="movie-management-container">
      <div className="movie-management-header">
        <h1>{canEdit ? 'Quản Lý Phim' : 'Danh Sách Phim'}</h1>
        {canEdit && (
          <button className="btn-primary" onClick={handleCreate}>
            <FaPlus /> Thêm Phim Mới
          </button>
        )}
        {!canEdit && canView && (
          <div className="view-only-badge">
            <FaEye /> Chỉ xem
          </div>
        )}
      </div>

        {/* Filters and Search */}
        <div className="movie-management-controls">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm phim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-section">
          <FaFilter className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => handleFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NOW_SHOWING">Đang chiếu</option>
            <option value="COMING_SOON">Sắp chiếu</option>
            <option value="END_SHOWING">Ngừng chiếu</option>
          </select>

          <select 
            value={sortBy} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="filter-select"
          >
            <option value="releaseDate">Ngày phát hành</option>
            <option value="title">Tên phim</option>
            <option value="popularity">Độ phổ biến</option>
          </select>

          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="filter-select"
          >
            <option value="12">12 phim</option>
            <option value="24">24 phim</option>
            <option value="48">48 phim</option>
          </select>
        </div>
      </div>

      {/* Movies Table */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text-animated">Đang tải</span>
        </div>
      ) : (
        <>
          {filteredMovies.length === 0 ? (
            <div className="no-movies">
              <p>Không tìm thấy phim nào</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="movies-table">
                <thead>
                  <tr>
                    <th>Poster</th>
                    <th>Tên Phim</th>
                    <th>Thể Loại</th>
                    <th>Độ Tuổi</th>
                    <th>Thời Lượng</th>
                    <th>Ngày Phát Hành</th>
                    <th>Trạng Thái</th>
                    <th>Đánh Giá</th>
                    {canEdit && <th>Thao Tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredMovies.map((movie) => (
                    <tr key={movie.movieId} className="movie-table-row">
                      <td className="poster-cell">
                        {movie.posterUrl ? (
                          <img src={movie.posterUrl} alt={movie.title} className="table-poster" />
                        ) : (
                          <div className="table-poster-placeholder">🎬</div>
                        )}
                      </td>
                      <td className="title-cell">
                        <div className="title-content">
                          <strong>{movie.title}</strong>
                          <span className="title-en">{movie.titleEn}</span>
                        </div>
                      </td>
                      <td className="genres-cell">
                        {movie.genres && movie.genres.length > 0 ? (
                          movie.genres.map(g => g.name).join(', ')
                        ) : (
                          <span className="text-muted">Chưa có</span>
                        )}
                      </td>
                      <td className="age-cell">
                        <span className={`badge badge-age-${movie.ageRating}`}>{movie.ageRating}</span>
                      </td>
                      <td className="duration-cell">{movie.duration} phút</td>
                      <td className="date-cell">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</td>
                      <td className="status-cell">
                        <span className={`badge badge-${movie.status.toLowerCase()}`}>
                          {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : 
                           movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 
                           movie.status === 'END_SHOWING' ? 'Ngừng chiếu' : movie.status}
                        </span>
                      </td>
                      <td className="rating-cell">
                        {movie.imdbRating ? (
                          <span className="rating">⭐ {movie.imdbRating}</span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="actions-cell">
                          <button 
                            className="btn-action btn-edit-small" 
                            onClick={() => handleEdit(movie)}
                            title="Chỉnh sửa"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn-action btn-delete-small" 
                            onClick={() => handleDelete(movie.movieId)}
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}



          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="pagination-btn"
              >
                ← Trước
              </button>
              
              <div className="pagination-info">
                Trang {currentPage + 1} / {totalPages}
                <span className="total-items">
                  (Tổng: {totalElements} phim)
                </span>
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="pagination-btn"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}

        {/* Movie Form Modal */}
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

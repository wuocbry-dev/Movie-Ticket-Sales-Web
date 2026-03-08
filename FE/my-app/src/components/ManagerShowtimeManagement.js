import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaFilm,
  FaClock,
  FaCalendar,
  FaChair,
  FaMoneyBillWave,
  FaTheaterMasks
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './ManagerShowtimeManagement.css';

const ManagerShowtimeManagement = () => {
  const navigate = useNavigate();
  
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [myCinemas, setMyCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCinema, setSelectedCinema] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [formData, setFormData] = useState({
    movieId: '',
    cinemaId: '',
    hallId: '',
    showDate: '',
    startTime: '',
    endTime: '',
    formatType: '_2D',
    subtitleLanguage: 'Vietnamese',
    basePrice: '',
    status: 'SCHEDULED'
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    fetchMyCinemas();
    fetchMovies();
  }, [token]);

  useEffect(() => {
    if (selectedCinema) {
      fetchShowtimesByCinema();
    }
  }, [selectedCinema, page]);

  // Fetch cinemas managed by this manager
  const fetchMyCinemas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/my-cinemas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải danh sách rạp');

      const data = await response.json();
      console.log('My Cinemas API Response:', data);
      
      if (data.success && data.data) {
        // data.data is PagedCinemaResponse, data.data.data is the array of cinemas
        const cinemaList = data.data.data || [];
        console.log('Cinema list:', cinemaList);
        setMyCinemas(cinemaList);
        if (cinemaList.length > 0 && cinemaList[0].cinemaId) {
          setSelectedCinema(cinemaList[0].cinemaId.toString());
        }
      } else {
        setMyCinemas([]);
      }
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      toast.error('Không thể tải danh sách rạp của bạn');
    }
  };

  // Fetch showtimes for selected cinema
  const fetchShowtimesByCinema = async () => {
    if (!selectedCinema) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/showtimes/manager/my-showtimes?page=${page}&size=10&cinemaId=${selectedCinema}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể tải suất chiếu');
      }

      const result = await response.json();
      console.log('Showtimes API Response:', result);
      
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
        setTotalPages(result.data.totalPages || 0);
      } else {
        toast.error(result.message || 'Không thể tải suất chiếu');
        setShowtimes([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách suất chiếu');
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch movies (only NOW_SHOWING)
  const fetchMovies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/movies?status=NOW_SHOWING`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Không thể tải danh sách phim');

      const data = await response.json();
      if (data.data) {
        const movieList = data.data.content || data.data;
        setMovies(Array.isArray(movieList) ? movieList : []);
      } else {
        setMovies([]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMovies([]);
    }
  };

  // Fetch halls for selected cinema
  const fetchHallsForCinema = async (cinemaId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinema-halls/manager/my-halls?cinemaId=${cinemaId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Không thể tải danh sách phòng chiếu');

      const data = await response.json();
      console.log('Halls API Response:', data);
      
      if (data.success && data.data) {
        const hallsList = data.data.data || [];
        setHalls(hallsList);
      } else {
        setHalls([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách phòng chiếu');
      setHalls([]);
    }
  };

  // Handle create showtime
  const handleCreate = () => {
    if (!selectedCinema) {
      toast.warning('Vui lòng chọn rạp trước');
      return;
    }
    
    setModalMode('create');
    setFormData({
      movieId: '',
      cinemaId: selectedCinema,
      hallId: '',
      showDate: '',
      startTime: '',
      endTime: '',
      formatType: '_2D',
      subtitleLanguage: 'Vietnamese',
      basePrice: '80000',
      status: 'SCHEDULED'
    });
    fetchHallsForCinema(selectedCinema);
    setShowModal(true);
  };

  // Handle edit showtime
  const handleEdit = async (showtime) => {
    setModalMode('edit');
    setSelectedShowtime(showtime);
    
    await fetchHallsForCinema(showtime.cinemaId);
    
    setFormData({
      movieId: showtime.movieId?.toString() || '',
      cinemaId: showtime.cinemaId?.toString() || '',
      hallId: showtime.hallId?.toString() || '',
      showDate: showtime.showDate || '',
      startTime: showtime.startTime || '',
      endTime: showtime.endTime || '',
      formatType: showtime.formatType || '_2D',
      subtitleLanguage: showtime.subtitleLanguage || 'Vietnamese',
      basePrice: showtime.basePrice?.toString() || '',
      status: showtime.status || 'SCHEDULED'
    });
    setShowModal(true);
  };

  // Handle delete showtime
  const handleDelete = async (showtimeId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/admin/${showtimeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể xóa suất chiếu');

      toast.success('Xóa suất chiếu thành công');
      fetchShowtimesByCinema();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể xóa suất chiếu');
    }
  };

  // Handle submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/showtimes/admin`
        : `${API_BASE_URL}/showtimes/admin/${selectedShowtime.showtimeId}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          movieId: parseInt(formData.movieId),
          cinemaId: parseInt(formData.cinemaId),
          hallId: parseInt(formData.hallId),
          basePrice: parseFloat(formData.basePrice)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      toast.success(modalMode === 'create' ? 'Tạo suất chiếu thành công' : 'Cập nhật suất chiếu thành công');
      setShowModal(false);
      fetchShowtimesByCinema();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'N/A';
    return `${date} ${time}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="manager-showtime-management">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1><FaClock /> Quản Lý Suất Chiếu</h1>
          <p>Quản lý lịch chiếu phim cho các rạp của bạn</p>
        </div>
        <button className="create-btn" onClick={handleCreate}>
          <FaPlus /> Thêm Suất Chiếu
        </button>
      </div>

      {/* Cinema Selector */}
      <div className="cinema-selector">
        <label><FaTheaterMasks /> Chọn rạp:</label>
        <select 
          value={selectedCinema} 
          onChange={(e) => {
            setSelectedCinema(e.target.value);
            setPage(0);
          }}
          className="cinema-select"
        >
          <option value="">-- Chọn rạp --</option>
          {Array.isArray(myCinemas) && myCinemas.map(cinema => (
            <option key={cinema.cinemaId} value={cinema.cinemaId}>
              {cinema.cinemaName}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {!selectedCinema ? (
            <div className="empty-state">
              <FaTheaterMasks style={{ fontSize: '64px', color: '#e2e8f0', marginBottom: '16px' }} />
              <h3>Vui lòng chọn rạp để xem suất chiếu</h3>
              <p>Chọn rạp từ danh sách trên để quản lý suất chiếu</p>
            </div>
          ) : showtimes.length === 0 ? (
            <div className="empty-state">
              <FaClock style={{ fontSize: '64px', color: '#e2e8f0', marginBottom: '16px' }} />
              <h3>Chưa có suất chiếu nào</h3>
              <p>Nhấn "Thêm Suất Chiếu" để tạo suất chiếu mới</p>
            </div>
          ) : (
            <>
              <div className="showtimes-table-container">
                <table className="showtimes-table">
                  <thead>
                    <tr>
                      <th>Phim</th>
                      <th>Phòng chiếu</th>
                      <th>Ngày chiếu</th>
                      <th>Giờ chiếu</th>
                      <th>Định dạng</th>
                      <th>Giá vé</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {showtimes.map(showtime => (
                      <tr key={showtime.showtimeId}>
                        <td>
                          <div className="movie-info">
                            {showtime.moviePosterUrl ? (
                              <img 
                                src={showtime.moviePosterUrl} 
                                alt={showtime.movieTitle}
                                className="movie-poster"
                              />
                            ) : (
                              <div className="movie-poster-placeholder">
                                <FaFilm />
                              </div>
                            )}
                            <span className="movie-title">{showtime.movieTitle || 'N/A'}</span>
                          </div>
                        </td>
                        <td>{showtime.hallName || 'N/A'}</td>
                        <td>{showtime.showDate || 'N/A'}</td>
                        <td>{showtime.startTime} - {showtime.endTime}</td>
                        <td>
                          <span className={`badge format-${showtime.formatType}`}>
                            {showtime.formatType || 'N/A'}
                          </span>
                        </td>
                        <td>{formatCurrency(showtime.basePrice || 0)}</td>
                        <td>
                          <span className={`badge status-${showtime.status}`}>
                            {showtime.status || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="action-btn edit"
                              onClick={() => handleEdit(showtime)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button
                              className="action-btn delete"
                              onClick={() => handleDelete(showtime.showtimeId)}
                              title="Xóa"
                            >
                              <FaTrash /> Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    ← Trước
                  </button>
                  
                  <span className="page-info">
                    Trang {page + 1} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    Sau →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalMode === 'create' ? '✨ Thêm Suất Chiếu Mới' : '✏️ Chỉnh Sửa Suất Chiếu'}
              </h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Phim *</label>
                  <select
                    value={formData.movieId}
                    onChange={(e) => setFormData({...formData, movieId: e.target.value})}
                    required
                  >
                    <option value="">-- Chọn phim --</option>
                    {Array.isArray(movies) && movies.map(movie => (
                      <option key={movie.movieId} value={movie.movieId}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Phòng chiếu *</label>
                  <select
                    value={formData.hallId}
                    onChange={(e) => setFormData({...formData, hallId: e.target.value})}
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {Array.isArray(halls) && halls.map(hall => (
                      <option key={hall.hallId} value={hall.hallId}>
                        {hall.hallName} ({hall.totalSeats} ghế)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                <div className="form-group">
                  <label>Ngày chiếu *</label>
                  <input
                    type="date"
                    value={formData.showDate}
                    onChange={(e) => setFormData({...formData, showDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giờ bắt đầu *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Giờ kết thúc *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Định dạng *</label>
                  <select
                    value={formData.formatType}
                    onChange={(e) => setFormData({...formData, formatType: e.target.value})}
                    required
                  >
                    <option value="_2D">2D</option>
                    <option value="_3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="IMAX_3D">IMAX 3D</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Phụ đề *</label>
                  <select
                    value={formData.subtitleLanguage}
                    onChange={(e) => setFormData({...formData, subtitleLanguage: e.target.value})}
                    required
                  >
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">English</option>
                    <option value="None">Không phụ đề</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Giá vé (VNĐ) *</label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
                    min="0"
                    step="1000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Trạng thái *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  required
                >
                  <option value="SCHEDULED">Đã lên lịch</option>
                  <option value="AVAILABLE">Có thể đặt</option>
                  <option value="FULL">Hết chỗ</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
              </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : (modalMode === 'create' ? '✨ Tạo mới' : '💾 Cập nhật')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerShowtimeManagement;

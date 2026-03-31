import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSave,
  FaSpinner,
  FaFilm,
  FaClock,
  FaCalendarAlt,
  FaChair,
  FaBuilding,
} from 'react-icons/fa';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import './ShowtimeManagement.css';

const ShowtimeManagement = () => {
  const navigate = useNavigate();
  
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailShowtime, setDetailShowtime] = useState(null);
  const [listTick, setListTick] = useState(0);
  const initialListFetchRef = useRef(true);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const authHeaders = useMemo(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const bumpList = useCallback(() => setListTick((t) => t + 1), []);

  const fetchShowtimes = useCallback(async () => {
    if (!token) {
      setLoading(false);
      navigate('/login');
      return;
    }
    if (initialListFetchRef.current) setLoading(true);
    try {
      const url = `${API_BASE_URL}/showtimes?page=${page}&size=10`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách suất chiếu');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 0);
        if (typeof result.data.currentPage === 'number') {
          setPage(result.data.currentPage);
        }
      }
    } catch {
      toast.error('Có lỗi xảy ra khi tải danh sách suất chiếu');
    } finally {
      setLoading(false);
      initialListFetchRef.current = false;
    }
  }, [token, page, API_BASE_URL, navigate]);

  const fetchMovies = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/movies?status=NOW_SHOWING&page=0&size=100`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      const result = await response.json();
      if (result.success && result.data) {
        setMovies(result.data.content || []);
      }
    } catch {
      /* dropdown */
    }
  }, [token, API_BASE_URL]);

  const fetchCinemas = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/admin/all?page=0&size=100`, {
        method: 'GET',
        headers: authHeaders,
      });
      const result = await response.json();
      if (result.success && result.data) {
        const activeCinemas = (result.data.data || []).filter((c) => c.isActive === true);
        setCinemas(activeCinemas);
      }
    } catch {
      /* dropdown */
    }
  }, [token, API_BASE_URL, authHeaders]);

  const fetchHalls = useCallback(
    async (cinemaId) => {
      if (!token || !cinemaId) {
        setHalls([]);
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/cinema-halls/cinema/${cinemaId}/admin?page=0&size=100`,
          {
            method: 'GET',
            headers: authHeaders,
          }
        );
        const result = await response.json();
        if (result.success && result.data) {
          const activeHalls = (result.data.data || []).filter((h) => h.isActive === true);
          setHalls(activeHalls);
        }
      } catch {
        setHalls([]);
      }
    },
    [token, API_BASE_URL, authHeaders]
  );

  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    fetchMovies();
    fetchCinemas();
  }, [token, fetchMovies, fetchCinemas]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes, listTick]);

  const filteredShowtimes = useMemo(() => {
    const q = (searchTerm || '').trim().toLowerCase();
    if (!q) return showtimes;
    return showtimes.filter((s) => {
      const t = (x) => (x != null ? String(x).toLowerCase() : '');
      return (
        t(s.movieTitle).includes(q) ||
        t(s.cinemaName).includes(q) ||
        t(s.hallName).includes(q)
      );
    });
  }, [showtimes, searchTerm]);

  const anyModalOpen = showModal || showDetailModal;
  useEffect(() => {
    if (!anyModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showDetailModal) setShowDetailModal(false);
        else if (showModal) {
          setShowModal(false);
          setSelectedShowtime(null);
          setHalls([]);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [anyModalOpen, showModal, showDetailModal]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
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
    setHalls([]);
    setShowModal(true);
  };

  const handleOpenEditModal = (showtime) => {
    setModalMode('edit');
    setSelectedShowtime(showtime);
    setFormData({
      movieId: showtime.movieId || '',
      cinemaId: showtime.cinemaId || '',
      hallId: showtime.hallId || '',
      showDate: showtime.showDate || '',
      startTime: showtime.startTime || '',
      endTime: showtime.endTime || '',
      formatType: showtime.formatType || '_2D',
      subtitleLanguage: showtime.subtitleLanguage || 'Vietnamese',
      basePrice: showtime.basePrice || '',
      status: showtime.status || 'SCHEDULED'
    });
    
    // Fetch halls for the selected cinema
    if (showtime.cinemaId) {
      fetchHalls(showtime.cinemaId);
    }
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedShowtime(null);
    setHalls([]);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // When cinema changes, fetch halls
    if (name === 'cinemaId' && value) {
      fetchHalls(value);
      setFormData(prev => ({
        ...prev,
        hallId: '' // Reset hall selection
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      handleCreateShowtime();
    } else {
      handleUpdateShowtime();
    }
  };

  const handleCreateShowtime = async () => {
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!formData.movieId || !formData.hallId || !formData.showDate || !formData.startTime) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        setSubmitting(false);
        return;
      }

      // Normalize formatType - ensure it has underscore prefix for 2D, 3D, 4DX
      let normalizedFormatType = formData.formatType;
      if (normalizedFormatType && !normalizedFormatType.startsWith('_') && 
          (normalizedFormatType === '2D' || normalizedFormatType === '3D' || normalizedFormatType === '4DX')) {
        normalizedFormatType = '_' + normalizedFormatType;
      }

      const requestData = {
        movieId: parseInt(formData.movieId),
        hallId: parseInt(formData.hallId),
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        formatType: normalizedFormatType,
        subtitleLanguage: formData.subtitleLanguage,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        status: formData.status
      };

      const response = await fetch(`${API_BASE_URL}/showtimes/admin`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Tạo suất chiếu thành công!');

        if (result.data) {
          setDetailShowtime(result.data);
          setShowDetailModal(true);
        }

        handleCloseModal();
        bumpList();
      } else {
        toast.error(result.message || 'Tạo suất chiếu thất bại!');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi tạo suất chiếu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateShowtime = async () => {
    try {
      setSubmitting(true);
      
      // Normalize formatType - ensure it has underscore prefix for 2D, 3D, 4DX
      let normalizedFormatType = formData.formatType;
      if (normalizedFormatType && !normalizedFormatType.startsWith('_') && 
          (normalizedFormatType === '2D' || normalizedFormatType === '3D' || normalizedFormatType === '4DX')) {
        normalizedFormatType = '_' + normalizedFormatType;
      }
      
      const requestData = {
        showtimeId: selectedShowtime.showtimeId,
        movieId: parseInt(formData.movieId),
        hallId: parseInt(formData.hallId),
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        formatType: normalizedFormatType,
        subtitleLanguage: formData.subtitleLanguage,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        status: formData.status
      };

      const response = await fetch(`${API_BASE_URL}/showtimes/admin/${selectedShowtime.showtimeId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Cập nhật suất chiếu thành công!');

        if (result.data) {
          setDetailShowtime(result.data);
          setShowDetailModal(true);
        }

        handleCloseModal();
        bumpList();
      } else {
        toast.error(result.message || 'Cập nhật suất chiếu thất bại!');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật suất chiếu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/admin/${showtimeId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Xóa suất chiếu thành công!');
        bumpList();
      } else {
        toast.error(result.message || 'Xóa suất chiếu thất bại!');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi xóa suất chiếu');
    }
  };

  const formatCurrency = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: { label: 'Đã lên lịch', class: 'adm-st__pill adm-st__pill--info' },
      SELLING: { label: 'Đang bán vé', class: 'adm-st__pill adm-st__pill--ok' },
      SOLD_OUT: { label: 'Hết vé', class: 'adm-st__pill adm-st__pill--bad' },
      CANCELLED: { label: 'Đã hủy', class: 'adm-st__pill adm-st__pill--muted' },
    };
    const statusInfo = statusMap[status] || {
      label: status,
      class: 'adm-st__pill adm-st__pill--muted',
    };
    return <span className={statusInfo.class}>{statusInfo.label}</span>;
  };

  return (
    <div className="adm-st">
      <div className="adm-st__hero">
        <div className="adm-st__hero-titles">
          <h1 className="adm-st__title">
            <FaFilm /> Quản Lý Suất Chiếu
          </h1>
          <p className="adm-st__lead">Quản lý lịch chiếu phim của tất cả các rạp</p>
        </div>
        <button
          type="button"
          className="adm-st__btn adm-st__btn--primary"
          onClick={handleOpenCreateModal}
        >
          <FaPlus /> Thêm Suất Chiếu
        </button>
      </div>

      <div className="adm-st__toolbar">
        <div className="adm-st__search">
          <FaSearch className="adm-st__search-ico" />
          <input
            type="text"
            className="adm-st__search-input"
            placeholder="Tìm kiếm theo tên phim, rạp..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {loading && showtimes.length === 0 ? (
        <div className="adm-st__state">
          <div className="adm-st__spin" />
          <span className="adm-st__state-txt">Đang tải dữ liệu</span>
        </div>
      ) : showtimes.length === 0 ? (
        <div className="adm-st__empty">
          <FaFilm className="adm-st__empty-ico" />
          <p>Không có suất chiếu nào</p>
          <button
            type="button"
            className="adm-st__btn adm-st__btn--primary"
            onClick={handleOpenCreateModal}
          >
            <FaPlus /> Thêm Suất Chiếu Đầu Tiên
          </button>
        </div>
      ) : filteredShowtimes.length === 0 ? (
        <div className="adm-st__empty">
          <FaSearch className="adm-st__empty-ico" />
          <p>Không có suất chiếu khớp tìm kiếm trên trang này</p>
        </div>
      ) : (
        <>
          <div
            className={`adm-st__table-wrap${loading && showtimes.length > 0 ? ' adm-st__table-wrap--busy' : ''}`}
            aria-busy={loading && showtimes.length > 0}
          >
            <table className="adm-st__table">
              <thead>
                <tr>
                  <th>Phim</th>
                  <th>Rạp / Phòng</th>
                  <th>Ngày</th>
                  <th>Giờ</th>
                  <th>Định dạng</th>
                  <th>Trạng thái</th>
                  <th>Ghế trống</th>
                  <th>Giá vé</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredShowtimes.map((showtime) => (
                  <tr key={showtime.showtimeId}>
                    <td>
                      <div className="adm-st__film">
                        <div className="adm-st__thumb">
                          {showtime.moviePosterUrl ? (
                            <img src={showtime.moviePosterUrl} alt="" />
                          ) : (
                            <div className="adm-st__thumb-ph" aria-hidden>
                              <FaFilm />
                            </div>
                          )}
                        </div>
                        <span className="adm-st__film-title">{showtime.movieTitle}</span>
                      </div>
                    </td>
                    <td>
                      <div className="adm-st__venue">
                        <span className="adm-st__cinema">{showtime.cinemaName}</span>
                        <span className="adm-st__hall">{showtime.hallName}</span>
                      </div>
                    </td>
                    <td className="adm-st__cell-num">
                      {showtime.showDate
                        ? new Date(showtime.showDate).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td className="adm-st__cell-num">
                      <span className="adm-st__time-range">
                        {showtime.startTime}
                        {showtime.endTime ? ` – ${showtime.endTime}` : ''}
                      </span>
                    </td>
                    <td>
                      <span className="adm-st__tag">
                        {String(showtime.formatType || '').replace('_', '')}
                      </span>
                      <span className="adm-st__subtag">{showtime.subtitleLanguage}</span>
                    </td>
                    <td className="adm-st__cell-status">{getStatusBadge(showtime.status)}</td>
                    <td>
                      <span
                        className={
                          (showtime.availableSeats ?? 0) > 0 ? 'adm-st__seats-ok' : 'adm-st__seats-full'
                        }
                      >
                        {showtime.availableSeats ?? 0}
                      </span>
                    </td>
                    <td className="adm-st__cell-price">{formatCurrency(showtime.basePrice)}</td>
                    <td>
                      <div className="adm-st__actions adm-st__actions--row">
                        <button
                          type="button"
                          className="adm-st__btn adm-st__btn--info adm-st__btn--sm"
                          onClick={() => handleOpenEditModal(showtime)}
                          title="Chỉnh sửa"
                          aria-label="Chỉnh sửa suất chiếu"
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="adm-st__btn adm-st__btn--danger adm-st__btn--sm"
                          onClick={() => handleDeleteShowtime(showtime.showtimeId)}
                          title="Xóa"
                          aria-label="Xóa suất chiếu"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="adm-st__pager">
            <div className="adm-st__pager-info">
              Hiển thị {filteredShowtimes.length} / {showtimes.length} suất trên trang ({totalElements} tổng)
            </div>
            <div className="adm-st__pager-btns">
              <button
                type="button"
                className="adm-st__btn adm-st__btn--ghost adm-st__btn--sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Trước
              </button>
              <span className="adm-st__pager-ind">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <button
                type="button"
                className="adm-st__btn adm-st__btn--ghost adm-st__btn--sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1}
              >
                Tiếp →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div
          className="adm-st__modal"
          role="presentation"
        >
          <div
            className="adm-st__panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-st__panel-head">
              <h2>{modalMode === 'create' ? 'Thêm Suất Chiếu Mới' : 'Chỉnh Sửa Suất Chiếu'}</h2>
              <button type="button" className="adm-st__panel-x" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form className="adm-st__form" onSubmit={handleSubmit}>
              <div className="adm-st__form-row">
                <div className="adm-st__field">
                  <label>Phim <span className="adm-st__req">*</span></label>
                  <select
                    name="movieId"
                    value={formData.movieId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Chọn phim --</option>
                    {movies.map(movie => (
                      <option key={movie.movieId} value={movie.movieId}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adm-st__form-row">
                <div className="adm-st__field">
                  <label>Rạp Chiếu <span className="adm-st__req">*</span></label>
                  <select
                    name="cinemaId"
                    value={formData.cinemaId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Chọn rạp --</option>
                    {cinemas.map(cinema => (
                      <option key={cinema.cinemaId} value={cinema.cinemaId}>
                        {cinema.cinemaName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-st__field">
                  <label>Phòng Chiếu <span className="adm-st__req">*</span></label>
                  <select
                    name="hallId"
                    value={formData.hallId}
                    onChange={handleFormChange}
                    required
                    disabled={!formData.cinemaId}
                  >
                    <option value="">-- Chọn phòng --</option>
                    {halls.map(hall => (
                      <option key={hall.hallId} value={hall.hallId}>
                        {hall.hallName} ({hall.totalSeats} ghế)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="adm-st__form-row">
                <div className="adm-st__field">
                  <label>Ngày Chiếu <span className="adm-st__req">*</span></label>
                  <input
                    type="date"
                    name="showDate"
                    value={formData.showDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="adm-st__field">
                  <label>Giờ Bắt Đầu <span className="adm-st__req">*</span></label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="adm-st__form-row">
                <div className="adm-st__field">
                  <label>Giờ Kết Thúc</label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="adm-st__field">
                  <label>Giá Vé (VNĐ)</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleFormChange}
                    placeholder="95000"
                    step="1000"
                  />
                </div>
              </div>

              <div className="adm-st__form-row">
                <div className="adm-st__field">
                  <label>Định Dạng</label>
                  <select
                    name="formatType"
                    value={formData.formatType}
                    onChange={handleFormChange}
                  >
                    <option value="_2D">2D</option>
                    <option value="_3D">3D</option>
                    <option value="IMAX">IMAX</option>
                    <option value="_4DX">4DX</option>
                  </select>
                </div>
                <div className="adm-st__field">
                  <label>Phụ Đề</label>
                  <select
                    name="subtitleLanguage"
                    value={formData.subtitleLanguage}
                    onChange={handleFormChange}
                  >
                    <option value="Vietnamese">Tiếng Việt</option>
                    <option value="English">English</option>
                    <option value="Korean">한국어</option>
                    <option value="Japanese">日本語</option>
                    <option value="Chinese">中文</option>
                  </select>
                </div>
              </div>

              <div className="adm-st__form-row">
                <div className="adm-st__field">
                  <label>Trạng Thái <span className="adm-st__req">*</span></label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="SCHEDULED">Đã lên lịch</option>
                    <option value="SELLING">Đang bán vé</option>
                    <option value="SOLD_OUT">Hết vé</option>
                    <option value="CANCELLED">Đã hủy</option>
                  </select>
                </div>
              </div>

              <div className="adm-st__form-actions">
                <button
                  type="button"
                  className="adm-st__btn adm-st__btn--ghost"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  <FaTimes /> Hủy
                </button>
                <button
                  type="submit"
                  className="adm-st__btn adm-st__btn--primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="adm-st__spin-sm" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaSave /> {modalMode === 'create' ? 'Tạo Suất Chiếu' : 'Cập Nhật'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailShowtime && (
        <div
          className="adm-st__modal"
          role="presentation"
        >
          <div
            className="adm-st__panel adm-st__panel--detail"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="adm-st__detail-x"
              onClick={() => setShowDetailModal(false)}
            >
              <FaTimes />
            </button>

            <div className="adm-st__detail-hero">
              <div
                className="adm-st__detail-hero-bg"
                style={{
                  backgroundImage: detailShowtime.moviePosterUrl
                    ? `url(${detailShowtime.moviePosterUrl})`
                    : undefined,
                }}
              />
              <div className="adm-st__detail-hero-inner">
                {detailShowtime.moviePosterUrl && (
                  <img
                    src={detailShowtime.moviePosterUrl}
                    alt={detailShowtime.movieTitle}
                    className="adm-st__detail-poster"
                  />
                )}
                <div className="adm-st__detail-titles">
                  <h2 className="adm-st__detail-title">{detailShowtime.movieTitle}</h2>
                  <div className="adm-st__detail-tags">
                    <span className="adm-st__detail-tag">
                      {String(detailShowtime.formatType || '').replace('_', '')}
                    </span>
                    <span className="adm-st__detail-tag adm-st__detail-tag--muted">
                      {detailShowtime.subtitleLanguage}
                    </span>
                    {getStatusBadge(detailShowtime.status)}
                  </div>
                </div>
              </div>
            </div>

            <div className="adm-st__detail-body">
              <div className="adm-st__detail-grid">
                <div className="adm-st__detail-card">
                  <FaBuilding className="adm-st__detail-ico" />
                  <div>
                    <span className="adm-st__detail-lbl">Rạp chiếu</span>
                    <span className="adm-st__detail-val">{detailShowtime.cinemaName}</span>
                  </div>
                </div>
                <div className="adm-st__detail-card">
                  <FaChair className="adm-st__detail-ico" />
                  <div>
                    <span className="adm-st__detail-lbl">Phòng chiếu</span>
                    <span className="adm-st__detail-val">{detailShowtime.hallName}</span>
                  </div>
                </div>
                <div className="adm-st__detail-card">
                  <FaCalendarAlt className="adm-st__detail-ico" />
                  <div>
                    <span className="adm-st__detail-lbl">Ngày chiếu</span>
                    <span className="adm-st__detail-val">
                      {new Date(detailShowtime.showDate).toLocaleDateString('vi-VN', {
                        weekday: 'short',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="adm-st__detail-card">
                  <FaClock className="adm-st__detail-ico" />
                  <div>
                    <span className="adm-st__detail-lbl">Giờ chiếu</span>
                    <span className="adm-st__detail-val">
                      {detailShowtime.startTime?.substring(0, 5)} -{' '}
                      {detailShowtime.endTime?.substring(0, 5)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="adm-st__detail-foot">
                <div className="adm-st__detail-seats">
                  <span className="adm-st__detail-seat-num">{detailShowtime.availableSeats}</span>
                  <span className="adm-st__detail-seat-lbl">ghế trống</span>
                </div>
                <div className="adm-st__detail-pricebox">
                  <span className="adm-st__detail-price-lbl">Giá vé</span>
                  <span className="adm-st__detail-price-val">
                    {formatCurrency(detailShowtime.basePrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowtimeManagement;

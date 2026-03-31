import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaFilm,
  FaClock,
  FaTheaterMasks,
} from 'react-icons/fa';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import './ManagerShowtimeManagement.css';

const ManagerShowtimeManagement = () => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [myCinemas, setMyCinemas] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
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
    status: 'SCHEDULED',
  });
  const [submitting, setSubmitting] = useState(false);
  const [listTick, setListTick] = useState(0);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const authHeaders = useMemo(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const bumpList = () => setListTick((t) => t + 1);

  const fetchMyCinemas = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/my-cinemas`, {
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể tải danh sách rạp');
      const data = await response.json();
      if (data.success && data.data) {
        const cinemaList = data.data.data || [];
        setMyCinemas(cinemaList);
        if (cinemaList.length > 0 && cinemaList[0].cinemaId) {
          setSelectedCinema((prev) => prev || String(cinemaList[0].cinemaId));
        }
      } else {
        setMyCinemas([]);
      }
    } catch {
      toast.error('Không thể tải danh sách rạp của bạn');
      setMyCinemas([]);
    }
  }, [token, API_BASE_URL, authHeaders, navigate]);

  const fetchShowtimesByCinema = useCallback(async () => {
    if (!token || !selectedCinema) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/showtimes/manager/my-showtimes?page=${page}&size=10&cinemaId=${selectedCinema}`,
        { headers: authHeaders }
      );
      if (!response.ok) {
        let msg = 'Không thể tải suất chiếu';
        try {
          const err = await response.json();
          msg = err.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setShowtimes(result.data.data || []);
        setTotalPages(result.data.totalPages ?? 0);
      } else {
        toast.error(result.message || 'Không thể tải suất chiếu');
        setShowtimes([]);
      }
    } catch {
      toast.error('Không thể tải danh sách suất chiếu');
      setShowtimes([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedCinema, page, API_BASE_URL, authHeaders]);

  const fetchMovies = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/movies?status=NOW_SHOWING`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Không thể tải danh sách phim');
      const data = await response.json();
      if (data.data) {
        const movieList = data.data.content || data.data;
        setMovies(Array.isArray(movieList) ? movieList : []);
      } else {
        setMovies([]);
      }
    } catch {
      setMovies([]);
    }
  }, [API_BASE_URL]);

  const fetchHallsForCinema = useCallback(
    async (cinemaId) => {
      if (!token || !cinemaId) {
        setHalls([]);
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/cinema-halls/manager/my-halls?cinemaId=${cinemaId}`,
          { headers: authHeaders }
        );
        if (!response.ok) throw new Error('Không thể tải danh sách phòng chiếu');
        const data = await response.json();
        if (data.success && data.data) {
          setHalls(data.data.data || []);
        } else {
          setHalls([]);
        }
      } catch {
        toast.error('Không thể tải danh sách phòng chiếu');
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
    fetchMyCinemas();
    fetchMovies();
  }, [token, fetchMyCinemas, fetchMovies]);

  useEffect(() => {
    if (!selectedCinema) return;
    fetchShowtimesByCinema();
  }, [selectedCinema, fetchShowtimesByCinema, listTick]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedShowtime(null);
  }, []);

  useEffect(() => {
    if (!showModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showModal, closeModal]);

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
      status: 'SCHEDULED',
    });
    fetchHallsForCinema(selectedCinema);
    setShowModal(true);
  };

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
      status: showtime.status || 'SCHEDULED',
    });
    setShowModal(true);
  };

  const handleDelete = async (showtimeId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/showtimes/admin/${showtimeId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể xóa suất chiếu');
      toast.success('Xóa suất chiếu thành công');
      bumpList();
    } catch {
      toast.error('Không thể xóa suất chiếu');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let normalizedFormat = formData.formatType;
      if (
        normalizedFormat &&
        !normalizedFormat.startsWith('_') &&
        (normalizedFormat === '2D' || normalizedFormat === '3D' || normalizedFormat === '4DX')
      ) {
        normalizedFormat = `_${normalizedFormat}`;
      }
      const url =
        modalMode === 'create'
          ? `${API_BASE_URL}/showtimes/admin`
          : `${API_BASE_URL}/showtimes/admin/${selectedShowtime.showtimeId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const body = {
        movieId: parseInt(formData.movieId, 10),
        cinemaId: parseInt(formData.cinemaId, 10),
        hallId: parseInt(formData.hallId, 10),
        showDate: formData.showDate,
        startTime: formData.startTime,
        endTime: formData.endTime || null,
        formatType: normalizedFormat,
        subtitleLanguage: formData.subtitleLanguage,
        basePrice: parseFloat(formData.basePrice),
        status: formData.status,
      };
      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }
      toast.success(
        modalMode === 'create' ? 'Tạo suất chiếu thành công' : 'Cập nhật suất chiếu thành công'
      );
      closeModal();
      bumpList();
    } catch (error) {
      toast.error(error.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatTypeLabel = (ft) => (ft ? String(ft).replace(/^_/, '') : 'N/A');

  return (
    <div className="adm-msm">
      <div className="adm-msm__hero">
        <div className="adm-msm__titles">
          <h1 className="adm-msm__title">
            <FaClock /> Quản lý suất chiếu
          </h1>
          <p className="adm-msm__sub">Quản lý lịch chiếu phim cho các rạp của bạn</p>
        </div>
        <button type="button" className="adm-msm__btn adm-msm__btn--primary" onClick={handleCreate}>
          <FaPlus /> Thêm suất chiếu
        </button>
      </div>

      <div className="adm-msm__select-bar">
        <label className="adm-msm__select-lbl">
          <FaTheaterMasks /> Chọn rạp
        </label>
        <select
          className="adm-msm__select"
          value={selectedCinema}
          onChange={(e) => {
            setSelectedCinema(e.target.value);
            setPage(0);
          }}
        >
          <option value="">-- Chọn rạp --</option>
          {Array.isArray(myCinemas) &&
            myCinemas.map((cinema) => (
              <option key={cinema.cinemaId} value={String(cinema.cinemaId)}>
                {cinema.cinemaName}
              </option>
            ))}
        </select>
      </div>

      {loading ? (
        <div className="adm-msm__state">
          <div className="adm-msm__spin" />
          <p className="adm-msm__muted">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {!selectedCinema ? (
            <div className="adm-msm__empty">
              <FaTheaterMasks className="adm-msm__empty-ico" />
              <h3>Vui lòng chọn rạp để xem suất chiếu</h3>
              <p className="adm-msm__muted">Chọn rạp từ danh sách trên để quản lý suất chiếu</p>
            </div>
          ) : showtimes.length === 0 ? (
            <div className="adm-msm__empty">
              <FaClock className="adm-msm__empty-ico" />
              <h3>Chưa có suất chiếu nào</h3>
              <p className="adm-msm__muted">Nhấn &quot;Thêm suất chiếu&quot; để tạo suất chiếu mới</p>
            </div>
          ) : (
            <>
              <div className="adm-msm__table-wrap">
                <table className="adm-msm__table">
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
                    {showtimes.map((showtime) => (
                      <tr key={showtime.showtimeId}>
                        <td>
                          <div className="adm-msm__movie">
                            {showtime.moviePosterUrl ? (
                              <img
                                src={showtime.moviePosterUrl}
                                alt=""
                                className="adm-msm__thumb"
                              />
                            ) : (
                              <div className="adm-msm__thumb-ph">
                                <FaFilm />
                              </div>
                            )}
                            <span>{showtime.movieTitle || 'N/A'}</span>
                          </div>
                        </td>
                        <td>{showtime.hallName || 'N/A'}</td>
                        <td>{showtime.showDate || 'N/A'}</td>
                        <td>
                          {showtime.startTime} - {showtime.endTime}
                        </td>
                        <td>
                          <span className="adm-msm__tag">{formatTypeLabel(showtime.formatType)}</span>
                        </td>
                        <td>{formatCurrency(showtime.basePrice || 0)}</td>
                        <td>
                          <span className="adm-msm__pill adm-msm__pill--stat">{showtime.status || 'N/A'}</span>
                        </td>
                        <td>
                          <div className="adm-msm__actions">
                            <button
                              type="button"
                              className="adm-msm__icon-btn adm-msm__icon-btn--edit"
                              onClick={() => handleEdit(showtime)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit /> Sửa
                            </button>
                            <button
                              type="button"
                              className="adm-msm__icon-btn adm-msm__icon-btn--danger"
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

              {totalPages > 1 && (
                <div className="adm-msm__pager">
                  <button
                    type="button"
                    className="adm-msm__pager-btn"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    ← Trước
                  </button>
                  <span className="adm-msm__pager-info">
                    Trang {page + 1} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="adm-msm__pager-btn"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
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

      {showModal && (
        <div className="adm-msm__modal" role="presentation">
          <div
            className="adm-msm__panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-msm__panel-head">
              <h2>
                {modalMode === 'create' ? 'Thêm suất chiếu mới' : 'Chỉnh sửa suất chiếu'}
              </h2>
              <button type="button" className="adm-msm__panel-x" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="adm-msm__form">
                <div className="adm-msm__field">
                  <label>Phim *</label>
                  <select
                    value={formData.movieId}
                    onChange={(e) => setFormData({ ...formData, movieId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn phim --</option>
                    {Array.isArray(movies) &&
                      movies.map((movie) => (
                        <option key={movie.movieId} value={movie.movieId}>
                          {movie.title}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="adm-msm__field">
                  <label>Phòng chiếu *</label>
                  <select
                    value={formData.hallId}
                    onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                    required
                  >
                    <option value="">-- Chọn phòng --</option>
                    {Array.isArray(halls) &&
                      halls.map((hall) => (
                        <option key={hall.hallId} value={hall.hallId}>
                          {hall.hallName} ({hall.totalSeats} ghế)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="adm-msm__form-row">
                  <div className="adm-msm__field">
                    <label>Ngày chiếu *</label>
                    <input
                      type="date"
                      value={formData.showDate}
                      onChange={(e) => setFormData({ ...formData, showDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-msm__field">
                    <label>Giờ bắt đầu *</label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-msm__field">
                    <label>Giờ kết thúc *</label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="adm-msm__form-row">
                  <div className="adm-msm__field">
                    <label>Định dạng *</label>
                    <select
                      value={formData.formatType}
                      onChange={(e) => setFormData({ ...formData, formatType: e.target.value })}
                      required
                    >
                      <option value="_2D">2D</option>
                      <option value="_3D">3D</option>
                      <option value="IMAX">IMAX</option>
                      <option value="IMAX_3D">IMAX 3D</option>
                    </select>
                  </div>
                  <div className="adm-msm__field">
                    <label>Phụ đề *</label>
                    <select
                      value={formData.subtitleLanguage}
                      onChange={(e) =>
                        setFormData({ ...formData, subtitleLanguage: e.target.value })
                      }
                      required
                    >
                      <option value="Vietnamese">Tiếng Việt</option>
                      <option value="English">English</option>
                      <option value="None">Không phụ đề</option>
                    </select>
                  </div>
                  <div className="adm-msm__field">
                    <label>Giá vé (VNĐ) *</label>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                      min="0"
                      step="1000"
                      required
                    />
                  </div>
                </div>

                <div className="adm-msm__field">
                  <label>Trạng thái *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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

              <div className="adm-msm__panel-foot">
                <button
                  type="button"
                  className="adm-msm__btn adm-msm__btn--ghost"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button type="submit" className="adm-msm__btn adm-msm__btn--primary" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
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

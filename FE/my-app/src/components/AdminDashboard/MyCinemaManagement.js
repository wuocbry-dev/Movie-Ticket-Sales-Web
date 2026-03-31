import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSave,
  FaSpinner,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaFilm,
} from 'react-icons/fa';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './MyCinemaManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const PAGE_SIZE = 10;

const emptyForm = () => ({
  cinemaName: '',
  address: '',
  city: '',
  district: '',
  phoneNumber: '',
  email: '',
  taxCode: '',
  legalName: '',
  latitude: '',
  longitude: '',
  openingHours: '',
  facilities: '',
});

const MyCinemaManagement = () => {
  const navigate = useNavigate();
  const token = Cookies.get('accessToken');

  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [listTick, setListTick] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [formData, setFormData] = useState(() => emptyForm());
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const fetchMyCinemas = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
      });
      const response = await fetch(`${API_BASE_URL}/cinemas/my-cinemas?${params}`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const errText = await response.text();
        throw new Error(errText || `HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages ?? 0);
        setTotalElements(result.data.totalElements ?? 0);
        if (typeof result.data.currentPage === 'number') {
          setPage(result.data.currentPage);
        }
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách');
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [token, page, searchTerm, navigate, authHeaders]);

  useEffect(() => {
    fetchMyCinemas();
  }, [fetchMyCinemas, listTick]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenEditModal = (cinema) => {
    setModalMode('edit');
    const oh = cinema.openingHours;
    const fac = cinema.facilities;
    setFormData({
      cinemaName: cinema.cinemaName,
      address: cinema.address || '',
      city: cinema.city || '',
      district: cinema.district || '',
      phoneNumber: cinema.phoneNumber || '',
      email: cinema.email || '',
      taxCode: cinema.taxCode || '',
      legalName: cinema.legalName || '',
      latitude: cinema.latitude != null ? String(cinema.latitude) : '',
      longitude: cinema.longitude != null ? String(cinema.longitude) : '',
      openingHours: typeof oh === 'object' && oh !== null ? JSON.stringify(oh) : oh || '',
      facilities: typeof fac === 'object' && fac !== null ? JSON.stringify(fac) : fac || '',
    });
    setIsActive(cinema.isActive);
    setSelectedCinema(cinema);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedCinema(null);
    setFormData(emptyForm());
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!showModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [showModal, closeModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.cinemaName.trim()) {
      toast.error('Tên rạp không được để trống');
      return;
    }
    if (modalMode === 'create') {
      toast.info('Chỉ SYSTEM_ADMIN mới có thể tạo rạp mới');
      return;
    }

    setSubmitting(true);
    try {
      let openingHours = formData.openingHours;
      let facilities = formData.facilities;
      try {
        if (openingHours && openingHours.trim().startsWith('{')) {
          openingHours = JSON.parse(openingHours);
        }
      } catch {
        /* giữ chuỗi */
      }
      try {
        if (facilities && facilities.trim().startsWith('{')) {
          facilities = JSON.parse(facilities);
        }
      } catch {
        /* giữ chuỗi */
      }

      const body = {
        cinemaId: selectedCinema.cinemaId,
        chainId: selectedCinema.chainId,
        cinemaName: formData.cinemaName,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        taxCode: formData.taxCode,
        legalName: formData.legalName,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        openingHours,
        facilities,
        isActive,
      };

      const response = await fetch(`${API_BASE_URL}/cinemas/admin/${selectedCinema.cinemaId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(body),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || `Lỗi ${response.status}`);
      }
      if (result.success) {
        toast.success('Cập nhật rạp thành công');
        closeModal();
        setListTick((t) => t + 1);
      } else {
        toast.error(result.message || 'Lỗi khi lưu');
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi lưu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (cinema) => {
    if (!window.confirm(`Xóa rạp "${cinema.cinemaName}"?`)) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/admin/${cinema.cinemaId}?chainId=${cinema.chainId}`,
        {
          method: 'DELETE',
          headers: authHeaders,
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || `Lỗi ${response.status}`);
      }
      if (result.success) {
        toast.success('Đã xóa');
        setListTick((t) => t + 1);
      } else {
        toast.error(result.message || 'Không xóa được');
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi xóa');
    }
  };

  return (
    <div className="adm-myc">
      <header className="adm-myc__hero">
        <div className="adm-myc__hero-row">
          <button
            type="button"
            className="adm-myc__home"
            onClick={() => navigate('/admin/dashboard')}
            title="Dashboard"
            aria-label="Về dashboard"
          >
            <FaHome aria-hidden />
          </button>
          <div>
            <p className="adm-myc__eyebrow">Cinema Manager</p>
            <h1 className="adm-myc__title">Rạp của tôi</h1>
            <p className="adm-myc__lead">Các rạp bạn được gán quản lý.</p>
          </div>
        </div>
        <div className="adm-myc__stat">
          Tổng: <strong>{totalElements}</strong>
        </div>
      </header>

      <div className="adm-myc__toolbar">
        <div className="adm-myc__search">
          <FaSearch className="adm-myc__search-ico" aria-hidden />
          <input
            type="search"
            className="adm-myc__search-input"
            placeholder="Tìm rạp…"
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          className="adm-myc__btn adm-myc__btn--disabled"
          disabled
          title="Chỉ SYSTEM_ADMIN có thể tạo rạp"
        >
          <FaPlus aria-hidden />
          Tạo rạp
        </button>
      </div>

      {loading ? (
        <div className="adm-myc__state" aria-busy="true">
          <FaSpinner className="adm-myc__spin" aria-hidden />
          <p>Đang tải…</p>
        </div>
      ) : cinemas.length > 0 ? (
        <>
          <div className="adm-myc__grid">
            {cinemas.map((cinema) => (
              <article key={cinema.cinemaId} className="adm-myc__card">
                <div className="adm-myc__card-head">
                  <h2 className="adm-myc__card-title">{cinema.cinemaName}</h2>
                  <div className="adm-myc__card-actions">
                    <button
                      type="button"
                      className="adm-myc__icon adm-myc__icon--edit"
                      onClick={() => handleOpenEditModal(cinema)}
                      title="Sửa"
                      aria-label={`Sửa ${cinema.cinemaName}`}
                    >
                      <FaEdit />
                    </button>
                    <button
                      type="button"
                      className="adm-myc__icon adm-myc__icon--del"
                      onClick={() => handleDelete(cinema)}
                      title="Xóa"
                      aria-label={`Xóa ${cinema.cinemaName}`}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="adm-myc__card-body">
                  <div className="adm-myc__line">
                    <FaMapMarkerAlt aria-hidden />
                    <span>{cinema.address || '—'}</span>
                  </div>
                  <p className="adm-myc__meta">
                    {cinema.city || '—'} · {cinema.district || '—'}
                  </p>
                  <div className="adm-myc__line">
                    <FaPhone aria-hidden />
                    <span>{cinema.phoneNumber || '—'}</span>
                  </div>
                  <div className="adm-myc__line">
                    <FaEnvelope aria-hidden />
                    <span>{cinema.email || '—'}</span>
                  </div>
                  {cinema.managerName && (
                    <p className="adm-myc__mgr">
                      Quản lý: {cinema.managerName}
                      {cinema.managerEmail ? ` (${cinema.managerEmail})` : ''}
                    </p>
                  )}
                  <p className={`adm-myc__status ${cinema.isActive ? 'is-on' : 'is-off'}`}>
                    {cinema.isActive ? 'Hoạt động' : 'Vô hiệu'}
                  </p>
                  <button
                    type="button"
                    className="adm-myc__btn adm-myc__btn--accent"
                    onClick={() => navigate(`/admin/cinemas/${cinema.cinemaId}/halls`)}
                  >
                    <FaFilm aria-hidden />
                    Phòng chiếu
                  </button>
                </div>
              </article>
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="adm-myc__pager" aria-label="Phân trang">
              <button
                type="button"
                className="adm-myc__pager-btn"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Trước
              </button>
              <span>
                Trang {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                className="adm-myc__pager-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              >
                Sau
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="adm-myc__empty">
          <p>Chưa có rạp được gán</p>
          <small>Liên hệ quản trị nếu bạn cần quyền quản lý rạp.</small>
        </div>
      )}

      {showModal && (
        <div className="adm-myc__modal" role="presentation">
          <div
            className="adm-myc__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-myc-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-myc__panel-head">
              <h2 id="adm-myc-modal-title">{modalMode === 'create' ? 'Tạo rạp' : 'Sửa rạp'}</h2>
              <button type="button" className="adm-myc__panel-x" onClick={closeModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form className="adm-myc__form" onSubmit={handleSubmit}>
              <div className="adm-myc__row">
                <div className="adm-myc__field">
                  <label htmlFor="myc-name">Tên rạp *</label>
                  <input
                    id="myc-name"
                    name="cinemaName"
                    value={formData.cinemaName}
                    onChange={handleInputChange}
                    disabled={modalMode === 'create'}
                    required
                  />
                </div>
                <div className="adm-myc__field">
                  <label htmlFor="myc-email">Email</label>
                  <input
                    id="myc-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="adm-myc__field">
                <label htmlFor="myc-addr">Địa chỉ</label>
                <input id="myc-addr" name="address" value={formData.address} onChange={handleInputChange} />
              </div>
              <div className="adm-myc__row">
                <div className="adm-myc__field">
                  <label htmlFor="myc-city">Thành phố</label>
                  <input id="myc-city" name="city" value={formData.city} onChange={handleInputChange} />
                </div>
                <div className="adm-myc__field">
                  <label htmlFor="myc-dist">Quận</label>
                  <input id="myc-dist" name="district" value={formData.district} onChange={handleInputChange} />
                </div>
              </div>
              <div className="adm-myc__row">
                <div className="adm-myc__field">
                  <label htmlFor="myc-phone">Điện thoại</label>
                  <input id="myc-phone" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleInputChange} />
                </div>
                <div className="adm-myc__field">
                  <label htmlFor="myc-tax">Mã số thuế</label>
                  <input id="myc-tax" name="taxCode" value={formData.taxCode} onChange={handleInputChange} />
                </div>
              </div>
              <div className="adm-myc__field">
                <label htmlFor="myc-legal">Tên pháp lý</label>
                <input id="myc-legal" name="legalName" value={formData.legalName} onChange={handleInputChange} />
              </div>
              <div className="adm-myc__row">
                <div className="adm-myc__field">
                  <label htmlFor="myc-lat">Vĩ độ</label>
                  <input id="myc-lat" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} />
                </div>
                <div className="adm-myc__field">
                  <label htmlFor="myc-lng">Kinh độ</label>
                  <input id="myc-lng" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} />
                </div>
              </div>
              <div className="adm-myc__field">
                <label htmlFor="myc-hours">Giờ hoạt động</label>
                <input
                  id="myc-hours"
                  name="openingHours"
                  value={formData.openingHours}
                  onChange={handleInputChange}
                  placeholder="Chuỗi hoặc JSON"
                />
              </div>
              <div className="adm-myc__field">
                <label htmlFor="myc-fac">Tiện nghi</label>
                <textarea
                  id="myc-fac"
                  name="facilities"
                  rows={3}
                  value={formData.facilities}
                  onChange={handleInputChange}
                  placeholder="Mô tả hoặc JSON"
                />
              </div>
              {modalMode === 'edit' && (
                <label className="adm-myc__check">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Kích hoạt
                </label>
              )}
              <div className="adm-myc__panel-actions">
                <button type="button" className="adm-myc__btn adm-myc__btn--ghost" onClick={closeModal}>
                  Hủy
                </button>
                <button
                  type="submit"
                  className="adm-myc__btn adm-myc__btn--primary"
                  disabled={submitting || modalMode === 'create'}
                >
                  {submitting ? <FaSpinner className="adm-myc__spin sm" aria-hidden /> : <FaSave aria-hidden />}
                  {submitting ? 'Đang lưu…' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCinemaManagement;

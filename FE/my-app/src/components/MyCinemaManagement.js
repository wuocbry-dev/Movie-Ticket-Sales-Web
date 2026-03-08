import React, { useState, useEffect } from 'react';
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
  FaCheck,
  FaHome,
  FaFilm
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import './CinemaManagement.css';

const MyCinemaManagement = () => {
  const navigate = useNavigate();
  
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [formData, setFormData] = useState({
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
    facilities: ''
  });
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  // Fetch my cinemas
  const fetchMyCinemas = async (pageNum = 0, search = '') => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('Token không tồn tại');
      }

      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const url = `${API_BASE_URL}/cinemas/my-cinemas?${params}`;
      console.log('Fetching from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response status:', response.status);
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        console.error('Error response:', result.message);
        toast.error(result.message || 'Lỗi khi lấy danh sách rạp');
      }
    } catch (error) {
      console.error('Error fetching my cinemas:', error);
      toast.error('Lỗi khi lấy danh sách rạp: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCinemas(0);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchMyCinemas(0, value);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
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
      facilities: ''
    });
    setIsActive(true);
    setSelectedCinema(null);
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (cinema) => {
    setModalMode('edit');
    setFormData({
      cinemaName: cinema.cinemaName,
      address: cinema.address || '',
      city: cinema.city || '',
      district: cinema.district || '',
      phoneNumber: cinema.phoneNumber || '',
      email: cinema.email || '',
      taxCode: cinema.taxCode || '',
      legalName: cinema.legalName || '',
      latitude: cinema.latitude || '',
      longitude: cinema.longitude || '',
      openingHours: cinema.openingHours || '',
      facilities: cinema.facilities || ''
    });
    setIsActive(cinema.isActive);
    setSelectedCinema(cinema);
    setShowModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.cinemaName.trim()) {
        toast.error('Tên rạp không được để trống');
        setSubmitting(false);
        return;
      }

      let url, method, body, successMessage;

      if (modalMode === 'create') {
        toast.info('Chỉ SYSTEM_ADMIN mới có thể tạo rạp mới');
        setSubmitting(false);
        return;
      } else {
        // Update mode
        url = `${API_BASE_URL}/cinemas/admin/${selectedCinema.cinemaId}`;
        method = 'PUT';
        body = {
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
          openingHours: formData.openingHours,
          facilities: formData.facilities,
          isActive: isActive
        };
        successMessage = 'Cập nhật rạp thành công';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi lưu rạp');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(successMessage);
        setShowModal(false);
        fetchMyCinemas(page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi lưu rạp');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Lỗi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete cinema
  const handleDelete = async (cinema) => {
    if (window.confirm(`Bạn có chắc muốn xóa rạp "${cinema.cinemaName}"?`)) {
      try {
        const url = `${API_BASE_URL}/cinemas/admin/${cinema.cinemaId}?chainId=${cinema.chainId}`;

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi xóa rạp');
        }

        const result = await response.json();

        if (result.success) {
          toast.success('Xóa rạp thành công');
          fetchMyCinemas(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa rạp');
        }
      } catch (error) {
        console.error('Error deleting cinema:', error);
        toast.error('Lỗi: ' + error.message);
      }
    }
  };

  return (
    <div className="cinema-management-container">
      {/* Header */}
      <div className="cinema-management-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#059669'
            }}
            title="Quay lại Dashboard"
          >
            <FaHome />
          </button>
          <h1>Quản Lý Rạp Của Tôi</h1>
        </div>
        <div className="header-stats">
          <span className="stat">Tổng rạp: <strong>{totalElements}</strong></span>
        </div>
      </div>

      {/* Search and Create Bar */}
      <div className="cinema-management-toolbar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm rạp..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary"
          style={{ opacity: 0.6, cursor: 'not-allowed' }}
          disabled
          title="Chỉ SYSTEM_ADMIN mới có thể tạo rạp"
        >
          <FaPlus /> Tạo Rạp Mới
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Cinemas Grid */}
      {!loading && cinemas.length > 0 && (
        <div className="cinemas-grid">
          {cinemas.map((cinema) => (
            <div key={cinema.cinemaId} className="cinema-card">
              <div className="cinema-card-header">
                <h3>{cinema.cinemaName}</h3>
                <div className="cinema-actions">
                  <button 
                    onClick={() => handleOpenEditModal(cinema)}
                    className="btn-edit"
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(cinema)}
                    className="btn-delete"
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="cinema-card-body">
                <div className="info-row">
                  <FaMapMarkerAlt className="info-icon" />
                  <div className="info-content">
                    <span className="label">Địa chỉ:</span>
                    <span className="value">{cinema.address || 'N/A'}</span>
                  </div>
                </div>

                <div className="info-row">
                  <span className="label">Thành phố:</span>
                  <span className="value">{cinema.city || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <span className="label">Quận:</span>
                  <span className="value">{cinema.district || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <FaPhone className="info-icon" />
                  <span className="value">{cinema.phoneNumber || 'N/A'}</span>
                </div>

                <div className="info-row">
                  <FaEnvelope className="info-icon" />
                  <span className="value">{cinema.email || 'N/A'}</span>
                </div>

                {cinema.managerName && (
                  <div className="info-row manager-info">
                    <span className="label">Người quản lý:</span>
                    <span className="value">{cinema.managerName} ({cinema.managerEmail})</span>
                  </div>
                )}

                <div className="info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${cinema.isActive ? 'active' : 'inactive'}`}>
                    {cinema.isActive ? '✓ Hoạt động' : '✗ Vô hiệu'}
                  </span>
                </div>

                <div className="cinema-card-footer">
                  <button 
                    onClick={() => navigate(`/admin/cinemas/${cinema.cinemaId}/halls`)}
                    className="btn-view-halls"
                    title="Quản lý phòng chiếu"
                  >
                    <FaFilm /> Quản Lý Phòng Chiếu
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && cinemas.length === 0 && (
        <div className="empty-state">
          <p>Không có rạp nào</p>
          <small>Bạn chưa được gán quản lý rạp nào</small>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchMyCinemas(page - 1, searchTerm)}
            disabled={page === 0}
            className="pagination-btn"
          >
            Trang trước
          </button>
          <span className="page-info">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => fetchMyCinemas(page + 1, searchTerm)}
            disabled={page >= totalPages - 1}
            className="pagination-btn"
          >
            Trang sau
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Tạo Rạp Mới' : 'Chỉnh Sửa Rạp'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên Rạp *</label>
                  <input
                    type="text"
                    name="cinemaName"
                    value={formData.cinemaName}
                    onChange={handleInputChange}
                    required
                    disabled={modalMode === 'create'}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Địa Chỉ</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thành Phố</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Quận</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số Điện Thoại</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Mã Số Thuế</label>
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tên Pháp Lý</label>
                  <input
                    type="text"
                    name="legalName"
                    value={formData.legalName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vĩ Độ</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Kinh Độ</label>
                  <input
                    type="number"
                    step="0.0001"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giờ Hoạt Động</label>
                  <input
                    type="text"
                    name="openingHours"
                    placeholder="VD: 09:00 - 23:00"
                    value={formData.openingHours}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tiện Nghi</label>
                  <textarea
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="VD: Phòng VIP, Rạp IMAX, Nhà hàng, Bãi đỗ xe"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                      />
                      Kích hoạt
                    </label>
                  </div>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-cancel"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="btn-save"
                  disabled={submitting || modalMode === 'create'}
                >
                  {submitting ? <FaSpinner className="spinner" /> : <FaSave />}
                  {submitting ? 'Đang lưu...' : 'Lưu'}
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

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheck,
  FaCheckCircle,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaChair
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './CinemaManagement.css';

const CinemaManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedChainId = location.state?.chainId || null;
  const selectedChainName = location.state?.chainName || 'Tất Cả Chuỗi Rạp';
  
  const [cinemas, setCinemas] = useState([]);
  const [cinemaChains, setCinemaChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [formData, setFormData] = useState({
    chainId: '',
    managerId: '',
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
    openingHours: {
      "Mon-Fri": "",
      "Sat-Sun": ""
    },
    facilities: {
      parking: false,
      wheelchairAccess: false,
      "3D_support": false
    }
  });
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailCinema, setDetailCinema] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    fetchCinemas();
    fetchCinemaChains();
  }, [token, page]);

  // Fetch cinema chains for dropdown
  const fetchCinemaChains = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/all?page=0&size=100`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCinemaChains(result.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching cinema chains:', error);
    }
  };

  // Fetch cinemas
  const fetchCinemas = async (pageNum = page, search = searchTerm) => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/cinemas/admin/all?page=${pageNum}&size=10`;
      if (search) {
        url += `&search=${search}`;
      }
      if (selectedChainId) {
        url += `&chainId=${selectedChainId}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách rạp');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 0);
        setPage(result.data.currentPage || 0);
      }
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      toast.error('Không thể tải danh sách rạp: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchCinemas(0, value);
  };

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      chainId: selectedChainId || '',
      managerId: '',
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
      openingHours: {
        "Mon-Fri": "09:00 - 23:00",
        "Sat-Sun": "08:00 - 00:00"
      },
      facilities: {
        parking: false,
        wheelchairAccess: false,
        "3D_support": false,
        "4DX_support": false,
        "IMAX_support": false,
        "VIP_lounge": false
      }
    });
    setIsActive(true);
    setShowModal(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (cinema) => {
    setModalMode('edit');
    setSelectedCinema(cinema);
    setFormData({
      chainId: cinema.chainId || '',
      managerId: cinema.managerId || '',
      cinemaName: cinema.cinemaName || '',
      address: cinema.address || '',
      city: cinema.city || '',
      district: cinema.district || '',
      phoneNumber: cinema.phoneNumber || '',
      email: cinema.email || '',
      taxCode: cinema.taxCode || '',
      legalName: cinema.legalName || '',
      latitude: cinema.latitude || '',
      longitude: cinema.longitude || '',
      openingHours: cinema.openingHours || {},
      facilities: cinema.facilities || {}
    });
    setIsActive(cinema.isActive);
    setShowModal(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCinema(null);
    setFormData({
      chainId: '',
      managerId: '',
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
      openingHours: {},
      facilities: {}
    });
  };

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('openingHours.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        openingHours: {
          ...prev.openingHours,
          [key]: value
        }
      }));
    } else if (name.startsWith('facilities.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          [key]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle create cinema
  const handleCreateCinema = async () => {
    try {
      setSubmitting(true);
      
      // Validate required fields
      if (!formData.cinemaName || !formData.cinemaName.trim()) {
        toast.error('Tên rạp không được để trống');
        setSubmitting(false);
        return;
      }

      if (!formData.chainId) {
        toast.error('Vui lòng chọn chuỗi rạp');
        setSubmitting(false);
        return;
      }
      
      // Prepare data with proper types
      const requestData = {
        chainId: parseInt(formData.chainId),
        cinemaName: formData.cinemaName,
        address: formData.address || null,
        city: formData.city || null,
        district: formData.district || null,
        phoneNumber: formData.phoneNumber || null,
        email: formData.email || null,
        taxCode: formData.taxCode || null,
        legalName: formData.legalName || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        openingHours: formData.openingHours,
        facilities: formData.facilities
      };

      // Only add managerId if it's a valid number
      if (formData.managerId && !isNaN(parseInt(formData.managerId))) {
        requestData.managerId = parseInt(formData.managerId);
      }
      
      console.log('📤 Sending data to create cinema:', requestData);
      
      const response = await fetch(`${API_BASE_URL}/cinemas/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      console.log('📥 Response from server:', result);

      if (response.ok && result.success) {
        toast.success(result.message || 'Tạo rạp thành công!');
        handleCloseModal();
        fetchCinemas();
      } else {
        console.error('❌ Error details:', result);
        toast.error(result.message || 'Tạo rạp thất bại!');
      }
    } catch (error) {
      console.error('Error creating cinema:', error);
      toast.error('Có lỗi xảy ra khi tạo rạp');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle update cinema
  const handleUpdateCinema = async () => {
    try {
      setSubmitting(true);
      
      // Prepare data with proper types
      const updateData = {
        cinemaId: selectedCinema.cinemaId,
        chainId: parseInt(formData.chainId),
        cinemaName: formData.cinemaName,
        address: formData.address || null,
        city: formData.city || null,
        district: formData.district || null,
        phoneNumber: formData.phoneNumber || null,
        email: formData.email || null,
        taxCode: formData.taxCode || null,
        legalName: formData.legalName || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        openingHours: formData.openingHours,
        facilities: formData.facilities,
        isActive
      };

      // Only add managerId if it's a valid number
      if (formData.managerId && !isNaN(parseInt(formData.managerId))) {
        updateData.managerId = parseInt(formData.managerId);
      }

      console.log('📤 Sending update data:', updateData);

      const response = await fetch(`${API_BASE_URL}/cinemas/admin/${selectedCinema.cinemaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      console.log('📥 Update response:', result);

      if (response.ok && result.success) {
        toast.success(result.message || 'Cập nhật rạp thành công!');
        handleCloseModal();
        
        // Show detail modal with updated data
        if (result.data) {
          setDetailCinema(result.data);
          setShowDetailModal(true);
        }
        
        fetchCinemas();
      } else {
        console.error('❌ Update error:', result);
        toast.error(result.message || 'Cập nhật rạp thất bại!');
      }
    } catch (error) {
      console.error('Error updating cinema:', error);
      toast.error('Có lỗi xảy ra khi cập nhật rạp');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete cinema
  const handleDeleteCinema = async (cinemaId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa rạp này?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/admin/${cinemaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Xóa rạp thành công!');
        fetchCinemas();
      } else {
        toast.error(result.message || 'Xóa rạp thất bại!');
      }
    } catch (error) {
      console.error('Error deleting cinema:', error);
      toast.error('Có lỗi xảy ra khi xóa rạp');
    }
  };

  // Handle submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.cinemaName.trim()) {
      toast.error('Vui lòng nhập tên rạp!');
      return;
    }

    if (modalMode === 'create') {
      handleCreateCinema();
    } else {
      handleUpdateCinema();
    }
  };

  return (
    <div className="cinema-management">
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <button className="btn-back" onClick={() => navigate('/admin/cinema-chains')}>
            ← Quay lại
          </button>
          <FaBuilding className="page-icon" />
          <div className="title-content">
            <h1>Quản Lý Rạp Chiếu Phim</h1>
            {selectedChainId && (
              <p className="chain-subtitle">Chuỗi rạp: {selectedChainName}</p>
            )}
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <FaPlus /> Thêm Rạp Mới
        </button>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm theo tên rạp, địa chỉ, thành phố..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : cinemas.length === 0 ? (
        <div className="empty-state">
          <FaBuilding className="empty-icon" />
          <p>Không có rạp nào</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <FaPlus /> Thêm Rạp Đầu Tiên
          </button>
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="cinemas-grid">
            {cinemas.map((cinema) => (
              <div key={cinema.cinemaId} className={`cinema-card ${!cinema.isActive ? 'inactive' : ''}`}>
                {/* Card Header */}
                <div className="cinema-card-header">
                  <div 
                    className="cinema-card-title clickable" 
                    onClick={() => navigate(`/admin/cinemas/${cinema.cinemaId}`, {
                      state: {
                        chainId: cinema.chainId,
                        chainName: cinema.chainName
                      }
                    })}
                    title="Xem phòng chiếu"
                  >
                    <FaBuilding className="cinema-card-icon" />
                    <h3>{cinema.cinemaName}</h3>
                  </div>
                  <span className={`badge ${cinema.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {cinema.isActive ? (
                      <>
                        <FaCheck /> HOẠT ĐỘNG
                      </>
                    ) : (
                      'NGƯNG'
                    )}
                  </span>
                </div>

                {/* Card Body */}
                <div className="cinema-card-body">
                  {/* Chain Info */}
                  <div className="cinema-card-row">
                    <span className="cinema-card-label">Chuỗi rạp:</span>
                    <span className="cinema-card-value chain-name">{cinema.chainName || 'N/A'}</span>
                  </div>

                  {/* Manager Info */}
                  <div className="cinema-card-row">
                    <span className="cinema-card-label">
                      <FaUser className="inline-icon" /> Quản lý:
                    </span>
                    <div className="manager-compact">
                      <div className="manager-name">{cinema.managerName || 'N/A'}</div>
                      {cinema.managerEmail && (
                        <div className="manager-email">{cinema.managerEmail}</div>
                      )}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="cinema-card-row">
                    <span className="cinema-card-label">
                      <FaMapMarkerAlt className="inline-icon" /> Địa chỉ:
                    </span>
                    <span className="cinema-card-value">{cinema.address}</span>
                  </div>

                  {/* City */}
                  <div className="cinema-card-row">
                    <span className="cinema-card-label">Thành phố:</span>
                    <span className="cinema-card-value">{cinema.city}, {cinema.district}</span>
                  </div>

                  {/* Contact */}
                  <div className="cinema-card-contact">
                    <div className="contact-item-compact">
                      <FaPhone className="contact-icon" />
                      <span>{cinema.phoneNumber}</span>
                    </div>
                    <div className="contact-item-compact">
                      <FaEnvelope className="contact-icon" />
                      <span>{cinema.email}</span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="cinema-card-footer-info">
                    <small>Ngày tạo: {new Date(cinema.createdAt).toLocaleDateString('vi-VN')}</small>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="cinema-card-footer">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => navigate(`/admin/cinemas/${cinema.cinemaId}`, {
                      state: {
                        chainId: cinema.chainId,
                        chainName: cinema.chainName
                      }
                    })}
                    title="Quản lý phòng chiếu"
                  >
                    <FaChair /> Phòng chiếu
                  </button>
                  <button 
                    className="btn btn-sm btn-info"
                    onClick={() => handleOpenEditModal(cinema)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit /> Chỉnh sửa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination-section">
            <div className="pagination-info">
              Hiển thị {cinemas.length} trên {totalElements} rạp
            </div>
            <div className="pagination-controls">
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (page > 0) {
                    setPage(page - 1);
                  }
                }}
                disabled={page === 0}
              >
                ← Trước
              </button>
              <span className="page-indicator">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  if (page < totalPages - 1) {
                    setPage(page + 1);
                  }
                }}
                disabled={page >= totalPages - 1}
              >
                Tiếp →
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Thêm Rạp Mới' : 'Chỉnh Sửa Rạp'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tên Rạp <span className="required">*</span></label>
                  <input
                    type="text"
                    name="cinemaName"
                    value={formData.cinemaName}
                    onChange={handleFormChange}
                    placeholder="Nhập tên rạp"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Chuỗi Rạp <span className="required">*</span></label>
                  <select
                    name="chainId"
                    value={formData.chainId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">-- Chọn chuỗi rạp --</option>
                    {cinemaChains.map(chain => (
                      <option key={chain.chainId} value={chain.chainId}>
                        {chain.chainName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quản Lý ID <small style={{color: '#999', fontWeight: 'normal'}}>(Tùy chọn)</small></label>
                  <input
                    type="number"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleFormChange}
                    placeholder="Để trống nếu chưa có quản lý"
                  />
                </div>
                <div className="form-group">
                  <label>Số Điện Thoại</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleFormChange}
                    placeholder="Số điện thoại"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa Chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Địa chỉ đầy đủ"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thành Phố</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="Thành phố"
                  />
                </div>
                <div className="form-group">
                  <label>Quận/Huyện</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleFormChange}
                    placeholder="Quận/Huyện"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="form-group">
                  <label>Mã Số Thuế</label>
                  <input
                    type="text"
                    name="taxCode"
                    value={formData.taxCode}
                    onChange={handleFormChange}
                    placeholder="Mã số thuế"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tên Pháp Lý</label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleFormChange}
                  placeholder="Tên pháp lý công ty"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Vĩ Độ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleFormChange}
                    placeholder="10.7769"
                  />
                </div>
                <div className="form-group">
                  <label>Kinh Độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleFormChange}
                    placeholder="106.7001"
                  />
                </div>
              </div>

              <div className="form-section-title">Giờ Mở Cửa</div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thứ 2 - Thứ 6</label>
                  <input
                    type="text"
                    name="openingHours.Mon-Fri"
                    value={formData.openingHours?.["Mon-Fri"] || ''}
                    onChange={handleFormChange}
                    placeholder="09:00 - 23:00"
                  />
                </div>
                <div className="form-group">
                  <label>Thứ 7 - Chủ Nhật</label>
                  <input
                    type="text"
                    name="openingHours.Sat-Sun"
                    value={formData.openingHours?.["Sat-Sun"] || ''}
                    onChange={handleFormChange}
                    placeholder="08:00 - 00:00"
                  />
                </div>
              </div>

              <div className="form-section-title">Tiện Ích</div>
              <div className="facilities-checkboxes">
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="facilities.parking"
                      checked={formData.facilities?.parking || false}
                      onChange={handleFormChange}
                    />
                    Bãi đỗ xe
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="facilities.wheelchairAccess"
                      checked={formData.facilities?.wheelchairAccess || false}
                      onChange={handleFormChange}
                    />
                    Tiện nghi cho người khuyết tật
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="facilities.3D_support"
                      checked={formData.facilities?.["3D_support"] || false}
                      onChange={handleFormChange}
                    />
                    Hỗ trợ 3D
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="facilities.4DX_support"
                      checked={formData.facilities?.["4DX_support"] || false}
                      onChange={handleFormChange}
                    />
                    Hỗ trợ 4DX
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="facilities.IMAX_support"
                      checked={formData.facilities?.["IMAX_support"] || false}
                      onChange={handleFormChange}
                    />
                    Hỗ trợ IMAX
                  </label>
                </div>
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="facilities.VIP_lounge"
                      checked={formData.facilities?.["VIP_lounge"] || false}
                      onChange={handleFormChange}
                    />
                    Phòng chờ VIP
                  </label>
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="form-group-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Đang hoạt động
                  </label>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  <FaTimes /> Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="spinner-small" /> Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaSave /> {modalMode === 'create' ? 'Tạo Rạp' : 'Cập Nhật'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailCinema && (
        <div className="modal-overlay">
          <div className="modal-content modal-detail">
            <div className="modal-header">
              <h2><FaCheckCircle /> Cập Nhật Thành Công!</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="detail-content">
              {/* Success Message */}
              <div className="success-banner">
                <div className="success-icon">
                  <FaCheck />
                </div>
                <div className="success-text">
                  <strong>Rạp "{detailCinema.cinemaName}" đã được cập nhật!</strong>
                  <span>Thông tin chi tiết bên dưới</span>
                </div>
              </div>

              {/* Info Grid - 2 columns */}
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label"><FaBuilding /> Tên Rạp</div>
                  <div className="detail-value">{detailCinema.cinemaName}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label"><FaBuilding /> Chuỗi Rạp</div>
                  <div className="detail-value">{detailCinema.chainName}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label"><FaUser /> Quản Lý</div>
                  <div className="detail-value">{detailCinema.managerName || 'Chưa phân công'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label"><FaEnvelope /> Email Quản Lý</div>
                  <div className="detail-value">{detailCinema.managerEmail || '—'}</div>
                </div>
                <div className="detail-item full-width">
                  <div className="detail-label"><FaMapMarkerAlt /> Địa Chỉ</div>
                  <div className="detail-value">{detailCinema.address || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label"><FaMapMarkerAlt /> Thành Phố</div>
                  <div className="detail-value">{detailCinema.city || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label"><FaPhone /> Điện Thoại</div>
                  <div className="detail-value">{detailCinema.phoneNumber || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label"><FaEnvelope /> Email Rạp</div>
                  <div className="detail-value">{detailCinema.email || '—'}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Trạng Thái</div>
                  <div className="detail-value">
                    <span className={`status-badge ${detailCinema.isActive ? 'active' : 'inactive'}`}>
                      {detailCinema.isActive ? '● Hoạt động' : '● Ngưng hoạt động'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              {detailCinema.facilities && Object.values(detailCinema.facilities).some(v => v) && (
                <div className="facilities-section">
                  <div className="facilities-label"><FaChair /> Tiện Ích</div>
                  <div className="facilities-list">
                    {Object.entries(detailCinema.facilities).map(([key, value]) => 
                      value && (
                        <span key={key} className="facility-badge">
                          <FaCheck /> {key.replace(/_/g, ' ').replace('support', '').trim()}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={() => setShowDetailModal(false)}
              >
                <FaCheck /> Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaManagement;

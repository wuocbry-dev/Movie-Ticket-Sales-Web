import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaSpinner,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaBuilding,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaHome,
  FaFilm,
  FaTabs
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './UnifiedCinemaManagement.css';

const UnifiedCinemaManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cinemas');
  const [userRole, setUserRole] = useState('');

  // Common state
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Cinema chains state
  const [cinemaChains, setCinemaChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [chainFormData, setChainFormData] = useState({
    chainName: '',
    logoUrl: '',
    website: '',
    description: ''
  });

  // Cinemas state
  const [cinemas, setCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [cinemaFormData, setCinemaFormData] = useState({
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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  // Initialize user role on mount
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    // If user is not SYSTEM_ADMIN, show only cinemas tab
    if (role !== 'SYSTEM_ADMIN') {
      setActiveTab('cinemas');
    }
  }, []);

  // Check token
  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
  }, [token]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'chains' && userRole === 'SYSTEM_ADMIN') {
      fetchCinemaChains(0);
    } else if (activeTab === 'cinemas') {
      if (userRole === 'SYSTEM_ADMIN') {
        fetchAllCinemas(0);
      } else {
        fetchMyCinemas(0);
      }
    }
  }, [activeTab, userRole]);

  // ==================== CINEMA CHAINS ====================

  const fetchCinemaChains = async (pageNum = 0, search = '') => {
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

      const url = `${API_BASE_URL}/cinema-chains/admin/all?${params}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setCinemaChains(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách chuỗi rạp');
      }
    } catch (error) {
      console.error('Error fetching cinema chains:', error);
      toast.error('Không thể tải danh sách chuỗi rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChainSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchCinemaChains(0, value);
  };

  const handleOpenChainCreateModal = () => {
    setModalMode('create');
    setChainFormData({
      chainName: '',
      logoUrl: '',
      website: '',
      description: ''
    });
    setIsActive(true);
    setSelectedChain(null);
    setShowModal(true);
  };

  const handleOpenChainEditModal = (chain) => {
    setModalMode('edit');
    setChainFormData({
      chainName: chain.chainName,
      logoUrl: chain.logoUrl || '',
      website: chain.website || '',
      description: chain.description || ''
    });
    setIsActive(chain.isActive);
    setSelectedChain(chain);
    setShowModal(true);
  };

  const handleChainFormChange = (e) => {
    const { name, value } = e.target;
    setChainFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateChain = async () => {
    if (!chainFormData.chainName.trim()) {
      toast.error('Tên chuỗi rạp không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinema-chains/admin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chainFormData)
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Tạo chuỗi rạp thành công!');
        handleCloseModal();
        fetchCinemaChains(0, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi tạo chuỗi rạp');
      }
    } catch (error) {
      console.error('Error creating cinema chain:', error);
      toast.error('Không thể tạo chuỗi rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateChain = async () => {
    if (!chainFormData.chainName.trim()) {
      toast.error('Tên chuỗi rạp không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinema-chains/admin/${selectedChain.chainId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            chainId: selectedChain.chainId,
            ...chainFormData,
            isActive
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Cập nhật chuỗi rạp thành công!');
        handleCloseModal();
        fetchCinemaChains(page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật chuỗi rạp');
      }
    } catch (error) {
      console.error('Error updating cinema chain:', error);
      toast.error('Không thể cập nhật chuỗi rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChain = async (chainId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chuỗi rạp này?')) {
      try {
        const response = await fetch(
          `${API_BASE_URL}/cinema-chains/admin/${chainId}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const result = await response.json();
        if (result.success) {
          toast.success('Xóa chuỗi rạp thành công!');
          fetchCinemaChains(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa chuỗi rạp');
        }
      } catch (error) {
        console.error('Error deleting cinema chain:', error);
        toast.error('Không thể xóa chuỗi rạp. Vui lòng thử lại.');
      }
    }
  };

  // ==================== CINEMAS ====================

  const fetchAllCinemas = async (pageNum = 0, search = '') => {
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

      const url = `${API_BASE_URL}/cinemas/admin/all?${params}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách rạp');
      }
    } catch (error) {
      console.error('Error fetching all cinemas:', error);
      toast.error('Không thể tải danh sách rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

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
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách rạp');
      }
    } catch (error) {
      console.error('Error fetching my cinemas:', error);
      toast.error('Không thể tải danh sách rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCinemaSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    if (userRole === 'SYSTEM_ADMIN') {
      fetchAllCinemas(0, value);
    } else {
      fetchMyCinemas(0, value);
    }
  };

  const handleOpenCinemaCreateModal = () => {
    if (userRole !== 'SYSTEM_ADMIN') {
      toast.error('Chỉ SYSTEM_ADMIN mới có thể tạo rạp mới');
      return;
    }
    setModalMode('create');
    setCinemaFormData({
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

  const handleOpenCinemaEditModal = (cinema) => {
    setModalMode('edit');
    setCinemaFormData({
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

  const handleCinemaFormChange = (e) => {
    const { name, value } = e.target;
    setCinemaFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateCinema = async () => {
    if (!cinemaFormData.cinemaName.trim()) {
      toast.error('Tên rạp không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...cinemaFormData,
          latitude: cinemaFormData.latitude ? parseFloat(cinemaFormData.latitude) : null,
          longitude: cinemaFormData.longitude ? parseFloat(cinemaFormData.longitude) : null,
          isActive
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Tạo rạp thành công!');
        handleCloseModal();
        fetchAllCinemas(0, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi tạo rạp');
      }
    } catch (error) {
      console.error('Error creating cinema:', error);
      toast.error('Không thể tạo rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCinema = async () => {
    if (!cinemaFormData.cinemaName.trim()) {
      toast.error('Tên rạp không được để trống');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/admin/${selectedCinema.cinemaId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            cinemaId: selectedCinema.cinemaId,
            chainId: selectedCinema.chainId,
            ...cinemaFormData,
            latitude: cinemaFormData.latitude ? parseFloat(cinemaFormData.latitude) : null,
            longitude: cinemaFormData.longitude ? parseFloat(cinemaFormData.longitude) : null,
            isActive
          })
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Cập nhật rạp thành công!');
        handleCloseModal();
        if (userRole === 'SYSTEM_ADMIN') {
          fetchAllCinemas(page, searchTerm);
        } else {
          fetchMyCinemas(page, searchTerm);
        }
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật rạp');
      }
    } catch (error) {
      console.error('Error updating cinema:', error);
      toast.error('Không thể cập nhật rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCinema = async (cinema) => {
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

        const result = await response.json();
        if (result.success) {
          toast.success('Xóa rạp thành công!');
          if (userRole === 'SYSTEM_ADMIN') {
            fetchAllCinemas(page, searchTerm);
          } else {
            fetchMyCinemas(page, searchTerm);
          }
        } else {
          toast.error(result.message || 'Lỗi khi xóa rạp');
        }
      } catch (error) {
        console.error('Error deleting cinema:', error);
        toast.error('Không thể xóa rạp. Vui lòng thử lại.');
      }
    }
  };

  const handleViewCinemaHalls = (cinema) => {
    navigate(`/admin/cinema-halls/${cinema.cinemaId}`);
  };

  // ==================== MODAL ====================

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChain(null);
    setSelectedCinema(null);
    setChainFormData({
      chainName: '',
      logoUrl: '',
      website: '',
      description: ''
    });
    setCinemaFormData({
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
  };

  const handleSave = async () => {
    if (activeTab === 'chains') {
      if (modalMode === 'create') {
        await handleCreateChain();
      } else {
        await handleUpdateChain();
      }
    } else {
      if (modalMode === 'create') {
        await handleCreateCinema();
      } else {
        await handleUpdateCinema();
      }
    }
  };

  // ==================== RENDER ====================

  return (
    <div className="unified-cinema-management">
      {/* Page Header */}
      <div className="ucm-page-header">
        <div className="ucm-page-title-section">
          <FaBuilding className="ucm-page-icon" />
          <h1>Quản lý rạp chiếu phim</h1>
        </div>
        {userRole === 'SYSTEM_ADMIN' && (
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === 'cinemas' ? 'active' : ''}`}
              onClick={() => setActiveTab('cinemas')}
            >
              <FaHome /> Tất cả rạp
            </button>
            <button
              className={`tab-btn ${activeTab === 'chains' ? 'active' : ''}`}
              onClick={() => setActiveTab('chains')}
            >
              <FaBuilding /> Chuỗi rạp
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="controls-bar">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder={activeTab === 'chains' ? 'Tìm kiếm chuỗi rạp...' : 'Tìm kiếm rạp...'}
            value={searchTerm}
            onChange={activeTab === 'chains' ? handleChainSearch : handleCinemaSearch}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={activeTab === 'chains' ? handleOpenChainCreateModal : handleOpenCinemaCreateModal}
        >
          <FaPlus /> {activeTab === 'chains' ? 'Thêm chuỗi rạp' : 'Thêm rạp'}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text-animated">Đang tải dữ liệu</span>
        </div>
      ) : (
        <>
          {activeTab === 'chains' && (
            <div className="cinema-chains-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên chuỗi rạp</th>
                    <th>Website</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {cinemaChains.length > 0 ? (
                    cinemaChains.map((chain) => (
                      <tr key={chain.chainId}>
                        <td>{chain.chainName}</td>
                        <td>{chain.website || 'N/A'}</td>
                        <td>{chain.description || 'N/A'}</td>
                        <td>
                          <span className={`badge ${chain.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {chain.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon edit"
                              onClick={() => handleOpenChainEditModal(chain)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteChain(chain.chainId)}
                              title="Xóa"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'cinemas' && (
            <div className="cinemas-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tên rạp</th>
                    <th>Địa chỉ</th>
                    <th>Thành phố</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {cinemas.length > 0 ? (
                    cinemas.map((cinema) => (
                      <tr key={cinema.cinemaId}>
                        <td>{cinema.cinemaName}</td>
                        <td>{cinema.address || 'N/A'}</td>
                        <td>{cinema.city || 'N/A'}</td>
                        <td>{cinema.email || 'N/A'}</td>
                        <td>
                          <span className={`badge ${cinema.isActive ? 'badge-active' : 'badge-inactive'}`}>
                            {cinema.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {userRole === 'SYSTEM_ADMIN' && (
                              <button
                                className="btn-icon view"
                                onClick={() => handleViewCinemaHalls(cinema)}
                                title="Quản lý phòng chiếu"
                              >
                                <FaFilm />
                              </button>
                            )}
                            <button
                              className="btn-icon edit"
                              onClick={() => handleOpenCinemaEditModal(cinema)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDeleteCinema(cinema)}
                              title="Xóa"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">Không có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="pagination">
            <button
              className="btn-page"
              onClick={() => {
                if (activeTab === 'chains') {
                  fetchCinemaChains(page - 1, searchTerm);
                } else if (userRole === 'SYSTEM_ADMIN') {
                  fetchAllCinemas(page - 1, searchTerm);
                } else {
                  fetchMyCinemas(page - 1, searchTerm);
                }
              }}
              disabled={page === 0}
            >
              Trước
            </button>
            <span className="page-info">
              Trang {page + 1} / {totalPages} ({totalElements} mục)
            </span>
            <button
              className="btn-page"
              onClick={() => {
                if (activeTab === 'chains') {
                  fetchCinemaChains(page + 1, searchTerm);
                } else if (userRole === 'SYSTEM_ADMIN') {
                  fetchAllCinemas(page + 1, searchTerm);
                } else {
                  fetchMyCinemas(page + 1, searchTerm);
                }
              }}
              disabled={page >= totalPages - 1}
            >
              Tiếp theo
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="ucm-modal-overlay">
          <div className="ucm-modal-content">
            <div className="ucm-modal-header">
              <h2>
                {activeTab === 'chains'
                  ? modalMode === 'create'
                    ? 'Tạo chuỗi rạp mới'
                    : 'Cập nhật chuỗi rạp'
                  : modalMode === 'create'
                  ? 'Tạo rạp mới'
                  : 'Cập nhật rạp'}
              </h2>
              <button className="ucm-btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="ucm-modal-body">
              {activeTab === 'chains' ? (
                // Cinema Chain Form
                <>
                  <div className="ucm-form-group">
                    <label>Tên chuỗi rạp *</label>
                    <input
                      type="text"
                      name="chainName"
                      value={chainFormData.chainName}
                      onChange={handleChainFormChange}
                      placeholder="Nhập tên chuỗi rạp"
                    />
                  </div>
                  <div className="ucm-form-group">
                    <label>Logo URL</label>
                    <input
                      type="text"
                      name="logoUrl"
                      value={chainFormData.logoUrl}
                      onChange={handleChainFormChange}
                      placeholder="URL hình ảnh logo"
                    />
                  </div>
                  <div className="ucm-form-group">
                    <label>Website</label>
                    <input
                      type="text"
                      name="website"
                      value={chainFormData.website}
                      onChange={handleChainFormChange}
                      placeholder="Website chuỗi rạp"
                    />
                  </div>
                  <div className="ucm-form-group">
                    <label>Mô tả</label>
                    <textarea
                      name="description"
                      value={chainFormData.description}
                      onChange={handleChainFormChange}
                      placeholder="Mô tả chuỗi rạp"
                      rows="4"
                    />
                  </div>
                </>
              ) : (
                // Cinema Form
                <>
                  <div className="ucm-form-row">
                    <div className="ucm-form-group">
                      <label>Tên rạp *</label>
                      <input
                        type="text"
                        name="cinemaName"
                        value={cinemaFormData.cinemaName}
                        onChange={handleCinemaFormChange}
                        placeholder="Nhập tên rạp"
                      />
                    </div>
                    <div className="ucm-form-group">
                      <label>Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={cinemaFormData.city}
                        onChange={handleCinemaFormChange}
                        placeholder="Thành phố"
                      />
                    </div>
                  </div>
                  <div className="ucm-form-row">
                    <div className="ucm-form-group">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="address"
                        value={cinemaFormData.address}
                        onChange={handleCinemaFormChange}
                        placeholder="Địa chỉ"
                      />
                    </div>
                    <div className="ucm-form-group">
                      <label>Quận/Huyện</label>
                      <input
                        type="text"
                        name="district"
                        value={cinemaFormData.district}
                        onChange={handleCinemaFormChange}
                        placeholder="Quận/Huyện"
                      />
                    </div>
                  </div>
                  <div className="ucm-form-row">
                    <div className="ucm-form-group">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={cinemaFormData.phoneNumber}
                        onChange={handleCinemaFormChange}
                        placeholder="Số điện thoại"
                      />
                    </div>
                    <div className="ucm-form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={cinemaFormData.email}
                        onChange={handleCinemaFormChange}
                        placeholder="Email"
                      />
                    </div>
                  </div>
                  <div className="ucm-form-row">
                    <div className="ucm-form-group">
                      <label>Mã số thuế</label>
                      <input
                        type="text"
                        name="taxCode"
                        value={cinemaFormData.taxCode}
                        onChange={handleCinemaFormChange}
                        placeholder="Mã số thuế"
                      />
                    </div>
                    <div className="ucm-form-group">
                      <label>Tên pháp lý</label>
                      <input
                        type="text"
                        name="legalName"
                        value={cinemaFormData.legalName}
                        onChange={handleCinemaFormChange}
                        placeholder="Tên pháp lý"
                      />
                    </div>
                  </div>
                  <div className="ucm-form-row">
                    <div className="ucm-form-group">
                      <label>Vĩ độ</label>
                      <input
                        type="number"
                        name="latitude"
                        value={cinemaFormData.latitude}
                        onChange={handleCinemaFormChange}
                        placeholder="Vĩ độ"
                        step="0.0001"
                      />
                    </div>
                    <div className="ucm-form-group">
                      <label>Kinh độ</label>
                      <input
                        type="number"
                        name="longitude"
                        value={cinemaFormData.longitude}
                        onChange={handleCinemaFormChange}
                        placeholder="Kinh độ"
                        step="0.0001"
                      />
                    </div>
                  </div>
                  <div className="ucm-form-row">
                    <div className="ucm-form-group">
                      <label>Giờ mở cửa</label>
                      <input
                        type="text"
                        name="openingHours"
                        value={cinemaFormData.openingHours}
                        onChange={handleCinemaFormChange}
                        placeholder="Ví dụ: 09:00 - 23:00"
                      />
                    </div>
                    <div className="ucm-form-group">
                      <label>Tiện nghi</label>
                      <input
                        type="text"
                        name="facilities"
                        value={cinemaFormData.facilities}
                        onChange={handleCinemaFormChange}
                        placeholder="Tiện nghi (phòng chiếu 4K, v.v.)"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="ucm-form-group ucm-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Hoạt động</span>
                </label>
              </div>
            </div>

            <div className="ucm-modal-footer">
              <button className="btn btn-secondary" onClick={handleCloseModal}>
                <FaTimes /> Đóng
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="spinner-small" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <FaSave /> Lưu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCinemaManagement;

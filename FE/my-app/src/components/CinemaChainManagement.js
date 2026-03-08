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
  FaCheck,
  FaBuilding
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './CinemaChainManagement.css';

const CinemaChainManagement = () => {
  const navigate = useNavigate();
  const [cinemaChains, setCinemaChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedChain, setSelectedChain] = useState(null);
  const [formData, setFormData] = useState({
    chainName: '',
    logoUrl: '',
    website: '',
    description: ''
  });
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  // Check if token exists
  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
  }, [token]);

  // Fetch cinema chains
  const fetchCinemaChains = async (pageNum = 0, search = '') => {
    setLoading(true);
    try {
      if (!token) {
        console.error('Token không tồn tại');
        toast.error('Vui lòng đăng nhập lại');
        throw new Error('Token không tồn tại');
      }

      const params = new URLSearchParams({
        page: pageNum,
        size: 10,
        ...(search && { search })
      });

      const url = `${API_BASE_URL}/cinema-chains/admin/all?${params}`;
      console.log('Fetching from:', url);
      console.log('Token:', token ? 'Có token' : 'Không có token');

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        toast.error(`Lỗi ${response.status}: Không thể tải danh sách chuỗi rạp`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success && result.data && result.data.data) {
        const chains = result.data.data;
        console.log('Số chuỗi rạp:', chains.length);
        setCinemaChains(chains);
        setTotalPages(result.data.totalPages || 1);
        setTotalElements(result.data.totalElements || chains.length);
        setPage(result.data.currentPage || pageNum);
        
        if (chains.length === 0 && search) {
          toast.info('Không tìm thấy chuỗi rạp nào phù hợp');
        }
      } else {
        console.warn('API không trả về dữ liệu hợp lệ:', result);
        toast.error(result.message || 'Lỗi khi tải danh sách rạp');
        setCinemaChains([]);
      }
    } catch (error) {
      console.error('Error fetching cinema chains:', error);
      toast.error('Không thể kết nối đến server. Vui lòng kiểm tra lại.');
      setCinemaChains([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCinemaChains();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchCinemaChains(0, value);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      chainName: '',
      logoUrl: '',
      website: '',
      description: ''
    });
    setIsActive(true);
    setSelectedChain(null);
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (chain) => {
    setModalMode('edit');
    setFormData({
      chainName: chain.chainName,
      logoUrl: chain.logoUrl || '',
      website: chain.website || '',
      description: chain.description || ''
    });
    setIsActive(chain.isActive);
    setSelectedChain(chain);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChain(null);
    setFormData({
      chainName: '',
      logoUrl: '',
      website: '',
      description: ''
    });
    setIsActive(true);
  };

  // Handle form input change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create cinema chain
  const handleCreateCinemaChain = async () => {
    if (!formData.chainName.trim()) {
      toast.error('Tên rạp không được để trống');
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
          body: JSON.stringify(formData)
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Tạo rạp thành công!');
        handleCloseModal();
        fetchCinemaChains(0, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi tạo rạp');
      }
    } catch (error) {
      console.error('Error creating cinema chain:', error);
      toast.error('Không thể tạo rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Update cinema chain
  const handleUpdateCinemaChain = async () => {
    if (!formData.chainName.trim()) {
      toast.error('Tên rạp không được để trống');
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
            ...formData,
            isActive
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success('Cập nhật rạp thành công!');
        handleCloseModal();
        fetchCinemaChains(page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật rạp');
      }
    } catch (error) {
      console.error('Error updating cinema chain:', error);
      toast.error('Không thể cập nhật rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete cinema chain
  const handleDeleteCinemaChain = async (chainId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp này?')) {
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
          toast.success('Xóa rạp thành công!');
          fetchCinemaChains(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa rạp');
        }
      } catch (error) {
        console.error('Error deleting cinema chain:', error);
        toast.error('Không thể xóa rạp. Vui lòng thử lại.');
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      handleCreateCinemaChain();
    } else {
      handleUpdateCinemaChain();
    }
  };

  return (
    <div className="cinema-chain-management">
      <div className="page-header">
        <div className="page-title-section">
          <FaBuilding className="page-icon" />
          <h1>Quản Lý Chuỗi Rạp</h1>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <FaPlus /> Thêm Chuỗi Rạp
        </button>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên rạp..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải...</p>
        </div>
      ) : cinemaChains.length === 0 ? (
        <div className="empty-state">
          <FaBuilding className="empty-icon" />
          <p>Không có chuỗi rạp nào</p>
          <button className="btn btn-primary" onClick={handleOpenCreateModal}>
            <FaPlus /> Tạo chuỗi rạp đầu tiên
          </button>
        </div>
      ) : (
        <>
          {/* Cinema Chains Table */}
          <div className="table-container">
            <table className="cinema-chains-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên Chuỗi Rạp</th>
                  <th>Website</th>
                  <th>Mô Tả</th>
                  <th>Trạng Thái</th>
                  <th>Ngày Tạo</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {cinemaChains.map((chain) => (
                  <tr key={chain.chainId} className={!chain.isActive ? 'inactive' : ''}>
                    <td className="id-cell">{chain.chainId}</td>
                    <td className="name-cell">
                      <div 
                        className="name-cell-content clickable" 
                        onClick={() => navigate('/admin/cinemas', { state: { chainId: chain.chainId, chainName: chain.chainName } })}
                        title="Xem danh sách rạp"
                      >
                        {chain.logoUrl && chain.logoUrl.trim() !== '' ? (
                          <img 
                            src={chain.logoUrl} 
                            alt={chain.chainName} 
                            className="chain-logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className="logo-placeholder" style={{display: chain.logoUrl && chain.logoUrl.trim() !== '' ? 'none' : 'flex'}}>
                          <FaBuilding />
                        </div>
                        <span className="chain-name">{chain.chainName}</span>
                      </div>
                    </td>
                    <td className="website-cell">
                      {chain.website && chain.website.trim() !== '' ? (
                        <a href={chain.website.startsWith('http') ? chain.website : `https://${chain.website}`} target="_blank" rel="noopener noreferrer">
                          {chain.website.length > 30 
                            ? chain.website.substring(0, 30) + '...' 
                            : chain.website}
                        </a>
                      ) : (
                        <span className="text-muted">Chưa có</span>
                      )}
                    </td>
                    <td className="description-cell">
                      {chain.description && chain.description.trim() !== '' ? (
                        <span title={chain.description}>
                          {chain.description.length > 50
                            ? chain.description.substring(0, 50) + '...'
                            : chain.description}
                        </span>
                      ) : (
                        <span className="text-muted">Chưa có</span>
                      )}
                    </td>
                    <td className="status-cell">
                      {chain.isActive ? (
                        <span className="badge badge-success">
                          <FaCheck /> Hoạt động
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <FaTimes /> Không hoạt động
                        </span>
                      )}
                    </td>
                    <td className="date-cell">
                      {new Date(chain.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons-wrapper">
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleOpenEditModal(chain)}
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteCinemaChain(chain.chainId)}
                          title="Xóa"
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
          {totalPages > 0 && (
            <div className="pagination-section">
              <div className="pagination-info">
                Hiển thị {cinemaChains.length > 0 ? page * 10 + 1 : 0} đến{' '}
                {Math.min((page + 1) * 10, totalElements)} của {totalElements} chuỗi rạp
              </div>
              <div className="pagination-controls">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => fetchCinemaChains(page - 1, searchTerm)}
                  disabled={page === 0 || loading}
                >
                  ← Trước
                </button>
                <span className="page-indicator">
                  Trang {page + 1} / {totalPages || 1}
                </span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => fetchCinemaChains(page + 1, searchTerm)}
                  disabled={page >= totalPages - 1 || loading}
                >
                  Tiếp →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{modalMode === 'create' ? 'Tạo Chuỗi Rạp Mới' : 'Chỉnh Sửa Chuỗi Rạp'}</h2>
              <button className="btn-close" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="chainName">Tên Rạp *</label>
                <input
                  type="text"
                  id="chainName"
                  name="chainName"
                  value={formData.chainName}
                  onChange={handleFormChange}
                  placeholder="Nhập tên rạp"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="logoUrl">URL Logo</label>
                <input
                  type="url"
                  id="logoUrl"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleFormChange}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logoUrl && (
                  <div className="logo-preview">
                    <img src={formData.logoUrl} alt="Logo preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleFormChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô Tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Nhập mô tả chuỗi rạp"
                  rows="4"
                />
              </div>

              {modalMode === 'edit' && (
                <div className="form-group form-group-checkbox">
                  <label htmlFor="isActive">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    Hoạt động
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
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaChainManagement;

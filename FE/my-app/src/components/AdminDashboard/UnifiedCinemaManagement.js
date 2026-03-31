import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSave,
  FaSpinner,
  FaBuilding,
  FaHome,
  FaFilm,
} from 'react-icons/fa';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import { hasRole, ROLES } from '../../utils/roleUtils';
import './UnifiedCinemaManagement.css';

const UnifiedCinemaManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('cinemas');

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [submitting, setSubmitting] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [listTick, setListTick] = useState(0);

  const [cinemaChains, setCinemaChains] = useState([]);
  const [selectedChain, setSelectedChain] = useState(null);
  const [chainFormData, setChainFormData] = useState({
    chainName: '',
    logoUrl: '',
    website: '',
    description: '',
  });

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
    facilities: '',
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const isSystemAdmin = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return hasRole(u.roles || [], ROLES.SYSTEM_ADMIN);
    } catch {
      return false;
    }
  }, []);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const bumpList = () => setListTick((t) => t + 1);

  const fetchCinemaChains = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: '10',
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/all?${params}`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCinemaChains(result.data.data || []);
        setTotalPages(result.data.totalPages ?? 0);
        setTotalElements(result.data.totalElements ?? 0);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách chuỗi rạp');
      }
    } catch {
      toast.error('Không thể tải danh sách chuỗi rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [token, page, searchTerm, API_BASE_URL, authHeaders, navigate]);

  const fetchAllCinemas = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: '10',
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await fetch(`${API_BASE_URL}/cinemas/admin/all?${params}`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages ?? 0);
        setTotalElements(result.data.totalElements ?? 0);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách rạp');
      }
    } catch {
      toast.error('Không thể tải danh sách rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [token, page, searchTerm, API_BASE_URL, authHeaders, navigate]);

  const fetchMyCinemas = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: '10',
        ...(searchTerm && { search: searchTerm }),
      });
      const response = await fetch(`${API_BASE_URL}/cinemas/my-cinemas?${params}`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalPages(result.data.totalPages ?? 0);
        setTotalElements(result.data.totalElements ?? 0);
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách rạp');
      }
    } catch {
      toast.error('Không thể tải danh sách rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [token, page, searchTerm, API_BASE_URL, authHeaders, navigate]);

  useEffect(() => {
    if (!token) {
      toast.error('Token không tồn tại. Vui lòng đăng nhập lại.');
      return;
    }
    if (activeTab === 'chains' && isSystemAdmin) {
      fetchCinemaChains();
    } else if (activeTab === 'cinemas') {
      if (isSystemAdmin) {
        fetchAllCinemas();
      } else {
        fetchMyCinemas();
      }
    }
  }, [
    token,
    activeTab,
    isSystemAdmin,
    listTick,
    fetchCinemaChains,
    fetchAllCinemas,
    fetchMyCinemas,
  ]);

  const handleTabChange = (tab) => {
    setSearchTerm('');
    setPage(0);
    setActiveTab(tab);
  };

  const handleChainSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
  };

  const handleCinemaSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
  };

  const handleOpenChainCreateModal = () => {
    setModalMode('create');
    setChainFormData({
      chainName: '',
      logoUrl: '',
      website: '',
      description: '',
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
      description: chain.description || '',
    });
    setIsActive(chain.isActive);
    setSelectedChain(chain);
    setShowModal(true);
  };

  const handleChainFormChange = (e) => {
    const { name, value } = e.target;
    setChainFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateChain = async () => {
    if (!chainFormData.chainName.trim()) {
      toast.error('Tên chuỗi rạp không được để trống');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(chainFormData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Tạo chuỗi rạp thành công!');
        handleCloseModal();
        setPage(0);
        bumpList();
      } else {
        toast.error(result.message || 'Lỗi khi tạo chuỗi rạp');
      }
    } catch {
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
          headers: authHeaders,
          body: JSON.stringify({
            chainId: selectedChain.chainId,
            ...chainFormData,
            isActive,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success('Cập nhật chuỗi rạp thành công!');
        handleCloseModal();
        bumpList();
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật chuỗi rạp');
      }
    } catch {
      toast.error('Không thể cập nhật chuỗi rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChain = async (chainId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chuỗi rạp này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/${chainId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Xóa chuỗi rạp thành công!');
        bumpList();
      } else {
        toast.error(result.message || 'Lỗi khi xóa chuỗi rạp');
      }
    } catch {
      toast.error('Không thể xóa chuỗi rạp. Vui lòng thử lại.');
    }
  };

  const handleOpenCinemaCreateModal = () => {
    if (!isSystemAdmin) {
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
      facilities: '',
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
      facilities: cinema.facilities || '',
    });
    setIsActive(cinema.isActive);
    setSelectedCinema(cinema);
    setShowModal(true);
  };

  const handleCinemaFormChange = (e) => {
    const { name, value } = e.target;
    setCinemaFormData((prev) => ({ ...prev, [name]: value }));
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
        headers: authHeaders,
        body: JSON.stringify({
          ...cinemaFormData,
          latitude: cinemaFormData.latitude ? parseFloat(cinemaFormData.latitude) : null,
          longitude: cinemaFormData.longitude ? parseFloat(cinemaFormData.longitude) : null,
          isActive,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Tạo rạp thành công!');
        handleCloseModal();
        setPage(0);
        bumpList();
      } else {
        toast.error(result.message || 'Lỗi khi tạo rạp');
      }
    } catch {
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
          headers: authHeaders,
          body: JSON.stringify({
            cinemaId: selectedCinema.cinemaId,
            chainId: selectedCinema.chainId,
            ...cinemaFormData,
            latitude: cinemaFormData.latitude ? parseFloat(cinemaFormData.latitude) : null,
            longitude: cinemaFormData.longitude ? parseFloat(cinemaFormData.longitude) : null,
            isActive,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        toast.success('Cập nhật rạp thành công!');
        handleCloseModal();
        bumpList();
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật rạp');
      }
    } catch {
      toast.error('Không thể cập nhật rạp. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCinema = async (cinema) => {
    if (!window.confirm(`Bạn có chắc muốn xóa rạp "${cinema.cinemaName}"?`)) return;
    try {
      const url = `${API_BASE_URL}/cinemas/admin/${cinema.cinemaId}?chainId=${cinema.chainId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Xóa rạp thành công!');
        bumpList();
      } else {
        toast.error(result.message || 'Lỗi khi xóa rạp');
      }
    } catch {
      toast.error('Không thể xóa rạp. Vui lòng thử lại.');
    }
  };

  const handleViewCinemaHalls = (cinema) => {
    navigate(`/admin/cinema-halls/${cinema.cinemaId}`, {
      state: {
        cinemaName: cinema.cinemaName,
        chainId: cinema.chainId,
        chainName: cinema.chainName,
      },
    });
  };

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedChain(null);
    setSelectedCinema(null);
    setChainFormData({
      chainName: '',
      logoUrl: '',
      website: '',
      description: '',
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
      facilities: '',
    });
    setIsActive(true);
  }, []);

  useEffect(() => {
    if (!showModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showModal, handleCloseModal]);

  const handleSave = async () => {
    if (activeTab === 'chains') {
      if (modalMode === 'create') await handleCreateChain();
      else await handleUpdateChain();
    } else if (modalMode === 'create') await handleCreateCinema();
    else await handleUpdateCinema();
  };

  const searchProps =
    activeTab === 'chains'
      ? {
          placeholder: 'Tìm kiếm chuỗi rạp...',
          onChange: handleChainSearch,
        }
      : {
          placeholder: 'Tìm kiếm rạp...',
          onChange: handleCinemaSearch,
        };

  return (
    <div className="adm-ucm">
      <div className="adm-ucm__hero">
        <div className="adm-ucm__title-row">
          <FaBuilding className="adm-ucm__ico" />
          <h1 className="adm-ucm__title">Quản lý rạp chiếu phim</h1>
        </div>
        {isSystemAdmin && (
          <div className="adm-ucm__tabs">
            <button
              type="button"
              className={`adm-ucm__tab ${activeTab === 'cinemas' ? 'is-active' : ''}`}
              onClick={() => handleTabChange('cinemas')}
            >
              <FaHome /> Tất cả rạp
            </button>
            <button
              type="button"
              className={`adm-ucm__tab ${activeTab === 'chains' ? 'is-active' : ''}`}
              onClick={() => handleTabChange('chains')}
            >
              <FaBuilding /> Chuỗi rạp
            </button>
          </div>
        )}
      </div>

      <div className="adm-ucm__toolbar">
        <div className="adm-ucm__search">
          <FaSearch className="adm-ucm__search-ico" />
          <input
            type="text"
            className="adm-ucm__search-input"
            placeholder={searchProps.placeholder}
            value={searchTerm}
            onChange={searchProps.onChange}
          />
        </div>
        <button
          type="button"
          className="adm-ucm__btn adm-ucm__btn--primary"
          onClick={
            activeTab === 'chains' ? handleOpenChainCreateModal : handleOpenCinemaCreateModal
          }
        >
          <FaPlus /> {activeTab === 'chains' ? 'Thêm chuỗi rạp' : 'Thêm rạp'}
        </button>
      </div>

      {loading ? (
        <div className="adm-ucm__state">
          <div className="adm-ucm__spin" />
          <span className="adm-ucm__muted">Đang tải dữ liệu</span>
        </div>
      ) : (
        <>
          {activeTab === 'chains' && (
            <div className="adm-ucm__table-wrap">
              <table className="adm-ucm__table">
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
                          <span
                            className={`adm-ucm__badge ${
                              chain.isActive ? 'adm-ucm__badge--ok' : 'adm-ucm__badge--off'
                            }`}
                          >
                            {chain.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td>
                          <div className="adm-ucm__actions">
                            <button
                              type="button"
                              className="adm-ucm__icon-btn adm-ucm__icon-btn--edit"
                              onClick={() => handleOpenChainEditModal(chain)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="adm-ucm__icon-btn adm-ucm__icon-btn--del"
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
                      <td colSpan={5} className="is-center">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'cinemas' && (
            <div className="adm-ucm__table-wrap">
              <table className="adm-ucm__table">
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
                          <span
                            className={`adm-ucm__badge ${
                              cinema.isActive ? 'adm-ucm__badge--ok' : 'adm-ucm__badge--off'
                            }`}
                          >
                            {cinema.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td>
                          <div className="adm-ucm__actions">
                            {isSystemAdmin && (
                              <button
                                type="button"
                                className="adm-ucm__icon-btn adm-ucm__icon-btn--view"
                                onClick={() => handleViewCinemaHalls(cinema)}
                                title="Quản lý phòng chiếu"
                              >
                                <FaFilm />
                              </button>
                            )}
                            <button
                              type="button"
                              className="adm-ucm__icon-btn adm-ucm__icon-btn--edit"
                              onClick={() => handleOpenCinemaEditModal(cinema)}
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              className="adm-ucm__icon-btn adm-ucm__icon-btn--del"
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
                      <td colSpan={6} className="is-center">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="adm-ucm__pager">
            <span className="adm-ucm__pager-info">
              Trang {page + 1} / {Math.max(totalPages, 1)} ({totalElements} mục)
            </span>
            <div className="adm-ucm__pager-btns">
              <button
                type="button"
                className="adm-ucm__pager-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Trước
              </button>
              <button
                type="button"
                className="adm-ucm__pager-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= totalPages - 1 || totalPages === 0}
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <div
          className="adm-ucm__modal"
          role="presentation"
        >
          <div
            className="adm-ucm__panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-ucm__panel-head">
              <h2>
                {activeTab === 'chains'
                  ? modalMode === 'create'
                    ? 'Tạo chuỗi rạp mới'
                    : 'Cập nhật chuỗi rạp'
                  : modalMode === 'create'
                    ? 'Tạo rạp mới'
                    : 'Cập nhật rạp'}
              </h2>
              <button type="button" className="adm-ucm__panel-x" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="adm-ucm__form">
              {activeTab === 'chains' ? (
                <>
                  <div className="adm-ucm__field">
                    <label>Tên chuỗi rạp *</label>
                    <input
                      type="text"
                      name="chainName"
                      value={chainFormData.chainName}
                      onChange={handleChainFormChange}
                      placeholder="Nhập tên chuỗi rạp"
                    />
                  </div>
                  <div className="adm-ucm__field">
                    <label>Logo URL</label>
                    <input
                      type="text"
                      name="logoUrl"
                      value={chainFormData.logoUrl}
                      onChange={handleChainFormChange}
                      placeholder="URL hình ảnh logo"
                    />
                  </div>
                  <div className="adm-ucm__field">
                    <label>Website</label>
                    <input
                      type="text"
                      name="website"
                      value={chainFormData.website}
                      onChange={handleChainFormChange}
                      placeholder="Website chuỗi rạp"
                    />
                  </div>
                  <div className="adm-ucm__field">
                    <label>Mô tả</label>
                    <textarea
                      name="description"
                      value={chainFormData.description}
                      onChange={handleChainFormChange}
                      placeholder="Mô tả chuỗi rạp"
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="adm-ucm__row2">
                    <div className="adm-ucm__field">
                      <label>Tên rạp *</label>
                      <input
                        type="text"
                        name="cinemaName"
                        value={cinemaFormData.cinemaName}
                        onChange={handleCinemaFormChange}
                        placeholder="Nhập tên rạp"
                      />
                    </div>
                    <div className="adm-ucm__field">
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
                  <div className="adm-ucm__row2">
                    <div className="adm-ucm__field">
                      <label>Địa chỉ</label>
                      <input
                        type="text"
                        name="address"
                        value={cinemaFormData.address}
                        onChange={handleCinemaFormChange}
                        placeholder="Địa chỉ"
                      />
                    </div>
                    <div className="adm-ucm__field">
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
                  <div className="adm-ucm__row2">
                    <div className="adm-ucm__field">
                      <label>Số điện thoại</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={cinemaFormData.phoneNumber}
                        onChange={handleCinemaFormChange}
                        placeholder="Số điện thoại"
                      />
                    </div>
                    <div className="adm-ucm__field">
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
                  <div className="adm-ucm__row2">
                    <div className="adm-ucm__field">
                      <label>Mã số thuế</label>
                      <input
                        type="text"
                        name="taxCode"
                        value={cinemaFormData.taxCode}
                        onChange={handleCinemaFormChange}
                        placeholder="Mã số thuế"
                      />
                    </div>
                    <div className="adm-ucm__field">
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
                  <div className="adm-ucm__row2">
                    <div className="adm-ucm__field">
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
                    <div className="adm-ucm__field">
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
                  <div className="adm-ucm__row2">
                    <div className="adm-ucm__field">
                      <label>Giờ mở cửa</label>
                      <input
                        type="text"
                        name="openingHours"
                        value={cinemaFormData.openingHours}
                        onChange={handleCinemaFormChange}
                        placeholder="Ví dụ: 09:00 - 23:00"
                      />
                    </div>
                    <div className="adm-ucm__field">
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

              <div className="adm-ucm__field adm-ucm__check">
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

            <div className="adm-ucm__panel-foot">
              <button
                type="button"
                className="adm-ucm__btn adm-ucm__btn--ghost"
                onClick={handleCloseModal}
              >
                <FaTimes /> Đóng
              </button>
              <button
                type="button"
                className="adm-ucm__btn adm-ucm__btn--primary"
                onClick={handleSave}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="adm-ucm__spin-sm" /> Đang lưu...
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

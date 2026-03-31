import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaPlus, 
  FaEdit, 
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
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import './CinemaManagement.css';

const CinemaManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedChainId = location.state?.chainId || null;
  const selectedChainName = location.state?.chainName || 'Tất Cả Chuỗi Rạp';
  
  const [cinemas, setCinemas] = useState([]);
  const [cinemaChains, setCinemaChains] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [listTick, setListTick] = useState(0);
  const initialListFetchRef = useRef(true);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const fetchCinemaChains = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/all?page=0&size=100`, {
        method: 'GET',
        headers: authHeaders,
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setCinemaChains(result.data.data || []);
        }
      }
    } catch {
      /* dropdown: im lặng */
    }
  }, [token, API_BASE_URL, authHeaders]);

  const fetchCinemas = useCallback(async () => {
    if (!token) {
      setLoading(false);
      navigate('/login');
      return;
    }
    if (initialListFetchRef.current) setLoading(true);
    try {
      let url = `${API_BASE_URL}/cinemas/admin/all?page=${page}&size=10`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (selectedChainId) {
        url += `&chainId=${selectedChainId}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error('Không thể tải danh sách rạp');
      }
      const result = await response.json();
      if (result.success && result.data) {
        setCinemas(result.data.data || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 0);
        if (typeof result.data.currentPage === 'number') {
          setPage(result.data.currentPage);
        }
      }
    } catch (error) {
      toast.error(error?.message ? `Không thể tải danh sách rạp: ${error.message}` : 'Không thể tải danh sách rạp');
    } finally {
      setLoading(false);
      initialListFetchRef.current = false;
    }
  }, [token, page, searchTerm, selectedChainId, API_BASE_URL, authHeaders, navigate]);

  useEffect(() => {
    fetchCinemaChains();
  }, [fetchCinemaChains]);

  useEffect(() => {
    fetchCinemas();
  }, [fetchCinemas, listTick]);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  }, []);

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
      
      const response = await fetch(`${API_BASE_URL}/cinemas/admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Tạo rạp thành công!');
        handleCloseModal();
        setListTick((t) => t + 1);
      } else {
        toast.error(result.message || 'Tạo rạp thất bại!');
      }
    } catch {
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

      const response = await fetch(`${API_BASE_URL}/cinemas/admin/${selectedCinema.cinemaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || 'Cập nhật rạp thành công!');
        handleCloseModal();
        if (result.data) {
          setDetailCinema(result.data);
          setShowDetailModal(true);
        }
        setListTick((t) => t + 1);
      } else {
        toast.error(result.message || 'Cập nhật rạp thất bại!');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật rạp');
    } finally {
      setSubmitting(false);
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
    <div className="adm-cin">
      {/* Header */}
      <header className="adm-cin__hero">
        <div className="adm-cin__hero-row">
          <button type="button" className="adm-cin__back" onClick={() => navigate('/admin/cinema-chains')}>
            ← Quay lại
          </button>
          <FaBuilding className="adm-cin__hero-ico" aria-hidden />
          <div className="adm-cin__titles">
            <h1 className="adm-cin__title">Quản lý rạp chiếu</h1>
            {selectedChainId && (
              <p className="adm-cin__sub">Chuỗi: {selectedChainName}</p>
            )}
          </div>
        </div>
        <button type="button" className="adm-cin__btn adm-cin__btn--primary" onClick={handleOpenCreateModal}>
          <FaPlus /> Thêm Rạp Mới
        </button>
      </header>

      <div className="adm-cin__toolbar">
        <div className="adm-cin__search">
          <FaSearch className="adm-cin__search-icon" aria-hidden />
          <input
            type="search"
            className="adm-cin__search-input"
            placeholder="Tìm kiếm theo tên rạp, địa chỉ, thành phố..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && cinemas.length === 0 ? (
        <div className="adm-cin__state" aria-busy="true">
          <FaSpinner className="adm-cin__spin" aria-hidden />
          <p>Đang tải…</p>
        </div>
      ) : cinemas.length === 0 ? (
        <div className="adm-cin__empty">
          <FaBuilding className="adm-cin__empty-ico" aria-hidden />
          <p>Không có rạp nào</p>
          <button type="button" className="adm-cin__btn adm-cin__btn--primary" onClick={handleOpenCreateModal}>
            <FaPlus /> Thêm Rạp Đầu Tiên
          </button>
        </div>
      ) : (
        <>
          <div
            className={`adm-cin__table-wrap${loading && cinemas.length > 0 ? ' adm-cin__table-wrap--busy' : ''}`}
            aria-busy={loading && cinemas.length > 0}
          >
            <table className="adm-cin__table">
              <thead>
                <tr>
                  <th>Tên rạp</th>
                  <th>TT</th>
                  <th>Chuỗi</th>
                  <th>Quản lý</th>
                  <th>Địa chỉ</th>
                  <th>Khu vực</th>
                  <th>Điện thoại</th>
                  <th>Email</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cinemas.map((cinema) => (
                  <tr
                    key={cinema.cinemaId}
                    className={!cinema.isActive ? 'adm-cin__tr--inactive' : undefined}
                  >
                    <td>
                      <button
                        type="button"
                        className="adm-cin__name-btn"
                        onClick={() =>
                          navigate(`/admin/cinemas/${cinema.cinemaId}`, {
                            state: {
                              chainId: cinema.chainId,
                              chainName: cinema.chainName,
                              cinemaName: cinema.cinemaName,
                            },
                          })
                        }
                        title="Mở phòng chiếu"
                      >
                        <FaBuilding className="adm-cin__name-ico" aria-hidden />
                        <span>{cinema.cinemaName}</span>
                      </button>
                    </td>
                    <td>
                      <span className={`adm-cin__badge ${cinema.isActive ? 'adm-cin__badge--ok' : 'adm-cin__badge--bad'}`}>
                        {cinema.isActive ? (
                          <>
                            <FaCheck aria-hidden /> HOẠT ĐỘNG
                          </>
                        ) : (
                          'NGƯNG'
                        )}
                      </span>
                    </td>
                    <td>
                      <span className="adm-cin__chain-tag">{cinema.chainName || '—'}</span>
                    </td>
                    <td>
                      <div className="adm-cin__mgr-cell">
                        <span className="adm-cin__mgr-name">{cinema.managerName || '—'}</span>
                        {cinema.managerEmail ? (
                          <span className="adm-cin__mgr-mail">{cinema.managerEmail}</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <span className="adm-cin__cell-clip" title={cinema.address || ''}>
                        {cinema.address || '—'}
                      </span>
                    </td>
                    <td>
                      {[cinema.city, cinema.district].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td className="adm-cin__cell-mono">{cinema.phoneNumber || '—'}</td>
                    <td>
                      <span className="adm-cin__cell-clip" title={cinema.email || ''}>
                        {cinema.email || '—'}
                      </span>
                    </td>
                    <td className="adm-cin__cell-date">
                      {cinema.createdAt
                        ? new Date(cinema.createdAt).toLocaleDateString('vi-VN')
                        : '—'}
                    </td>
                    <td>
                      <div className="adm-cin__actions-row">
                        <button
                          type="button"
                          className="adm-cin__btn adm-cin__btn--primary adm-cin__btn--sm"
                          onClick={() =>
                            navigate(`/admin/cinemas/${cinema.cinemaId}`, {
                              state: {
                                chainId: cinema.chainId,
                                chainName: cinema.chainName,
                                cinemaName: cinema.cinemaName,
                              },
                            })
                          }
                          title="Phòng chiếu"
                          aria-label="Phòng chiếu"
                        >
                          <FaChair aria-hidden />
                        </button>
                        <button
                          type="button"
                          className="adm-cin__btn adm-cin__btn--info adm-cin__btn--sm"
                          onClick={() => handleOpenEditModal(cinema)}
                          title="Sửa"
                          aria-label="Sửa rạp"
                        >
                          <FaEdit aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <nav className="adm-cin__pager" aria-label="Phân trang">
            <div className="adm-cin__pager-info">
              Hiển thị {cinemas.length} / {totalElements} rạp
            </div>
            <div className="adm-cin__pager-btns">
              <button
                type="button"
                className="adm-cin__pager-btn"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                ← Trước
              </button>
              <span className="adm-cin__pager-ind">
                Trang {page + 1} / {totalPages || 1}
              </span>
              <button
                type="button"
                className="adm-cin__pager-btn"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Tiếp →
              </button>
            </div>
          </nav>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="adm-cin__modal" role="presentation">
          <div className="adm-cin__panel" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="adm-cin__panel-head">
              <h2 id="adm-cin-form-title">{modalMode === 'create' ? 'Thêm rạp' : 'Sửa rạp'}</h2>
              <button type="button" className="adm-cin__panel-x" onClick={handleCloseModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>

            <form className="adm-cin__form" onSubmit={handleSubmit} aria-labelledby="adm-cin-form-title">
              <div className="adm-cin__row">
                <div className="adm-cin__field">
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
                <div className="adm-cin__field">
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

              <div className="adm-cin__row">
                <div className="adm-cin__field">
                  <label>Quản Lý ID <small style={{color: '#999', fontWeight: 'normal'}}>(Tùy chọn)</small></label>
                  <input
                    type="number"
                    name="managerId"
                    value={formData.managerId}
                    onChange={handleFormChange}
                    placeholder="Để trống nếu chưa có quản lý"
                  />
                </div>
                <div className="adm-cin__field">
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

              <div className="adm-cin__field">
                <label>Địa Chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleFormChange}
                  placeholder="Địa chỉ đầy đủ"
                />
              </div>

              <div className="adm-cin__row">
                <div className="adm-cin__field">
                  <label>Thành Phố</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleFormChange}
                    placeholder="Thành phố"
                  />
                </div>
                <div className="adm-cin__field">
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

              <div className="adm-cin__row">
                <div className="adm-cin__field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="adm-cin__field">
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

              <div className="adm-cin__field">
                <label>Tên Pháp Lý</label>
                <input
                  type="text"
                  name="legalName"
                  value={formData.legalName}
                  onChange={handleFormChange}
                  placeholder="Tên pháp lý công ty"
                />
              </div>

              <div className="adm-cin__row">
                <div className="adm-cin__field">
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
                <div className="adm-cin__field">
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

              <div className="adm-cin__sec-title">Giờ Mở Cửa</div>
              <div className="adm-cin__row">
                <div className="adm-cin__field">
                  <label>Thứ 2 - Thứ 6</label>
                  <input
                    type="text"
                    name="openingHours.Mon-Fri"
                    value={formData.openingHours?.["Mon-Fri"] || ''}
                    onChange={handleFormChange}
                    placeholder="09:00 - 23:00"
                  />
                </div>
                <div className="adm-cin__field">
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

              <div className="adm-cin__sec-title">Tiện Ích</div>
              <div className="adm-cin__facilities">
                <div className="adm-cin__field adm-cin__field--check">
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
                <div className="adm-cin__field adm-cin__field--check">
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
                <div className="adm-cin__field adm-cin__field--check">
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
                <div className="adm-cin__field adm-cin__field--check">
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
                <div className="adm-cin__field adm-cin__field--check">
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
                <div className="adm-cin__field adm-cin__field--check">
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
                <div className="adm-cin__field adm-cin__field--check">
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

              <div className="adm-cin__panel-actions">
                <button
                  type="button"
                  className="adm-cin__btn adm-cin__btn--ghost"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  <FaTimes aria-hidden /> Hủy
                </button>
                <button
                  type="submit"
                  className="adm-cin__btn adm-cin__btn--primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="adm-cin__spin-sm" aria-hidden /> Đang xử lý…
                    </>
                  ) : (
                    <>
                      <FaSave aria-hidden /> {modalMode === 'create' ? 'Tạo rạp' : 'Cập nhật'}
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
        <div className="adm-cin__modal" role="presentation">
          <div
            className="adm-cin__panel adm-cin__panel--wide"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="adm-cin__panel-head">
              <h2>
                <FaCheckCircle aria-hidden /> Cập nhật thành công
              </h2>
              <button type="button" className="adm-cin__panel-x" onClick={() => setShowDetailModal(false)} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>

            <div className="adm-cin__detail-body">
              <div className="adm-cin__ok-banner">
                <div className="adm-cin__ok-ico">
                  <FaCheck aria-hidden />
                </div>
                <div className="adm-cin__ok-text">
                  <strong>Rạp "{detailCinema.cinemaName}" đã được cập nhật!</strong>
                  <span>Thông tin chi tiết bên dưới</span>
                </div>
              </div>

              {/* Info Grid - 2 columns */}
              <div className="adm-cin__detail-grid">
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">
                    <FaBuilding aria-hidden /> Tên rạp
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.cinemaName}</div>
                </div>
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">
                    <FaBuilding aria-hidden /> Chuỗi
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.chainName}</div>
                </div>
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">
                    <FaUser aria-hidden /> Quản lý
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.managerName || 'Chưa phân công'}</div>
                </div>
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">
                    <FaEnvelope aria-hidden /> Email QL
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.managerEmail || '—'}</div>
                </div>
                <div className="adm-cin__detail-item adm-cin__detail-item--full">
                  <div className="adm-cin__detail-lbl">
                    <FaMapMarkerAlt aria-hidden /> Địa chỉ
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.address || '—'}</div>
                </div>
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">
                    <FaMapMarkerAlt aria-hidden /> Thành phố
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.city || '—'}</div>
                </div>
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">
                    <FaPhone aria-hidden /> Điện thoại
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.phoneNumber || '—'}</div>
                </div>
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">
                    <FaEnvelope aria-hidden /> Email rạp
                  </div>
                  <div className="adm-cin__detail-val">{detailCinema.email || '—'}</div>
                </div>
                <div className="adm-cin__detail-item">
                  <div className="adm-cin__detail-lbl">Trạng thái</div>
                  <div className="adm-cin__detail-val">
                    <span className={`adm-cin__status ${detailCinema.isActive ? 'is-on' : 'is-off'}`}>
                      {detailCinema.isActive ? '● Hoạt động' : '● Ngưng hoạt động'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              {detailCinema.facilities && Object.values(detailCinema.facilities).some((v) => v) && (
                <div className="adm-cin__fac-sec">
                  <div className="adm-cin__fac-lbl">
                    <FaChair aria-hidden /> Tiện ích
                  </div>
                  <div className="adm-cin__fac-list">
                    {Object.entries(detailCinema.facilities).map(
                      ([key, value]) =>
                        value && (
                          <span key={key} className="adm-cin__fac-badge">
                            <FaCheck aria-hidden /> {key.replace(/_/g, ' ').replace('support', '').trim()}
                          </span>
                        )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="adm-cin__panel-actions">
              <button
                type="button"
                className="adm-cin__btn adm-cin__btn--primary"
                onClick={() => setShowDetailModal(false)}
              >
                <FaCheck aria-hidden /> Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaManagement;

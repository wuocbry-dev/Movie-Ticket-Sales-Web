import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheck,
  FaArrowLeft,
  FaChair,
  FaFilm,
  FaVolumeUp,
  FaSync,
  FaTrashAlt
} from 'react-icons/fa';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './CinemaHallManagement.css';

const CinemaHallManagement = () => {
  const { cinemaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cinemaInfo = location.state || {};
  
  const [halls, setHalls] = useState([]);
  const [cinemaName, setCinemaName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedHall, setSelectedHall] = useState(null);
  const [formData, setFormData] = useState({
    hallName: '',
    hallType: '2D',
    totalSeats: '',
    rowsCount: '',
    seatsPerRow: '',
    screenType: '',
    soundSystem: '',
    vipRows: 'A,B',
    coupleRows: 'C',
    wheelchairRows: 'E',
    specificVipSeats: '',
    specificCoupleSeats: '',
    specificWheelchairSeats: '',
    aisles: 'B-C',
    verticalAisles: '5-6'
  });
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailHall, setDetailHall] = useState(null);
  const [showSeatMapModal, setShowSeatMapModal] = useState(false);
  const [seatMapHall, setSeatMapHall] = useState(null);
  const [seatMapData, setSeatMapData] = useState([]);
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

  const fetchHalls = useCallback(async () => {
    if (!cinemaId) {
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      navigate('/login');
      return;
    }
    if (initialListFetchRef.current) setLoading(true);
    try {
      let url = `${API_BASE_URL}/cinema-halls/cinema/${cinemaId}?page=${page}&size=12`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders,
      });
      if (!response.ok) {
        let msg = 'Lỗi khi lấy danh sách phòng chiếu';
        try {
          const errorData = await response.json();
          msg = errorData.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const result = await response.json();
      if (result.success && result.data) {
        setHalls(result.data.data || []);
        setTotalPages(result.data.totalPages ?? 0);
        setTotalElements(result.data.totalElements ?? 0);
        const rows = result.data.data || [];
        if (rows.length > 0 && rows[0].cinemaName) {
          setCinemaName(rows[0].cinemaName);
        }
      } else {
        toast.error(result.message || 'Lỗi khi lấy danh sách phòng chiếu');
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi lấy danh sách phòng chiếu');
    } finally {
      setLoading(false);
      initialListFetchRef.current = false;
    }
  }, [cinemaId, page, searchTerm, token, API_BASE_URL, authHeaders, navigate]);

  useEffect(() => {
    if (cinemaInfo.cinemaName) {
      setCinemaName(cinemaInfo.cinemaName);
    }
  }, [cinemaInfo.cinemaName]);

  useEffect(() => {
    setPage(0);
    setSearchTerm('');
  }, [cinemaId]);

  useEffect(() => {
    fetchHalls();
  }, [fetchHalls, listTick]);

  const anyModalOpen = showModal || showDetailModal || showSeatMapModal;
  useEffect(() => {
    if (!anyModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showSeatMapModal) setShowSeatMapModal(false);
      else if (showDetailModal) setShowDetailModal(false);
      else if (showModal) setShowModal(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [anyModalOpen, showModal, showDetailModal, showSeatMapModal]);

  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
  }, []);

  // Open create modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData({
      hallName: '',
      hallType: '2D',
      totalSeats: '',
      rowsCount: '',
      seatsPerRow: '',
      screenType: '',
      soundSystem: '',
      vipRows: 'A,B',
      coupleRows: 'C',
      wheelchairRows: 'E',
      specificVipSeats: '',
      specificCoupleSeats: '',
      specificWheelchairSeats: '',
      aisles: 'B-C',
      verticalAisles: '5-6'
    });
    setIsActive(true);
    setSelectedHall(null);
    setShowModal(true);
  };

  // Open edit modal
  const handleOpenEditModal = (hall) => {
    setModalMode('edit');
    
    // Parse seatLayout to extract all seat type configurations
    let vipRowsStr = '';
    let coupleRowsStr = '';
    let wheelchairRowsStr = '';
    let specificVipSeatsStr = '';
    let specificCoupleSeatsStr = '';
    let specificWheelchairSeatsStr = '';
    let aislesStr = '';
    let verticalAislesStr = '';
    
    if (hall.seatLayout) {
      if (hall.seatLayout.VIP_Rows && Array.isArray(hall.seatLayout.VIP_Rows)) {
        vipRowsStr = hall.seatLayout.VIP_Rows.join(',');
      }
      if (hall.seatLayout.COUPLE_Rows && Array.isArray(hall.seatLayout.COUPLE_Rows)) {
        coupleRowsStr = hall.seatLayout.COUPLE_Rows.join(',');
      }
      if (hall.seatLayout.WHEELCHAIR_Rows && Array.isArray(hall.seatLayout.WHEELCHAIR_Rows)) {
        wheelchairRowsStr = hall.seatLayout.WHEELCHAIR_Rows.join(',');
      }
      
      // Extract specific seat assignments (e.g., D5: VIP, E6: COUPLE)
      const specificVipSeats = [];
      const specificCoupleSeats = [];
      const specificWheelchairSeats = [];
      
      Object.keys(hall.seatLayout).forEach(key => {
        if (key.match(/^[A-Z]\d+$/)) { // Match seat pattern like A1, B5, etc
          const seatType = hall.seatLayout[key];
          if (seatType === 'VIP') {
            specificVipSeats.push(key);
          } else if (seatType === 'COUPLE') {
            specificCoupleSeats.push(key);
          } else if (seatType === 'WHEELCHAIR') {
            specificWheelchairSeats.push(key);
          }
        }
      });
      
      specificVipSeatsStr = specificVipSeats.join(',');
      specificCoupleSeatsStr = specificCoupleSeats.join(',');
      specificWheelchairSeatsStr = specificWheelchairSeats.join(',');
      
      if (hall.seatLayout.aisles && Array.isArray(hall.seatLayout.aisles)) {
        aislesStr = hall.seatLayout.aisles.join(',');
      }
      if (hall.seatLayout.verticalAisles && Array.isArray(hall.seatLayout.verticalAisles)) {
        verticalAislesStr = hall.seatLayout.verticalAisles.join(',');
      }
    }
    
    setFormData({
      hallName: hall.hallName,
      hallType: hall.hallType || '2D',
      totalSeats: hall.totalSeats || '',
      rowsCount: hall.rowsCount || '',
      seatsPerRow: hall.seatsPerRow || '',
      screenType: hall.screenType || '',
      soundSystem: hall.soundSystem || '',
      vipRows: vipRowsStr,
      coupleRows: coupleRowsStr,
      wheelchairRows: wheelchairRowsStr,
      specificVipSeats: specificVipSeatsStr,
      specificCoupleSeats: specificCoupleSeatsStr,
      specificWheelchairSeats: specificWheelchairSeatsStr,
      aisles: aislesStr,
      verticalAisles: verticalAislesStr
    });
    setIsActive(hall.isActive);
    setSelectedHall(hall);
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Submit form (create or update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.hallName.trim()) {
      toast.error('Vui lòng nhập tên phòng chiếu');
      return;
    }
    if (!formData.totalSeats || parseInt(formData.totalSeats) <= 0) {
      toast.error('Vui lòng nhập số lượng ghế hợp lệ');
      return;
    }

    setSubmitting(true);

    try {
      let url, method, body, successMessage;

      // Build seatLayout object
      const seatLayout = {};
      
      if (formData.vipRows && formData.vipRows.trim()) {
        seatLayout.VIP_Rows = formData.vipRows.split(',').map(r => r.trim()).filter(r => r);
      }
      if (formData.coupleRows && formData.coupleRows.trim()) {
        seatLayout.COUPLE_Rows = formData.coupleRows.split(',').map(r => r.trim()).filter(r => r);
      }
      if (formData.wheelchairRows && formData.wheelchairRows.trim()) {
        seatLayout.WHEELCHAIR_Rows = formData.wheelchairRows.split(',').map(r => r.trim()).filter(r => r);
      }
      
      // Add specific seat assignments
      if (formData.specificVipSeats && formData.specificVipSeats.trim()) {
        const vipSeats = formData.specificVipSeats.split(',').map(s => s.trim()).filter(s => s);
        vipSeats.forEach(seat => {
          seatLayout[seat] = 'VIP';
        });
      }
      if (formData.specificCoupleSeats && formData.specificCoupleSeats.trim()) {
        const coupleSeats = formData.specificCoupleSeats.split(',').map(s => s.trim()).filter(s => s);
        coupleSeats.forEach(seat => {
          seatLayout[seat] = 'COUPLE';
        });
      }
      if (formData.specificWheelchairSeats && formData.specificWheelchairSeats.trim()) {
        const wheelchairSeats = formData.specificWheelchairSeats.split(',').map(s => s.trim()).filter(s => s);
        wheelchairSeats.forEach(seat => {
          seatLayout[seat] = 'WHEELCHAIR';
        });
      }
      
      if (formData.aisles && formData.aisles.trim()) {
        seatLayout.aisles = formData.aisles.split(',').map(a => a.trim()).filter(a => a);
      }
      if (formData.verticalAisles && formData.verticalAisles.trim()) {
        seatLayout.verticalAisles = formData.verticalAisles.split(',').map(a => a.trim()).filter(a => a);
      }

      if (modalMode === 'create') {
        url = `${API_BASE_URL}/cinema-halls/admin`;
        method = 'POST';
        body = {
          cinemaId: parseInt(cinemaId),
          hallName: formData.hallName,
          totalSeats: parseInt(formData.totalSeats),
          rowsCount: formData.rowsCount ? parseInt(formData.rowsCount) : null,
          seatsPerRow: formData.seatsPerRow ? parseInt(formData.seatsPerRow) : null,
          screenType: formData.screenType,
          soundSystem: formData.soundSystem,
          seatLayout: Object.keys(seatLayout).length > 0 ? seatLayout : null
        };
        successMessage = 'Tạo phòng chiếu thành công';
      } else {
        url = `${API_BASE_URL}/cinema-halls/admin/${selectedHall.hallId}`;
        method = 'PUT';
        body = {
          hallId: selectedHall.hallId,
          cinemaId: parseInt(cinemaId),
          hallName: formData.hallName,
          totalSeats: parseInt(formData.totalSeats),
          rowsCount: formData.rowsCount ? parseInt(formData.rowsCount) : null,
          seatsPerRow: formData.seatsPerRow ? parseInt(formData.seatsPerRow) : null,
          screenType: formData.screenType,
          soundSystem: formData.soundSystem,
          seatLayout: Object.keys(seatLayout).length > 0 ? seatLayout : null,
          isActive: isActive
        };
        successMessage = 'Cập nhật phòng chiếu thành công';
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
        throw new Error(errorData.message || 'Lỗi khi lưu phòng chiếu');
      }

      const result = await response.json();

      if (result.success) {
        toast.success(successMessage);
        setShowModal(false);
        
        // Show detail modal with updated data for edit mode
        if (modalMode === 'edit' && result.data) {
          setDetailHall(result.data);
          setShowDetailModal(true);
        }
        
        bumpList();
      } else {
        toast.error(result.message || 'Lỗi khi lưu phòng chiếu');
      }
    } catch (error) {
      toast.error('Lỗi: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete hall
  const handleDelete = async (hall) => {
    if (window.confirm(`Bạn có chắc muốn xóa phòng chiếu "${hall.hallName}"?`)) {
      try {
        const url = `${API_BASE_URL}/cinema-halls/admin/${hall.hallId}?cinemaId=${cinemaId}`;

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi xóa phòng chiếu');
        }

        const result = await response.json();

        if (result.success) {
          toast.success('Xóa phòng chiếu thành công');
          bumpList();
        } else {
          toast.error(result.message || 'Lỗi khi xóa phòng chiếu');
        }
      } catch (error) {
        toast.error('Lỗi: ' + error.message);
      }
    }
  };

  // Delete all seats in hall
  const handleDeleteSeats = async (hall) => {
    if (window.confirm(`Bạn có chắc muốn xóa TẤT CẢ ghế trong phòng "${hall.hallName}"?`)) {
      try {
        const url = `${API_BASE_URL}/cinema-halls/admin/${hall.hallId}/seats`;

        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi xóa ghế');
        }

        const result = await response.json();

        if (result.success) {
          toast.success(result.data || 'Xóa ghế thành công');
          bumpList();
        } else {
          toast.error(result.message || 'Lỗi khi xóa ghế');
        }
      } catch (error) {
        toast.error('Lỗi: ' + error.message);
      }
    }
  };

  // Generate seat map from seatLayout
  const generateSeatMapFromLayout = (hall) => {
    if (!hall.rowsCount || !hall.seatsPerRow) {
      return [];
    }

    const rowsCount = parseInt(hall.rowsCount);
    const seatsPerRow = parseInt(hall.seatsPerRow);
    const seatLayout = hall.seatLayout || {};
    
    // Get seat type configurations
    const vipRows = seatLayout.VIP_Rows || [];
    const coupleRows = seatLayout.COUPLE_Rows || [];
    const wheelchairRows = seatLayout.WHEELCHAIR_Rows || [];
    const verticalAisles = seatLayout.verticalAisles || [];
    const horizontalAisles = seatLayout.aisles || [];
    
    // Generate row labels (A, B, C, ...)
    const rows = [];
    for (let i = 0; i < rowsCount; i++) {
      rows.push(String.fromCharCode(65 + i)); // A=65 in ASCII
    }
    
    // Check if a column has aisle after it
    const hasVerticalAisleAfter = (seatNumber) => {
      return verticalAisles.some((aisle) => {
        const [firstCol] = aisle.split('-').map((n) => parseInt(n, 10));
        return seatNumber === firstCol;
      });
    };
    
    // Check if a row has horizontal aisle after it
    const hasHorizontalAisleAfter = (rowLabel) => {
      return horizontalAisles.some((aisle) => {
        const [firstRow] = aisle.split('-');
        return rowLabel === firstRow;
      });
    };
    
    // Generate seat map
    const seatMapArray = rows.map(row => {
      const seats = [];
      
      // Determine seat type for this row
      let defaultSeatType = 'STANDARD';
      if (vipRows.includes(row)) {
        defaultSeatType = 'VIP';
      } else if (coupleRows.includes(row)) {
        defaultSeatType = 'COUPLE';
      } else if (wheelchairRows.includes(row)) {
        defaultSeatType = 'WHEELCHAIR';
      }
      
      // Generate seats for this row
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatKey = `${row}${i}`;
        // Check if specific seat has custom type in seatLayout
        const seatType = seatLayout[seatKey] || defaultSeatType;
        
        seats.push({
          seatId: seatKey,
          rowName: row,
          seatNumber: i,
          seatType: seatType,
          hasVerticalAisleAfter: hasVerticalAisleAfter(i)
        });
      }
      
      return { 
        row, 
        seats,
        hasAisleAfter: hasHorizontalAisleAfter(row)
      };
    });
    
    return seatMapArray;
  };

  // Show seat map from hall's seatLayout
  const handleShowSeatMap = (hall) => {
    setSeatMapHall(hall);
    const generatedSeatMap = generateSeatMapFromLayout(hall);
    setSeatMapData(generatedSeatMap);
    setShowSeatMapModal(true);
  };

  // Regenerate seats in hall
  const handleRegenerateSeats = async (hall) => {
    if (window.confirm(`Bạn có chắc muốn TẠO LẠI tất cả ghế cho phòng "${hall.hallName}"?\nGhế cũ sẽ bị xóa và tạo mới.`)) {
      try {
        const url = `${API_BASE_URL}/cinema-halls/admin/${hall.hallId}/regenerate-seats`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Lỗi khi tạo lại ghế');
        }

        const result = await response.json();

        if (result.success) {
          toast.success(result.data || 'Tạo lại ghế thành công');
          bumpList();
        } else {
          toast.error(result.message || 'Lỗi khi tạo lại ghế');
        }
      } catch (error) {
        toast.error('Lỗi: ' + error.message);
      }
    }
  };

  return (
    <div className="adm-chm">
      {/* Header */}
      <div className="adm-chm__hero">
        <div className="adm-chm__hero-main">
          <button
            type="button"
            className="adm-chm__back"
            onClick={() => navigate('/admin/cinemas', {
              state: {
                chainId: cinemaInfo.chainId,
                chainName: cinemaInfo.chainName,
              },
            })}
            title="Quay lại Quản Lý Rạp Chiếu"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="adm-chm__title">Quản Lý Phòng Chiếu</h1>
            <p className="adm-chm__sub">{cinemaName}</p>
          </div>
        </div>
        <div className="adm-chm__stats">
          <span className="adm-chm__stat">Tổng phòng: <strong>{totalElements}</strong></span>
        </div>
      </div>

      {/* Search and Create Bar */}
      <div className="adm-chm__toolbar">
        <div className="adm-chm__search">
          <FaSearch className="adm-chm__search-ico" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng chiếu..."
            value={searchTerm}
            onChange={handleSearch}
            className="adm-chm__search-input"
          />
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="adm-chm__btn adm-chm__btn--primary"
        >
          <FaPlus /> Tạo Phòng Chiếu
        </button>
      </div>

      {/* Loading State */}
      {loading && halls.length === 0 ? (
        <div className="adm-chm__state">
          <FaSpinner className="adm-chm__spin" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : null}

      {halls.length > 0 ? (
        <div
          className={`adm-chm__table-wrap${loading && halls.length > 0 ? ' adm-chm__table-wrap--busy' : ''}`}
          aria-busy={loading && halls.length > 0}
        >
          <table className="adm-chm__table">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Loại</th>
                <th>Chỗ ngồi</th>
                <th>Màn hình</th>
                <th>Âm thanh</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {halls.map((hall) => (
                <tr key={hall.hallId}>
                  <td>
                    <span className="adm-chm__hall-name">{hall.hallName}</span>
                  </td>
                  <td>
                    <span className="adm-chm__tag">{hall.hallType || '—'}</span>
                  </td>
                  <td className="adm-chm__cell-cap">
                    <FaChair className="adm-chm__ico" aria-hidden />
                    <span>
                      {hall.totalSeats} ghế
                      {hall.rowsCount && hall.seatsPerRow
                        ? ` (${hall.rowsCount}×${hall.seatsPerRow})`
                        : ''}
                    </span>
                  </td>
                  <td>
                    <span className="adm-chm__cell-clip" title={hall.screenType || ''}>
                      {hall.screenType || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="adm-chm__cell-clip" title={hall.soundSystem || ''}>
                      {hall.soundSystem || '—'}
                    </span>
                  </td>
                  <td>
                    <span className={`adm-chm__pill ${hall.isActive ? 'adm-chm__pill--on' : 'adm-chm__pill--off'}`}>
                      {hall.isActive ? '✓ Hoạt động' : '✗ Vô hiệu'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-chm__actions-row">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(hall)}
                        className="adm-chm__icon-btn adm-chm__icon-btn--edit"
                        title="Sửa"
                        aria-label="Sửa phòng"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(hall)}
                        className="adm-chm__icon-btn adm-chm__icon-btn--danger"
                        title="Xóa phòng"
                        aria-label="Xóa phòng"
                      >
                        <FaTrash />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShowSeatMap(hall)}
                        className="adm-chm__icon-btn"
                        title="Sơ đồ ghế"
                        aria-label="Sơ đồ ghế"
                      >
                        <FaChair />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegenerateSeats(hall)}
                        className="adm-chm__icon-btn adm-chm__icon-btn--warn"
                        title="Tạo lại ghế"
                        aria-label="Tạo lại ghế"
                      >
                        <FaSync />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSeats(hall)}
                        className="adm-chm__icon-btn adm-chm__icon-btn--danger"
                        title="Xóa ghế"
                        aria-label="Xóa ghế"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && halls.length === 0 ? (
        <div className="adm-chm__empty">
          <FaChair className="adm-chm__empty-ico" />
          <p>Không có phòng chiếu nào</p>
          <small>Hãy tạo phòng chiếu đầu tiên cho rạp này</small>
        </div>
      ) : null}

      {/* Pagination */}
      {!loading && halls.length > 0 && (
        <nav className="adm-chm__pager" aria-label="Phân trang">
          <div className="adm-chm__pager-summary">
            Hiển thị {halls.length} / {totalElements} phòng
          </div>
          <div className="adm-chm__pager-row">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="adm-chm__pager-btn"
            >
              ← Trước
            </button>
            <span className="adm-chm__pager-info">
              Trang {page + 1} / {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="adm-chm__pager-btn"
            >
              Tiếp →
            </button>
          </div>
        </nav>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="adm-chm__modal"
          role="presentation"
        >
          <div
            className="adm-chm__panel"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-chm__panel-head">
              <h2>{modalMode === 'create' ? 'Tạo Phòng Chiếu Mới' : 'Chỉnh Sửa Phòng Chiếu'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="adm-chm__panel-x"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="adm-chm__form">
              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Tên Phòng Chiếu *</label>
                  <input
                    type="text"
                    name="hallName"
                    value={formData.hallName}
                    onChange={handleInputChange}
                    placeholder="VD: Phòng A, Screen 1"
                    required
                  />
                </div>
                <div className="adm-chm__field">
                  <label>Loại Phòng *</label>
                  <select
                    name="hallType"
                    value={formData.hallType}
                    onChange={handleInputChange}
                  >
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="4DX">4DX</option>
                    <option value="IMAX">IMAX</option>
                  </select>
                </div>
              </div>

              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Tổng Số Ghế *</label>
                  <input
                    type="number"
                    name="totalSeats"
                    value={formData.totalSeats}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="VD: 100"
                    required
                  />
                </div>
                <div className="adm-chm__field">
                  <label>Số Hàng</label>
                  <input
                    type="number"
                    name="rowsCount"
                    value={formData.rowsCount}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="VD: 10"
                  />
                </div>
                <div className="adm-chm__field">
                  <label>Ghế/Hàng</label>
                  <input
                    type="number"
                    name="seatsPerRow"
                    value={formData.seatsPerRow}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="VD: 10"
                  />
                </div>
              </div>

              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Loại Màn Hình</label>
                  <input
                    type="text"
                    name="screenType"
                    value={formData.screenType}
                    onChange={handleInputChange}
                    placeholder="VD: Laser 4K, Dolby Cinema"
                  />
                </div>
                <div className="adm-chm__field">
                  <label>Hệ Thống Âm Thanh</label>
                  <input
                    type="text"
                    name="soundSystem"
                    value={formData.soundSystem}
                    onChange={handleInputChange}
                    placeholder="VD: Dolby Atmos, 7.1 Surround"
                  />
                </div>
              </div>

              <h3 className="adm-chm__form-sec">Cấu Hình Loại Ghế Theo Hàng</h3>
              
              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Hàng Ghế VIP</label>
                  <input
                    type="text"
                    name="vipRows"
                    value={formData.vipRows}
                    onChange={handleInputChange}
                    placeholder="VD: A,B"
                  />
                  <small>Các hàng ghế VIP (VD: A,B,C)</small>
                </div>
                <div className="adm-chm__field">
                  <label>Hàng Ghế Đôi</label>
                  <input
                    type="text"
                    name="coupleRows"
                    value={formData.coupleRows}
                    onChange={handleInputChange}
                    placeholder="VD: C,D"
                  />
                  <small>Các hàng ghế đôi (VD: C,D)</small>
                </div>
              </div>

              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Hàng Ghế Xe Lăn</label>
                  <input
                    type="text"
                    name="wheelchairRows"
                    value={formData.wheelchairRows}
                    onChange={handleInputChange}
                    placeholder="VD: E,F"
                  />
                  <small>Các hàng ghế dành cho xe lăn (VD: E,F)</small>
                </div>
              </div>

              <h3 className="adm-chm__form-sec">Chỉ Định Ghế Cụ Thể</h3>
              
              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Ghế VIP Riêng Lẻ</label>
                  <input
                    type="text"
                    name="specificVipSeats"
                    value={formData.specificVipSeats}
                    onChange={handleInputChange}
                    placeholder="VD: D5,D6,E7"
                  />
                  <small>Chỉ định ghế VIP cụ thể (VD: D5,D6,E7)</small>
                </div>
                <div className="adm-chm__field">
                  <label>Ghế Đôi Riêng Lẻ</label>
                  <input
                    type="text"
                    name="specificCoupleSeats"
                    value={formData.specificCoupleSeats}
                    onChange={handleInputChange}
                    placeholder="VD: E5,E6"
                  />
                  <small>Chỉ định ghế đôi cụ thể (VD: E5,E6,F8,F9)</small>
                </div>
              </div>

              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Ghế Xe Lăn Riêng Lẻ</label>
                  <input
                    type="text"
                    name="specificWheelchairSeats"
                    value={formData.specificWheelchairSeats}
                    onChange={handleInputChange}
                    placeholder="VD: A1,A2"
                  />
                  <small>Chỉ định ghế xe lăn cụ thể (VD: A1,A2)</small>
                </div>
              </div>

              <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Cấu Hình Lối Đi</h3>

              <div className="adm-chm__form-row">
                <div className="adm-chm__field">
                  <label>Lối Đi Ngang (Giữa Hàng)</label>
                  <input
                    type="text"
                    name="aisles"
                    value={formData.aisles}
                    onChange={handleInputChange}
                    placeholder="VD: B-C,D-E"
                  />
                  <small>Lối đi ngang giữa các hàng (VD: B-C,D-E)</small>
                </div>
                <div className="adm-chm__field">
                  <label>Lối Đi Dọc (Giữa Cột)</label>
                  <input
                    type="text"
                    name="verticalAisles"
                    value={formData.verticalAisles}
                    onChange={handleInputChange}
                    placeholder="VD: 5-6,10-11"
                  />
                  <small>Lối đi dọc giữa các cột ghế (VD: 5-6,10-11)</small>
                </div>
              </div>

              {modalMode === 'edit' && (
                <div className="adm-chm__form-row">
                  <div className="adm-chm__field">
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

              <div className="adm-chm__form-actions">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="adm-chm__btn adm-chm__btn--ghost"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="adm-chm__btn adm-chm__btn--primary"
                  disabled={submitting}
                >
                  {submitting ? <FaSpinner className="adm-chm__spin" /> : <FaSave />}
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailHall && (
        <div
          className="adm-chm__modal"
          role="presentation"
        >
          <div
            className="adm-chm__panel adm-chm__panel--detail"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-chm__panel-head">
              <h2>Chi Tiết Phòng Chiếu Sau Khi Cập Nhật</h2>
              <button className="adm-chm__panel-x" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="adm-chm__detail">
              <div className="adm-chm__detail-sec">
                <h3><FaChair /> Thông Tin Cơ Bản</h3>
                <div className="adm-chm__detail-grid">
                  <div className="adm-chm__detail-item">
                    <label>ID Phòng:</label>
                    <span>{detailHall.hallId}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label>Tên Phòng:</label>
                    <span>{detailHall.hallName}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label>Rạp Chiếu:</label>
                    <span>{detailHall.cinemaName}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label>Loại Phòng:</label>
                    <span className="adm-chm__tag">{detailHall.hallType || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="adm-chm__detail-sec">
                <h3><FaChair /> Thông Tin Ghế Ngồi</h3>
                <div className="adm-chm__detail-grid">
                  <div className="adm-chm__detail-item">
                    <label>Tổng Số Ghế:</label>
                    <span className="adm-chm__highlight">{detailHall.totalSeats}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label>Số Hàng:</label>
                    <span>{detailHall.rowsCount || 'N/A'}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label>Ghế Mỗi Hàng:</label>
                    <span>{detailHall.seatsPerRow || 'N/A'}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label>Trạng Thái:</label>
                    <span className={`adm-chm__badge ${detailHall.isActive ? 'adm-chm__badge--ok' : 'adm-chm__badge--bad'}`}>
                      {detailHall.isActive ? (
                        <>
                          <FaCheck /> Hoạt động
                        </>
                      ) : (
                        'Ngưng hoạt động'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="adm-chm__detail-sec">
                <h3><FaFilm /> Thiết Bị Kỹ Thuật</h3>
                <div className="adm-chm__detail-grid">
                  <div className="adm-chm__detail-item">
                    <label>Loại Màn Hình:</label>
                    <span>{detailHall.screenType || 'N/A'}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label><FaVolumeUp /> Hệ Thống Âm Thanh:</label>
                    <span>{detailHall.soundSystem || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {detailHall.seatLayout && Object.keys(detailHall.seatLayout).length > 0 && (
                <div className="adm-chm__detail-sec">
                  <h3>Sơ Đồ Ghế</h3>
                  <div className="adm-chm__layout-pre">
                    <pre>{JSON.stringify(detailHall.seatLayout, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div className="adm-chm__detail-sec">
                <h3>Thời Gian</h3>
                <div className="adm-chm__detail-grid">
                  <div className="adm-chm__detail-item">
                    <label>Ngày Tạo:</label>
                    <span>{new Date(detailHall.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="adm-chm__detail-item">
                    <label>Cập Nhật Lần Cuối:</label>
                    <span>{new Date(detailHall.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="adm-chm__form-actions">
              <button 
                type="button" 
                className="adm-chm__btn adm-chm__btn--primary"
                onClick={() => setShowDetailModal(false)}
              >
                <FaCheck /> Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seat Map Modal */}
      {showSeatMapModal && (
        <div className="adm-chm__modal">
          <div className="adm-chm__panel adm-chm__panel--seatmap" onClick={(e) => e.stopPropagation()}>
            <div className="adm-chm__panel-head">
              <h2>
                <FaChair /> Sơ Đồ Ghế - {seatMapHall?.hallName}
              </h2>
              <button className="adm-chm__panel-x" onClick={() => setShowSeatMapModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="adm-chm__seatmap">
              <div className="adm-chm__screen-wrap">
                <div className="adm-chm__screen">Màn hình</div>
              </div>

              {seatMapData.length === 0 ? (
                <div className="adm-chm__seatmap-empty">
                  <p>Chưa có ghế nào được tạo cho phòng này</p>
                </div>
              ) : (
                <div className="adm-chm__seatmap-grid">
                  {seatMapData.map(({ row, seats, hasAisleAfter }) => {
                    return (
                      <div 
                        key={row} 
                        className={`adm-chm__seatmap-row ${hasAisleAfter ? 'adm-chm__seatmap-row--aisle' : ''}`}
                      >
                        <span className="adm-chm__row-lbl">{row}</span>
                        <div className="adm-chm__seats">
                          {seats.map((seat, idx) => (
                            <React.Fragment key={seat.seatId}>
                              <div
                                className={`adm-chm__seat ${seat.seatType.toLowerCase()}`}
                                title={`${seat.rowName}${seat.seatNumber} - ${seat.seatType}`}
                              >
                                {seat.seatNumber}
                              </div>
                              {seat.hasVerticalAisleAfter && (
                                <div className="adm-chm__aisle-v"></div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {seatMapData.length > 0 && (
                <div className="adm-chm__legend">
                  <div className="adm-chm__legend-item">
                    <div className="adm-chm__legend-box adm-chm__legend-box--std"></div>
                    <span>Ghế Thường</span>
                  </div>
                  <div className="adm-chm__legend-item">
                    <div className="adm-chm__legend-box adm-chm__legend-box--vip"></div>
                    <span>Ghế VIP</span>
                  </div>
                  <div className="adm-chm__legend-item">
                    <div className="adm-chm__legend-box adm-chm__legend-box--cpl"></div>
                    <span>Ghế Đôi</span>
                  </div>
                  <div className="adm-chm__legend-item">
                    <div className="adm-chm__legend-box adm-chm__legend-box--wc"></div>
                    <span>Ghế Xe Lăn</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaHallManagement;

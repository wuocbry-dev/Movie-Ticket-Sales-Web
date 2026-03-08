import React, { useState, useEffect } from 'react';
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
import { toast } from 'react-toastify';
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
  const [loading, setLoading] = useState(false);
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

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  // Fetch halls for the cinema
  const fetchHalls = async (pageNum = 0, search = '') => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/cinema-halls/cinema/${cinemaId}?page=${pageNum}&size=12`;
      if (search) {
        url += `&search=${search}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || 'Lỗi khi lấy danh sách phòng chiếu');
      }

      const result = await response.json();
      console.log('Hall fetch result:', result);

      if (result.success && result.data) {
        setHalls(result.data.data || []);
        setTotalPages(result.data.totalPages);
        setTotalElements(result.data.totalElements);
        setPage(pageNum);
        
        // Set cinema name from first hall
        if (result.data.data && result.data.data.length > 0) {
          setCinemaName(result.data.data[0].cinemaName);
        }
      } else {
        console.error('Error response:', result.message);
        toast.error(result.message || 'Lỗi khi lấy danh sách phòng chiếu');
      }
    } catch (error) {
      console.error('Error fetching halls:', error);
      toast.error('Lỗi khi lấy danh sách phòng chiếu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHalls(0);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setPage(0);
    fetchHalls(0, value);
  };

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
        
        fetchHalls(page, searchTerm);
      } else {
        toast.error(result.message || 'Lỗi khi lưu phòng chiếu');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
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
          fetchHalls(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa phòng chiếu');
        }
      } catch (error) {
        console.error('Error deleting hall:', error);
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
          fetchHalls(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi xóa ghế');
        }
      } catch (error) {
        console.error('Error deleting seats:', error);
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
      return verticalAisles.some(aisle => {
        const [firstCol, secondCol] = aisle.split('-').map(n => parseInt(n));
        return seatNumber === firstCol;
      });
    };
    
    // Check if a row has horizontal aisle after it
    const hasHorizontalAisleAfter = (rowLabel) => {
      return horizontalAisles.some(aisle => {
        const [firstRow, secondRow] = aisle.split('-');
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
          fetchHalls(page, searchTerm);
        } else {
          toast.error(result.message || 'Lỗi khi tạo lại ghế');
        }
      } catch (error) {
        console.error('Error regenerating seats:', error);
        toast.error('Lỗi: ' + error.message);
      }
    }
  };

  return (
    <div className="hall-management-container">
      {/* Header */}
      <div className="hall-management-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/admin/cinemas', { 
              state: { 
                chainId: cinemaInfo.chainId, 
                chainName: cinemaInfo.chainName 
              } 
            })}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#059669'
            }}
            title="Quay lại Quản Lý Rạp Chiếu"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1>Quản Lý Phòng Chiếu</h1>
            <p className="header-cinema-name">{cinemaName}</p>
          </div>
        </div>
        <div className="header-stats">
          <span className="stat">Tổng phòng: <strong>{totalElements}</strong></span>
        </div>
      </div>

      {/* Search and Create Bar */}
      <div className="hall-management-toolbar">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm phòng chiếu..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="btn-primary"
        >
          <FaPlus /> Tạo Phòng Chiếu
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <FaSpinner className="spinner" />
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Halls Grid */}
      {!loading && halls.length > 0 && (
        <div className="halls-grid">
          {halls.map((hall) => (
            <div key={hall.hallId} className="hall-card">
              <div className="hall-card-header">
                <h3>{hall.hallName}</h3>
                <div className="hall-actions">
                  <button 
                    onClick={() => handleOpenEditModal(hall)}
                    className="btn-edit"
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={() => handleDelete(hall)}
                    className="btn-delete"
                    title="Xóa"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="hall-card-body">
                <div className="chm-info-row">
                  <span className="label">Loại:</span>
                  <span className="value">{hall.hallType}</span>
                </div>

                <div className="chm-info-row">
                  <FaChair className="chm-info-icon" />
                  <span className="value">
                    {hall.totalSeats} ghế
                    {hall.rowsCount && hall.seatsPerRow
                      ? ` (${hall.rowsCount}x${hall.seatsPerRow})`
                      : 'N/A'}
                  </span>
                </div>

                {hall.screenType && (
                  <div className="chm-info-row">
                    <FaFilm className="chm-info-icon" />
                    <span className="value">{hall.screenType}</span>
                  </div>
                )}

                {hall.soundSystem && (
                  <div className="chm-info-row">
                    <FaVolumeUp className="chm-info-icon" />
                    <span className="value">{hall.soundSystem}</span>
                  </div>
                )}

                <div className="chm-info-row">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge ${hall.isActive ? 'active' : 'inactive'}`}>
                    {hall.isActive ? '✓ Hoạt động' : '✗ Vô hiệu'}
                  </span>
                </div>
              </div>

              <div className="hall-card-footer">
                <button 
                  onClick={() => handleShowSeatMap(hall)}
                  className="btn-view-seats"
                  title="Xem sơ đồ ghế"
                >
                  <FaChair /> Sơ đồ ghế
                </button>
                <button 
                  onClick={() => handleRegenerateSeats(hall)}
                  className="btn-regenerate"
                  title="Tạo lại ghế"
                >
                  <FaSync /> Tạo lại ghế
                </button>
                <button 
                  onClick={() => handleDeleteSeats(hall)}
                  className="btn-delete-seats"
                  title="Xóa tất cả ghế"
                >
                  <FaTrashAlt /> Xóa ghế
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && halls.length === 0 && (
        <div className="empty-state">
          <FaChair className="empty-icon" />
          <p>Không có phòng chiếu nào</p>
          <small>Hãy tạo phòng chiếu đầu tiên cho rạp này</small>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => fetchHalls(page - 1, searchTerm)}
            disabled={page === 0}
            className="pagination-btn"
          >
            Trang trước
          </button>
          <span className="page-info">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => fetchHalls(page + 1, searchTerm)}
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
              <h2>{modalMode === 'create' ? 'Tạo Phòng Chiếu Mới' : 'Chỉnh Sửa Phòng Chiếu'}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="modal-close-btn"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="modal-form">
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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

              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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
                <div className="form-group">
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

              <div className="form-row">
                <div className="form-group">
                  <label>Loại Màn Hình</label>
                  <input
                    type="text"
                    name="screenType"
                    value={formData.screenType}
                    onChange={handleInputChange}
                    placeholder="VD: Laser 4K, Dolby Cinema"
                  />
                </div>
                <div className="form-group">
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

              <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Cấu Hình Loại Ghế Theo Hàng</h3>
              
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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

              <div className="form-row">
                <div className="form-group">
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

              <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#667eea' }}>Chỉ Định Ghế Cụ Thể</h3>
              
              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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

              <div className="form-row">
                <div className="form-group">
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

              <div className="form-row">
                <div className="form-group">
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
                <div className="form-group">
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
                  disabled={submitting}
                >
                  {submitting ? <FaSpinner className="spinner" /> : <FaSave />}
                  {submitting ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailHall && (
        <div className="modal-overlay">
          <div className="modal-content modal-detail">
            <div className="modal-header">
              <h2>Chi Tiết Phòng Chiếu Sau Khi Cập Nhật</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="detail-content">
              <div className="detail-section">
                <h3><FaChair /> Thông Tin Cơ Bản</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>ID Phòng:</label>
                    <span>{detailHall.hallId}</span>
                  </div>
                  <div className="detail-item">
                    <label>Tên Phòng:</label>
                    <span>{detailHall.hallName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Rạp Chiếu:</label>
                    <span>{detailHall.cinemaName}</span>
                  </div>
                  <div className="detail-item">
                    <label>Loại Phòng:</label>
                    <span className="badge-type">{detailHall.hallType || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3><FaChair /> Thông Tin Ghế Ngồi</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Tổng Số Ghế:</label>
                    <span className="highlight-number">{detailHall.totalSeats}</span>
                  </div>
                  <div className="detail-item">
                    <label>Số Hàng:</label>
                    <span>{detailHall.rowsCount || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Ghế Mỗi Hàng:</label>
                    <span>{detailHall.seatsPerRow || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Trạng Thái:</label>
                    <span className={`badge ${detailHall.isActive ? 'badge-success' : 'badge-danger'}`}>
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

              <div className="detail-section">
                <h3><FaFilm /> Thiết Bị Kỹ Thuật</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Loại Màn Hình:</label>
                    <span>{detailHall.screenType || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label><FaVolumeUp /> Hệ Thống Âm Thanh:</label>
                    <span>{detailHall.soundSystem || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {detailHall.seatLayout && Object.keys(detailHall.seatLayout).length > 0 && (
                <div className="detail-section">
                  <h3>Sơ Đồ Ghế</h3>
                  <div className="seat-layout-preview">
                    <pre>{JSON.stringify(detailHall.seatLayout, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div className="detail-section">
                <h3>Thời Gian</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Ngày Tạo:</label>
                    <span>{new Date(detailHall.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="detail-item">
                    <label>Cập Nhật Lần Cuối:</label>
                    <span>{new Date(detailHall.updatedAt).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                type="button" 
                className="btn-primary"
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
        <div className="modal-overlay" onClick={() => setShowSeatMapModal(false)}>
          <div className="modal-content seat-map-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                <FaChair /> Sơ Đồ Ghế - {seatMapHall?.hallName}
              </h2>
              <button className="close-btn" onClick={() => setShowSeatMapModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="seat-map-container">
              <div className="screen-wrapper">
                <div className="screen">Màn hình</div>
              </div>

              {seatMapData.length === 0 ? (
                <div className="empty-seat-map">
                  <p>Chưa có ghế nào được tạo cho phòng này</p>
                </div>
              ) : (
                <div className="seat-map-grid">
                  {seatMapData.map(({ row, seats, hasAisleAfter }) => {
                    return (
                      <div 
                        key={row} 
                        className={`seat-map-row ${hasAisleAfter ? 'with-aisle-after' : ''}`}
                      >
                        <span className="row-label">{row}</span>
                        <div className="seats-grid">
                          {seats.map((seat, idx) => (
                            <React.Fragment key={seat.seatId}>
                              <div
                                className={`seat-box ${seat.seatType.toLowerCase()}`}
                                title={`${seat.rowName}${seat.seatNumber} - ${seat.seatType}`}
                              >
                                {seat.seatNumber}
                              </div>
                              {seat.hasVerticalAisleAfter && (
                                <div className="vertical-aisle-spacer"></div>
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
                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="legend-box standard"></div>
                    <span>Ghế Thường</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-box vip"></div>
                    <span>Ghế VIP</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-box couple"></div>
                    <span>Ghế Đôi</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-box wheelchair"></div>
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

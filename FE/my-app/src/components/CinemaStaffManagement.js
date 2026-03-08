import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { FaUserPlus, FaTrash, FaSearch, FaBuilding, FaUserTie, FaSync } from 'react-icons/fa';
import './CinemaStaffManagement.css';

const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

const CinemaStaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    cinemaId: '',
    position: 'TICKET_CHECKER',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCinemaManager, setIsCinemaManager] = useState(false);
  const [managerCinemaId, setManagerCinemaId] = useState(null);

  useEffect(() => {
    // Get current user info
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
        
        // Check if user is cinema manager
        const isManager = userData.roles && userData.roles.includes('CINEMA_MANAGER');
        setIsCinemaManager(isManager);
        
        // If manager, fetch their cinema
        if (isManager && !userData.roles.includes('SYSTEM_ADMIN')) {
          fetchManagerCinema(userData.userId);
        }
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
    
    fetchCinemas();
  }, []);

  useEffect(() => {
    if (selectedCinema) {
      fetchStaffByCinema(selectedCinema);
      fetchAvailableStaffUsers();
    }
  }, [selectedCinema]);

  // Fetch cinema của manager
  const fetchManagerCinema = async (userId) => {
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/cinema-staffs/my-cinema?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.cinemaId) {
          setManagerCinemaId(data.cinemaId);
          setSelectedCinema(data.cinemaId.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching manager cinema:', error);
    }
  };

  const fetchCinemas = async () => {
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/cinemas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // API returns: { success: true, data: { data: [...cinemas...], totalElements, ... } }
        let cinemaList = [];
        if (Array.isArray(data)) {
          cinemaList = data;
        } else if (data.data && Array.isArray(data.data.data)) {
          // ApiResponse<PagedCinemaResponse> structure
          cinemaList = data.data.data;
        } else if (data.data && Array.isArray(data.data)) {
          cinemaList = data.data;
        }
        // Chỉ lấy các rạp có isActive = true
        const activeCinemas = cinemaList.filter(cinema => cinema.isActive === true);
        setCinemas(activeCinemas);
      }
    } catch (error) {
      console.error('Error fetching cinemas:', error);
      toast.error('Không thể tải danh sách rạp');
    }
  };

  // Fetch users với role CINEMA_STAFF
  const fetchAvailableStaffUsers = async () => {
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/roles/CINEMA_STAFF/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // API trả về ApiResponse<List<UserInfo>>
        const userList = data.data || data || [];
        setAvailableUsers(userList);
      }
    } catch (error) {
      console.error('Error fetching staff users:', error);
    }
  };

  // GET /api/cinema-staffs/cinema/{cinemaId}
  const fetchStaffByCinema = async (cinemaId) => {
    setIsLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/cinema-staffs/cinema/${cinemaId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaffList(data || []);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể tải danh sách nhân viên');
        setStaffList([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Không thể tải danh sách nhân viên');
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // POST /api/cinema-staffs/assign?assignedById=xxx
  const handleAssignStaff = async (e) => {
    e.preventDefault();
    
    if (!assignForm.userId || !assignForm.cinemaId) {
      toast.error('Vui lòng chọn nhân viên và rạp');
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/cinema-staffs/assign?assignedById=${currentUser?.userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: parseInt(assignForm.userId),
          cinemaId: parseInt(assignForm.cinemaId),
          position: assignForm.position,
          notes: assignForm.notes
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Gán nhân viên vào rạp thành công!');
        setShowAssignModal(false);
        setAssignForm({ userId: '', cinemaId: selectedCinema || '', position: 'TICKET_CHECKER', notes: '' });
        if (selectedCinema) {
          fetchStaffByCinema(selectedCinema);
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể gán nhân viên');
      }
    } catch (error) {
      console.error('Error assigning staff:', error);
      toast.error('Có lỗi xảy ra khi gán nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  // DELETE /api/cinema-staffs/remove?userId=xxx&cinemaId=xxx
  const handleRemoveStaff = async (userId, cinemaId) => {
    if (!window.confirm('Bạn có chắc muốn cho nhân viên này nghỉ việc tại rạp?')) {
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/api/cinema-staffs/remove?userId=${userId}&cinemaId=${cinemaId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        toast.success('Đã cho nhân viên nghỉ việc tại rạp');
        fetchStaffByCinema(selectedCinema);
      } else {
        toast.error(data.message || 'Không thể xóa nhân viên');
      }
    } catch (error) {
      console.error('Error removing staff:', error);
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffList.filter(staff =>
    staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPositionLabel = (position) => {
    const positions = {
      'TICKET_CHECKER': 'Kiểm vé',
      'CASHIER': 'Thu ngân',
      'CONCESSION': 'Bán bắp nước',
      'GENERAL': 'Nhân viên chung'
    };
    return positions[position] || position;
  };

  return (
    <div className="cinema-staff-management">
      <div className="csm-page-header">
        <h1><FaUserTie /> Quản lý nhân viên rạp</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowAssignModal(true)}
        >
          <FaUserPlus /> Gán nhân viên vào rạp
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-group">
          <label><FaBuilding /> Chọn rạp:</label>
          <select 
            value={selectedCinema} 
            onChange={(e) => setSelectedCinema(e.target.value)}
          >
            <option value="">-- Chọn rạp --</option>
            {cinemas.map(cinema => (
              <option key={cinema.cinemaId || cinema.id} value={cinema.cinemaId || cinema.id}>
                {cinema.cinemaName}
              </option>
            ))}
          </select>
        </div>

        {selectedCinema && (
          <div className="search-box">
            <FaSearch />
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Staff List */}
      {selectedCinema ? (
        <div className="staff-list">
          {isLoading ? (
            <div className="loading">Đang tải...</div>
          ) : filteredStaff.length > 0 ? (
            <table className="staff-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vị trí</th>
                  <th>Ngày bắt đầu</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map(staff => (
                  <tr key={staff.id}>
                    <td>{staff.fullName}</td>
                    <td>{staff.email}</td>
                    <td>{staff.phoneNumber || 'N/A'}</td>
                    <td>
                      <span className={`position-badge ${staff.position?.toLowerCase()}`}>
                        {getPositionLabel(staff.position)}
                      </span>
                    </td>
                    <td>{staff.startDate ? new Date(staff.startDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${staff.isActive ? 'active' : 'inactive'}`}>
                        {staff.isActive ? 'Đang làm việc' : 'Đã nghỉ'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-danger btn-sm"
                        onClick={() => handleRemoveStaff(staff.userId, staff.cinemaId)}
                        title="Cho nghỉ việc"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <FaUserTie className="empty-icon" />
              <p>Chưa có nhân viên nào được gán vào rạp này</p>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-state">
          <FaBuilding className="empty-icon" />
          <p>Vui lòng chọn rạp để xem danh sách nhân viên</p>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2><FaUserPlus /> Gán nhân viên vào rạp</h2>
            <form onSubmit={handleAssignStaff}>
              <div className="form-group">
                <label>Chọn nhân viên * <small>(Chỉ hiển thị user có role CINEMA_STAFF)</small></label>
                <select
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({...assignForm, userId: e.target.value})}
                  required
                >
                  <option value="">-- Chọn nhân viên --</option>
                  {availableUsers.map(user => (
                    <option key={user.userId || user.id} value={user.userId || user.id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <small className="help-text">Chưa có user nào có role CINEMA_STAFF. Vui lòng gán role trước.</small>
                )}
              </div>

              <div className="form-group">
                <label>Chọn rạp *</label>
                <select
                  value={assignForm.cinemaId}
                  onChange={(e) => setAssignForm({...assignForm, cinemaId: e.target.value})}
                  required
                  disabled={isCinemaManager && managerCinemaId}
                >
                  <option value="">-- Chọn rạp --</option>
                  {cinemas.map(cinema => (
                    <option key={cinema.cinemaId || cinema.id} value={cinema.cinemaId || cinema.id}>
                      {cinema.cinemaName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Vị trí</label>
                <select
                  value={assignForm.position}
                  onChange={(e) => setAssignForm({...assignForm, position: e.target.value})}
                >
                  <option value="TICKET_CHECKER">Kiểm vé</option>
                  <option value="CASHIER">Thu ngân</option>
                  <option value="CONCESSION">Bán bắp nước</option>
                  <option value="GENERAL">Nhân viên chung</option>
                </select>
              </div>

              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={assignForm.notes}
                  onChange={(e) => setAssignForm({...assignForm, notes: e.target.value})}
                  placeholder="Ghi chú về nhân viên..."
                  rows={3}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading}>
                  {isLoading ? 'Đang xử lý...' : 'Gán nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaStaffManagement;

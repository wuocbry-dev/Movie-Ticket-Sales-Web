import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaEdit, FaFilter, FaTrash, FaCheckCircle, FaCrown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AccountManagement.css';

const AccountManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [roles, setRoles] = useState([]);
  const [membershipTiers, setMembershipTiers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newTier, setNewTier] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchMembershipTiers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      
      console.log('👥 Users API response:', response.data);
      console.log('📊 First user structure:', response.data.data?.[0]);
      
      if (response.data.success) {
        setUsers(response.data.data);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await api.get('/admin/roles');
      
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchMembershipTiers = async () => {
    try {
      const response = await api.get('/admin/membership-tiers');
      
      if (response.data.success) {
        setMembershipTiers(response.data.data);
        console.log('👑 Membership tiers:', response.data.data);
      }
    } catch (error) {
      console.error('Error fetching membership tiers:', error);
    }
  };

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole(user.roles[0] || '');
    setShowEditModal(true);
  };

  const handleUpdateRole = async () => {
    if (!newRole) {
      toast.warning('Vui lòng chọn vai trò');
      return;
    }

    try {
      const response = await api.put('/admin/users/role', {
        userId: selectedUser.userId,
        roleName: newRole
      });

      if (response.data.success) {
        toast.success('Cập nhật vai trò thành công');
        setShowEditModal(false);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Không thể cập nhật vai trò');
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${user.fullName}" (${user.email})?`)) {
      try {
        console.log('🗑️ Deactivating user:', user.userId);
        const response = await api.delete(`/admin/users/${user.userId}`);
        console.log('✅ Deactivate response:', response.data);
        
        if (response.data.success) {
          toast.success('Đã vô hiệu hóa tài khoản thành công');
          fetchUsers();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error('❌ Error deactivating user:', error);
        console.error('Error response:', error.response);
        
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
          toast.error('Bạn không có quyền vô hiệu hóa tài khoản này');
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Không thể vô hiệu hóa tài khoản');
        }
      }
    }
  };

  const handleActivateUser = async (user) => {
    if (window.confirm(`Bạn có chắc chắn muốn kích hoạt lại tài khoản "${user.fullName}" (${user.email})?`)) {
      try {
        console.log('✅ Activating user:', user.userId);
        const response = await api.put(`/admin/users/${user.userId}/activate`);
        console.log('✅ Activate response:', response.data);
        
        if (response.data.success) {
          toast.success('Đã kích hoạt tài khoản thành công');
          fetchUsers();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        console.error('❌ Error activating user:', error);
        
        if (error.response?.status === 401) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        } else if (error.response?.status === 403) {
          toast.error('Bạn không có quyền kích hoạt tài khoản này');
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Không thể kích hoạt tài khoản');
        }
      }
    }
  };

  const handleEditTier = (user) => {
    setSelectedUser(user);
    setNewTier(user.membershipTier || '');
    setShowTierModal(true);
  };

  const handleUpdateTier = async () => {
    if (!newTier) {
      toast.warning('Vui lòng chọn hạng thành viên');
      return;
    }

    try {
      const response = await api.put('/admin/users/membership-tier', {
        userId: selectedUser.userId,
        tierName: newTier
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowTierModal(false);
        fetchUsers();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error('Error updating membership tier:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật hạng thành viên');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || 
      user.roles.includes(filterRole) ||
      (filterRole === 'no-role' && user.roles.length === 0);
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'badge-admin';
      case 'CINEMA_MANAGER':
        return 'badge-manager';
      case 'CUSTOMER':
        return 'badge-customer';
      default:
        return 'badge-default';
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'Quản trị viên';
      case 'CINEMA_MANAGER':
        return 'Quản lý rạp';
      case 'CUSTOMER':
        return 'Khách hàng';
      default:
        return role;
    }
  };

  const getTierDisplayName = (tierName) => {
    const tier = membershipTiers.find(t => t.tierName === tierName);
    return tier?.tierNameDisplay || tierName;
  };

  const getTierBadgeClass = (tierName) => {
    switch (tierName?.toUpperCase()) {
      case 'DIAMOND':
        return 'tier-diamond';
      case 'PLATINUM':
        return 'tier-platinum';
      case 'GOLD':
        return 'tier-gold';
      case 'SILVER':
        return 'tier-silver';
      case 'BRONZE':
      default:
        return 'tier-bronze';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="account-management">
      <div className="am-page-header">
        <div className="am-header-left">
          <FaUsers className="am-page-icon" />
          <div>
            <h1>Quản lý tài khoản</h1>
            <p className="am-page-description">Quản lý người dùng và phân quyền hệ thống</p>
          </div>
        </div>
        <div className="am-header-stats">
          <div className="am-stat-card">
            <div className="am-stat-value">{users.length}</div>
            <div className="am-stat-label">Tổng người dùng</div>
          </div>
          <div className="am-stat-card">
            <div className="am-stat-value">{users.filter(u => u.roles.includes('SYSTEM_ADMIN')).length}</div>
            <div className="am-stat-label">Quản trị viên</div>
          </div>
          <div className="am-stat-card">
            <div className="am-stat-value">{users.filter(u => u.roles.includes('CUSTOMER')).length}</div>
            <div className="am-stat-label">Khách hàng</div>
          </div>
        </div>
      </div>

      <div className="am-filters-section">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="SYSTEM_ADMIN">Quản trị viên</option>
            <option value="CINEMA_MANAGER">Quản lý rạp</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="no-role">Chưa có vai trò</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thông tin người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hạng thành viên</th>
              <th>Điểm tích lũy</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">
                  Không tìm thấy người dùng nào
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.userId}>
                  <td className="user-id">#{user.userId}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.fullName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="user-email">{user.email}</td>
                  <td>
                    <div className="roles-container">
                      {user.roles.length === 0 ? (
                        <span className="badge badge-default">Chưa có vai trò</span>
                      ) : (
                        user.roles.map((role, index) => (
                          <span key={index} className={`badge ${getRoleBadgeClass(role)}`}>
                            {getRoleDisplayName(role)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="membership-tier">
                    {user.membershipTier ? (
                      <span className={`tier-badge ${getTierBadgeClass(user.membershipTier)}`}>
                        {getTierDisplayName(user.membershipTier)}
                      </span>
                    ) : (
                      <span className="text-muted">Chưa có</span>
                    )}
                  </td>
                  <td className="points">
                    <span className="points-badge">
                      {user.availablePoints !== undefined ? user.availablePoints : 0} điểm
                    </span>
                  </td>
                  <td className="status">
                    {user.isActive !== undefined && user.isActive !== null ? (
                      user.isActive ? (
                        <span className="status-badge status-active">Hoạt động</span>
                      ) : (
                        <span className="status-badge status-inactive">Vô hiệu hóa</span>
                      )
                    ) : (
                      <span className="status-badge status-active">Hoạt động</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleEditRole(user)}
                        title="Chỉnh sửa vai trò"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="btn-action btn-tier"
                        onClick={() => handleEditTier(user)}
                        title="Nâng hạng thành viên"
                      >
                        <FaCrown />
                      </button>
                      {(user.isActive === undefined || user.isActive === null || user.isActive) ? (
                        <button 
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteUser(user)}
                          title="Vô hiệu hóa tài khoản"
                        >
                          <FaTrash />
                        </button>
                      ) : (
                        <button 
                          className="btn-action btn-activate"
                          onClick={() => handleActivateUser(user)}
                          title="Kích hoạt lại tài khoản"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Chỉnh sửa vai trò</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-info-modal">
                <div className="user-avatar-large">
                  {selectedUser?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser?.fullName}</h3>
                  <p className="text-muted">{selectedUser?.email}</p>
                </div>
              </div>

              <div className="form-group">
                <label>Vai trò hiện tại:</label>
                <div className="current-roles">
                  {selectedUser?.roles.length === 0 ? (
                    <span className="badge badge-default">Chưa có vai trò</span>
                  ) : (
                    selectedUser?.roles.map((role, index) => (
                      <span key={index} className={`badge ${getRoleBadgeClass(role)}`}>
                        {getRoleDisplayName(role)}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Chọn vai trò mới:</label>
                <select 
                  value={newRole} 
                  onChange={(e) => setNewRole(e.target.value)}
                  className="role-select"
                >
                  <option value="">-- Chọn vai trò --</option>
                  {roles.map(role => (
                    <option key={role.roleId} value={role.roleName}>
                      {getRoleDisplayName(role.roleName)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-save" 
                onClick={handleUpdateRole}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {showTierModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2><FaCrown className="modal-icon" /> Nâng hạng thành viên</h2>
              <button className="close-btn" onClick={() => setShowTierModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-info-modal">
                <div className="user-avatar-large">
                  {selectedUser?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3>{selectedUser?.fullName}</h3>
                  <p className="text-muted">{selectedUser?.email}</p>
                </div>
              </div>

              <div className="form-group">
                <label>Hạng hiện tại:</label>
                <div className="current-tier">
                  {selectedUser?.membershipTier ? (
                    <span className={`tier-badge ${getTierBadgeClass(selectedUser.membershipTier)}`}>
                      {getTierDisplayName(selectedUser.membershipTier)}
                    </span>
                  ) : (
                    <span className="text-muted">Chưa có hạng</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Chọn hạng mới:</label>
                <select 
                  value={newTier} 
                  onChange={(e) => setNewTier(e.target.value)}
                  className="tier-select"
                >
                  <option value="">-- Chọn hạng thành viên --</option>
                  {membershipTiers.map(tier => (
                    <option key={tier.tierId} value={tier.tierName}>
                      {tier.tierNameDisplay} (Level {tier.tierLevel})
                    </option>
                  ))}
                </select>
              </div>

              {newTier && (
                <div className="tier-preview">
                  {(() => {
                    const selectedTier = membershipTiers.find(t => t.tierName === newTier);
                    if (!selectedTier) return null;
                    return (
                      <div className="tier-info-card">
                        <h4><FaCrown /> {selectedTier.tierNameDisplay}</h4>
                        <ul>
                          <li>Tỉ lệ tích điểm: <strong>x{selectedTier.pointsEarnRate}</strong></li>
                          <li>Vé miễn phí/năm: <strong>{selectedTier.freeTicketsPerYear}</strong></li>
                          {selectedTier.birthdayGiftDescription && (
                            <li>Quà sinh nhật: <strong>{selectedTier.birthdayGiftDescription}</strong></li>
                          )}
                          <li>Chi tiêu tối thiểu: <strong>{new Intl.NumberFormat('vi-VN').format(selectedTier.minAnnualSpending)}đ</strong></li>
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowTierModal(false)}
              >
                Hủy
              </button>
              <button 
                className="btn-save btn-tier-save" 
                onClick={handleUpdateTier}
              >
                <FaCrown /> Nâng hạng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;

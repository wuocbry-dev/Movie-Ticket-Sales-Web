import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaUser,
  FaSearch,
  FaEdit,
  FaFilter,
  FaTrash,
  FaCheckCircle,
  FaCrown,
  FaUserShield,
  FaSpinner,
  FaTimes,
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import api from '../../services/api';
import './AccountManagement.css';

const AccountManagement = () => {
  const navigate = useNavigate();
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
  const [listTick, setListTick] = useState(0);
  const initialListFetchRef = useRef(true);

  const bumpList = useCallback(() => setListTick((t) => t + 1), []);

  const fetchUsers = useCallback(async () => {
    if (!Cookies.get('accessToken')) {
      navigate('/login');
      return;
    }
    if (initialListFetchRef.current) setLoading(true);
    try {
      const response = await api.get('/admin/users');
      if (response.data.success) {
        setUsers(Array.isArray(response.data.data) ? response.data.data : []);
      } else {
        toast.error(response.data.message || 'Không thể tải danh sách');
      }
    } catch {
      toast.error('Không thể tải danh sách người dùng');
      setUsers([]);
    } finally {
      setLoading(false);
      initialListFetchRef.current = false;
    }
  }, [navigate]);

  const fetchRoles = useCallback(async () => {
    if (!Cookies.get('accessToken')) return;
    try {
      const response = await api.get('/admin/roles');
      if (response.data.success) {
        setRoles(response.data.data || []);
      }
    } catch {
      /* optional */
    }
  }, []);

  const fetchMembershipTiers = useCallback(async () => {
    if (!Cookies.get('accessToken')) return;
    try {
      const response = await api.get('/admin/membership-tiers');
      if (response.data.success) {
        setMembershipTiers(response.data.data || []);
      }
    } catch {
      /* optional */
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchMembershipTiers();
  }, [fetchRoles, fetchMembershipTiers]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, listTick]);

  const closeEditModal = useCallback(() => setShowEditModal(false), []);
  const closeTierModal = useCallback(() => setShowTierModal(false), []);

  const anyModal = showEditModal || showTierModal;
  useEffect(() => {
    if (!anyModal) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showTierModal) closeTierModal();
      else closeEditModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [anyModal, showEditModal, showTierModal, closeEditModal, closeTierModal]);

  const handleEditRole = (user) => {
    setSelectedUser(user);
    setNewRole((user.roles && user.roles[0]) || '');
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
        roleName: newRole,
      });
      if (response.data.success) {
        toast.success('Cập nhật vai trò thành công');
        closeEditModal();
        bumpList();
      } else {
        toast.error(response.data.message);
      }
    } catch {
      toast.error('Không thể cập nhật vai trò');
    }
  };

  const handleDeleteUser = async (user) => {
    if (
      !window.confirm(`Vô hiệu hóa tài khoản "${user.fullName}" (${user.email})?`)
    ) {
      return;
    }
    try {
      const response = await api.delete(`/admin/users/${user.userId}`);
      if (response.data.success) {
        toast.success('Đã vô hiệu hóa tài khoản');
        bumpList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền thao tác tài khoản này');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể vô hiệu hóa tài khoản');
      }
    }
  };

  const handleActivateUser = async (user) => {
    if (!window.confirm(`Kích hoạt lại "${user.fullName}" (${user.email})?`)) return;
    try {
      const response = await api.put(`/admin/users/${user.userId}/activate`);
      if (response.data.success) {
        toast.success('Đã kích hoạt tài khoản');
        bumpList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền thao tác tài khoản này');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể kích hoạt tài khoản');
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
        tierName: newTier,
      });
      if (response.data.success) {
        toast.success(response.data.message || 'Đã cập nhật hạng');
        closeTierModal();
        bumpList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Không thể cập nhật hạng thành viên');
      }
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const name = user.fullName?.toLowerCase() || '';
      const email = user.email?.toLowerCase() || '';
      const matchesSearch =
        name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
      const r = Array.isArray(user.roles) ? user.roles : [];
      const matchesRole =
        filterRole === 'all' ||
        r.includes(filterRole) ||
        (filterRole === 'no-role' && r.length === 0);
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, filterRole]);

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return 'adm-acc__badge--admin';
      case 'CINEMA_MANAGER':
        return 'adm-acc__badge--manager';
      case 'CUSTOMER':
        return 'adm-acc__badge--customer';
      default:
        return 'adm-acc__badge--default';
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
    const tier = membershipTiers.find((t) => t.tierName === tierName);
    return tier?.tierNameDisplay || tierName;
  };

  const getTierBadgeClass = (tierName) => {
    switch (tierName?.toUpperCase()) {
      case 'DIAMOND':
        return 'adm-acc__tier--diamond';
      case 'PLATINUM':
        return 'adm-acc__tier--platinum';
      case 'GOLD':
        return 'adm-acc__tier--gold';
      case 'SILVER':
        return 'adm-acc__tier--silver';
      case 'BRONZE':
      default:
        return 'adm-acc__tier--bronze';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="adm-acc adm-acc--loading">
        <FaSpinner className="adm-acc__spin" />
        <p className="adm-acc__muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="adm-acc" role="main" aria-label="Quản lý tài khoản">
      <div className="adm-acc__hero">
        <div className="adm-acc__hero-text">
          <FaUsers className="adm-acc__hero-ico" aria-hidden />
          <div>
            <h1 className="adm-acc__h1">Quản lý tài khoản</h1>
            <p className="adm-acc__sub">Người dùng và phân quyền</p>
          </div>
        </div>
        <div className="adm-acc__stats">
          <div className="adm-acc__stat">
            <div className="adm-acc__stat-ico adm-acc__stat-ico--a" aria-hidden>
              <FaUsers />
            </div>
            <div className="adm-acc__stat-val">{users.length}</div>
            <div className="adm-acc__stat-lbl">Tổng</div>
          </div>
          <div className="adm-acc__stat">
            <div className="adm-acc__stat-ico adm-acc__stat-ico--b" aria-hidden>
              <FaUserShield />
            </div>
            <div className="adm-acc__stat-val">
              {users.filter((u) => Array.isArray(u.roles) && u.roles.includes('SYSTEM_ADMIN')).length}
            </div>
            <div className="adm-acc__stat-lbl">Admin</div>
          </div>
          <div className="adm-acc__stat">
            <div className="adm-acc__stat-ico adm-acc__stat-ico--c" aria-hidden>
              <FaUser />
            </div>
            <div className="adm-acc__stat-val">
              {users.filter((u) => Array.isArray(u.roles) && u.roles.includes('CUSTOMER')).length}
            </div>
            <div className="adm-acc__stat-lbl">Khách</div>
          </div>
        </div>
      </div>

      <div className="adm-acc__toolbar">
        <div className="adm-acc__search">
          <FaSearch className="adm-acc__search-ico" aria-hidden />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Tìm kiếm"
          />
        </div>
        <div className="adm-acc__filter">
          <FaFilter className="adm-acc__filter-ico" aria-hidden />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} aria-label="Lọc vai trò">
            <option value="all">Tất cả vai trò</option>
            <option value="SYSTEM_ADMIN">Quản trị viên</option>
            <option value="CINEMA_MANAGER">Quản lý rạp</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="no-role">Chưa có vai trò</option>
          </select>
        </div>
      </div>

      <div className="adm-acc__table-wrap">
        <table className="adm-acc__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hạng TV</th>
              <th>Điểm</th>
              <th>TT</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="adm-acc__empty-cell">
                  Không có người dùng phù hợp
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.userId}>
                  <td className="adm-acc__id">#{user.userId}</td>
                  <td>
                    <div className="adm-acc__usercell">
                      <div className="adm-acc__avatar">{user.fullName?.charAt(0).toUpperCase() || '?'}</div>
                      <span className="adm-acc__uname">{user.fullName}</span>
                    </div>
                  </td>
                  <td className="adm-acc__email">{user.email}</td>
                  <td>
                    <div className="adm-acc__badges">
                      {!user.roles || user.roles.length === 0 ? (
                        <span className="adm-acc__badge adm-acc__badge--default">Chưa có vai trò</span>
                      ) : (
                        user.roles.map((role, index) => (
                          <span key={index} className={`adm-acc__badge ${getRoleBadgeClass(role)}`}>
                            {getRoleDisplayName(role)}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td>
                    {user.membershipTier ? (
                      <span className={`adm-acc__tier ${getTierBadgeClass(user.membershipTier)}`}>
                        {getTierDisplayName(user.membershipTier)}
                      </span>
                    ) : (
                      <span className="adm-acc__hint">—</span>
                    )}
                  </td>
                  <td>
                    <span className="adm-acc__points">
                      {user.availablePoints !== undefined ? user.availablePoints : 0} điểm
                    </span>
                  </td>
                  <td>
                    {user.isActive === false ? (
                      <span className="adm-acc__pill adm-acc__pill--off">Vô hiệu</span>
                    ) : (
                      <span className="adm-acc__pill adm-acc__pill--on">Hoạt động</span>
                    )}
                  </td>
                  <td>
                    <div className="adm-acc__actions">
                      <button
                        type="button"
                        className="adm-acc__act adm-acc__act--edit"
                        onClick={() => handleEditRole(user)}
                        title="Sửa vai trò"
                        aria-label="Sửa vai trò"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="adm-acc__act adm-acc__act--tier"
                        onClick={() => handleEditTier(user)}
                        title="Hạng thành viên"
                        aria-label="Hạng thành viên"
                      >
                        <FaCrown />
                      </button>
                      {user.isActive !== false ? (
                        <button
                          type="button"
                          className="adm-acc__act adm-acc__act--del"
                          onClick={() => handleDeleteUser(user)}
                          title="Vô hiệu hóa"
                          aria-label="Vô hiệu hóa"
                        >
                          <FaTrash />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="adm-acc__act adm-acc__act--ok"
                          onClick={() => handleActivateUser(user)}
                          title="Kích hoạt"
                          aria-label="Kích hoạt"
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

      {showEditModal && selectedUser && (
        <div className="adm-acc__modal" role="presentation">
          <div
            className="adm-acc__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-acc-edit-title"
          >
            <div className="adm-acc__panel-head">
              <h2 id="adm-acc-edit-title">Chỉnh sửa vai trò</h2>
              <button type="button" className="adm-acc__panel-x" onClick={closeEditModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <div className="adm-acc__panel-body">
              <div className="adm-acc__usercard">
                <div className="adm-acc__usercard-av">{selectedUser.fullName?.charAt(0).toUpperCase()}</div>
                <div>
                  <h3 className="adm-acc__usercard-name">{selectedUser.fullName}</h3>
                  <p className="adm-acc__hint">{selectedUser.email}</p>
                </div>
              </div>
              <div className="adm-acc__form-field">
                <span className="adm-acc__lbl">Vai trò hiện tại</span>
                <div className="adm-acc__badges">
                  {!selectedUser.roles?.length ? (
                    <span className="adm-acc__badge adm-acc__badge--default">Chưa có</span>
                  ) : (
                    selectedUser.roles.map((role, index) => (
                      <span key={index} className={`adm-acc__badge ${getRoleBadgeClass(role)}`}>
                        {getRoleDisplayName(role)}
                      </span>
                    ))
                  )}
                </div>
              </div>
              <div className="adm-acc__form-field">
                <label htmlFor="adm-acc-role">Vai trò mới</label>
                <select
                  id="adm-acc-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="">— Chọn —</option>
                  {roles.map((role) => (
                    <option key={role.roleId} value={role.roleName}>
                      {getRoleDisplayName(role.roleName)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="adm-acc__panel-foot">
              <button type="button" className="adm-acc__btn adm-acc__btn--ghost" onClick={closeEditModal}>
                Hủy
              </button>
              <button type="button" className="adm-acc__btn adm-acc__btn--primary" onClick={handleUpdateRole}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {showTierModal && selectedUser && (
        <div className="adm-acc__modal" role="presentation">
          <div
            className="adm-acc__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-acc-tier-title"
          >
            <div className="adm-acc__panel-head">
              <h2 id="adm-acc-tier-title">
                <FaCrown /> Hạng thành viên
              </h2>
              <button type="button" className="adm-acc__panel-x" onClick={closeTierModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <div className="adm-acc__panel-body">
              <div className="adm-acc__usercard">
                <div className="adm-acc__usercard-av">{selectedUser.fullName?.charAt(0).toUpperCase()}</div>
                <div>
                  <h3 className="adm-acc__usercard-name">{selectedUser.fullName}</h3>
                  <p className="adm-acc__hint">{selectedUser.email}</p>
                </div>
              </div>
              <div className="adm-acc__form-field">
                <span className="adm-acc__lbl">Hạng hiện tại</span>
                <div>
                  {selectedUser.membershipTier ? (
                    <span className={`adm-acc__tier ${getTierBadgeClass(selectedUser.membershipTier)}`}>
                      {getTierDisplayName(selectedUser.membershipTier)}
                    </span>
                  ) : (
                    <span className="adm-acc__hint">Chưa có</span>
                  )}
                </div>
              </div>
              <div className="adm-acc__form-field">
                <label htmlFor="adm-acc-tier">Hạng mới</label>
                <select id="adm-acc-tier" value={newTier} onChange={(e) => setNewTier(e.target.value)}>
                  <option value="">— Chọn —</option>
                  {membershipTiers.map((tier) => (
                    <option key={tier.tierId} value={tier.tierName}>
                      {tier.tierNameDisplay} (Lv {tier.tierLevel})
                    </option>
                  ))}
                </select>
              </div>
              {newTier && (
                <div className="adm-acc__tier-preview">
                  {(() => {
                    const selectedTier = membershipTiers.find((t) => t.tierName === newTier);
                    if (!selectedTier) return null;
                    return (
                      <div className="adm-acc__tier-card">
                        <h4>
                          <FaCrown /> {selectedTier.tierNameDisplay}
                        </h4>
                        <ul>
                          <li>
                            Tích điểm: <strong>x{selectedTier.pointsEarnRate}</strong>
                          </li>
                          <li>
                            Vé miễn phí/năm: <strong>{selectedTier.freeTicketsPerYear}</strong>
                          </li>
                          {selectedTier.birthdayGiftDescription && (
                            <li>
                              Quà SN: <strong>{selectedTier.birthdayGiftDescription}</strong>
                            </li>
                          )}
                          <li>
                            Chi tiêu tối thiểu:{' '}
                            <strong>{new Intl.NumberFormat('vi-VN').format(selectedTier.minAnnualSpending)}đ</strong>
                          </li>
                        </ul>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            <div className="adm-acc__panel-foot">
              <button type="button" className="adm-acc__btn adm-acc__btn--ghost" onClick={closeTierModal}>
                Hủy
              </button>
              <button type="button" className="adm-acc__btn adm-acc__btn--gold" onClick={handleUpdateTier}>
                <FaCrown /> Cập nhật hạng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;

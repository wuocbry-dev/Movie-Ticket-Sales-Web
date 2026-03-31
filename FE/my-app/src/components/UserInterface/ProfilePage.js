import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import { API_BASE_URL } from '../../config/api';
import { AiOutlineSave, AiOutlineClose, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaUser, FaCrown, FaKey, FaGift, FaCoins } from 'react-icons/fa';
import './ProfilePage.css';

const PointsRing = ({ value, label, accent = '#5eb4d6', max = 10000 }) => {
  const v = value ?? 0;
  const pct = Math.min(100, max > 0 ? (v / max) * 100 : 0);
  return (
    <div className="pp-v2-ring-wrap">
      <div
        className="pp-v2-ring"
        style={{ '--p': `${pct}%`, '--accent': accent }}
        aria-hidden
      />
      <div className="pp-v2-ring-text">
        <span className="pp-v2-ring-val">{v.toLocaleString('vi-VN')}</span>
        <span className="pp-v2-ring-lbl">{label}</span>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const accountSettingsRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: ''
  });
  
  // State cho đổi mật khẩu
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [activeNav, setActiveNav] = useState('info');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Lấy thông tin từ localStorage trước
      const storedUser = localStorage.getItem('user');
      console.log('Stored user from localStorage:', storedUser);
      
      let userId = null;
      if (storedUser && storedUser !== 'undefined') {
        const userData = JSON.parse(storedUser);
        // Support both 'id' and 'userId' fields
        userId = userData.id || userData.userId;
        console.log('Parsed user data:', userData, 'userId:', userId);
        setUser(userData);
        setEditForm({
          fullName: userData.fullName || '',
          phoneNumber: userData.phoneNumber || userData.phone || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || ''
        });
      }

      const token = Cookies.get('accessToken');
      console.log('Access token:', token ? 'exists' : 'not found');
      
      if (!token) {
        // Nếu không có token nhưng có user trong localStorage
        if (storedUser && storedUser !== 'undefined') {
          setIsLoading(false);
          toast.info('Hiển thị thông tin từ bộ nhớ cache');
          return;
        }
        toast.error('Vui lòng đăng nhập để xem thông tin');
        navigate('/login');
        return;
      }

      // Thử call API để lấy thông tin mới nhất
      if (!userId) {
        toast.error('Không tìm thấy thông tin người dùng');
        navigate('/login');
        return;
      }
      
      try {
        console.log('Fetching profile from API...');
        const response = await axios.get(`${API_BASE_URL}/users/${userId}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('API Response:', response.data);
        console.log('Membership data:', response.data.data?.membership);

        if (response.data.success) {
          const userData = response.data.data;
          console.log('User data with membership:', userData);
          // Map userId to id for consistency with localStorage
          const userDataWithId = {
            ...userData,
            id: userData.userId || userData.id
          };
          setUser(userDataWithId);
          setEditForm({
            fullName: userDataWithId.fullName || '',
            phoneNumber: userDataWithId.phoneNumber || '',
            dateOfBirth: userDataWithId.dateOfBirth || '',
            gender: userDataWithId.gender || ''
          });
          
          // Update localStorage - merge với data cũ để giữ lại id
          const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({
            ...existingUser,
            ...userDataWithId
          }));
          toast.success('Thông tin đã được cập nhật');
        }
      } catch (apiError) {
        console.log('API Error:', apiError.response?.data || apiError.message);
        // Nếu API lỗi nhưng đã có data từ localStorage thì không hiển thị lỗi
        if (storedUser) {
          toast.warning('Không thể kết nối server. Hiển thị thông tin đã lưu.');
        } else {
          throw apiError;
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error('Không thể tải thông tin cá nhân');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const token = Cookies.get('accessToken');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = storedUser.id || storedUser.userId;
      
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}/profile`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        const updatedData = {
          ...response.data.data,
          id: response.data.data.userId || response.data.data.id || userId
        };
        setUser(updatedData);
        setIsEditing(false);
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          ...updatedData
        }));
        window.dispatchEvent(new Event('userChanged'));
        toast.success('Đã lưu thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    }
  };

  const getGenderDisplay = (gender) => {
    const genderMap = {
      'MALE': 'Nam',
      'FEMALE': 'Nữ',
      'OTHER': 'Khác'
    };
    return genderMap[gender] || gender;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Format số tiền
  const formatCurrency = (amount) => {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Tính phần trăm tiến độ lên hạng
  const calculateProgress = (membership) => {
    if (!membership || !membership.minSpendingForNextTier) return 100;
    const current = membership.annualSpending || 0;
    const next = membership.minSpendingForNextTier;
    return Math.min((current / next) * 100, 100);
  };

  // Hàm xử lý đổi mật khẩu
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleChangePassword = async () => {
    // Validate
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setIsChangingPassword(true);
      const token = Cookies.get('accessToken');
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = storedUser.id || storedUser.userId;
      
      const response = await axios.put(
        `${API_BASE_URL}/users/${userId}/password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success('Đổi mật khẩu thành công!');
        handleClosePasswordModal();
      }
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Không thể đổi mật khẩu';
      toast.error(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-error">
        <p>Không thể tải thông tin người dùng</p>
      </div>
    );
  }

  const membership = user.membership;

  const tierProgressPct = membership ? calculateProgress(membership) : 0;

  return (
    <div className="profile-page profile-page--v2">
      <div className="profile-container profile-dashboard">
        <aside className="pp-sidebar pp-v2-sidebar" aria-label="Menu tài khoản">
          <div className="pp-v2-glass pp-sidebar-user">
            <div className="pp-avatar-wrap">
              <div className="pp-sidebar-avatar">
                <FaUser />
              </div>
              <span className="pp-status-dot" title="Đang hoạt động" />
            </div>
            <div className="pp-sidebar-name">{user.fullName}</div>
            <div className="pp-sidebar-role">{user.email}</div>
            <div className="pp-sidebar-actions">
              <button
                type="button"
                className="pp-btn-follow"
                onClick={() => navigate('/bookings')}
              >
                Lịch sử đặt vé
              </button>
              <button
                type="button"
                className="pp-btn-icon-circle"
                onClick={handleOpenPasswordModal}
                title="Đổi mật khẩu"
              >
                <FaKey />
              </button>
            </div>
          </div>
          <nav className="pp-v2-glass pp-sidebar-nav" aria-label="Điều hướng">
            <button
              type="button"
              className={`pp-nav-item ${activeNav === 'info' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('info');
                accountSettingsRef.current?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
            >
              <FaUser /> Thông tin cá nhân
            </button>
            <button
              type="button"
              className={`pp-nav-item ${activeNav === 'security' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('security');
                handleOpenPasswordModal();
              }}
            >
              <AiOutlineLock /> Bảo mật
            </button>
          </nav>
        </aside>

        <div className="pp-main-col pp-v2-main">
          <div className="membership-card">
            <div className="membership-icon">
              <FaCrown />
            </div>
            <div className="membership-info">
              <h3>Hạng Thành Viên</h3>
              <p className="tier-name">
                {membership?.tierNameDisplay || 'Chưa đăng ký'}
              </p>
              <p className="member-number">Mã TV: {membership?.membershipNumber || 'N/A'}</p>
            </div>
            {membership && (
              <div className="membership-badge">
                <span className={`tier-badge tier-${membership?.tierName?.toLowerCase()}`}>
                  Cấp {membership?.tierLevel}
                </span>
              </div>
            )}
            <div className="membership-points">
              <FaCoins className="points-icon" />
              <div className="points-info">
                <span className="points-value">{membership?.availablePoints ?? 0}</span>
                <span className="points-label" title="Điểm có thể dùng để chiết khấu hoặc đổi quà">
                  Điểm khả dụng
                </span>
              </div>
            </div>
          </div>

          {membership && (
            <>
              <section className="pp-v2-glass pp-v2-card pp-v2-tier-progress">
                <h3 className="pp-v2-card-title">Tiến độ hạng của tôi</h3>
                <div className="pp-v2-tier-track">
                  <span className="pp-v2-tier-from">{membership.tierNameDisplay || 'Hiện tại'}</span>
                  <span className="pp-v2-tier-to">{membership.nextTierName || 'Tối đa'}</span>
                </div>
                <div className="pp-v2-progress-rail">
                  <div
                    className="pp-v2-progress-fill"
                    style={{ width: `${membership.nextTierName ? tierProgressPct : 100}%` }}
                  />
                </div>
                <p className="pp-v2-tier-meta">
                  {membership.nextTierName ? (
                    <>
                      {formatCurrency(membership.annualSpending)} / {formatCurrency(membership.minSpendingForNextTier)}
                      <span className="pp-v2-tier-hint"> — chi tiêu trong năm để lên hạng tiếp theo</span>
                    </>
                  ) : (
                    'Bạn đang ở hạng cao nhất hoặc chưa có mục tiêu hạng tiếp theo.'
                  )}
                </p>
              </section>

              <div className="pp-v2-grid pp-v2-grid--2 pp-v2-points-benefits-row">
                <section className="pp-v2-glass pp-v2-card">
                  <h4 className="pp-v2-card-sub">Tổng quan điểm</h4>
                  <div className="pp-v2-rings-row">
                    <PointsRing
                      value={membership.totalPoints ?? 0}
                      label="Tổng điểm"
                      accent="#5eb4d6"
                      max={Math.max(10000, membership.totalPoints ?? 0, 1)}
                    />
                    <PointsRing
                      value={membership.availablePoints ?? 0}
                      label="Điểm khả dụng"
                      accent="#22c55e"
                      max={Math.max(1, membership.totalPoints ?? 0)}
                    />
                  </div>
                </section>

                <section className="pp-v2-glass pp-v2-card pp-v2-benefits">
                  <h4 className="pp-v2-card-sub">Quyền lợi hạng</h4>
                  <table className="pp-v2-benefits-table">
                    <tbody>
                      <tr>
                        <td>Tỷ lệ tích điểm</td>
                        <td>
                          <strong>{membership.pointsEarnRate ?? 1}x</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Vé miễn phí / năm</td>
                        <td>
                          <strong>{membership.freeTicketsPerYear ?? 0}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FaGift className="pp-v2-benefit-ic" aria-hidden /> Quà sinh nhật
                        </td>
                        <td className="pp-v2-benefit-gift">
                          {membership.birthdayGift || 'Theo chính sách hạng thành viên'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </div>
            </>
          )}

          <section
            ref={accountSettingsRef}
            id="profile-account-settings"
            className="pp-v2-glass pp-v2-card pp-v2-settings"
            aria-labelledby="profile-settings-heading"
          >
            <header className="pp-v2-settings-head">
              <div className="pp-v2-settings-head-row">
                <h2 id="profile-settings-heading">Cài đặt tài khoản</h2>
                {!isEditing && (
                  <button type="button" className="pp-v2-edit-profile" onClick={handleEditClick}>
                    Chỉnh sửa thông tin
                  </button>
                )}
              </div>
              <p>Cập nhật thông tin hiển thị trên tài khoản của bạn.</p>
            </header>

            <div className="pp-form-grid-2">
              <div className="pp-form-group">
                <label htmlFor="pp-fullName">Họ và tên</label>
                {isEditing ? (
                  <input
                    id="pp-fullName"
                    type="text"
                    name="fullName"
                    className="pp-inset-input"
                    value={editForm.fullName}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="pp-inset-read" id="pp-fullName">
                    {user.fullName}
                  </div>
                )}
              </div>
              <div className="pp-form-group">
                <label htmlFor="pp-email">Email</label>
                <div className="pp-inset-read pp-inset-read-muted" id="pp-email">
                  {user.email}
                </div>
                {user.isEmailVerified ? (
                  <span className="verified-badge">✓ Đã xác thực</span>
                ) : (
                  <span className="unverified-badge">Chưa xác thực</span>
                )}
              </div>
            </div>

            <div className="pp-form-grid-2">
              <div className="pp-form-group">
                <label htmlFor="pp-phone">Số điện thoại</label>
                {isEditing ? (
                  <input
                    id="pp-phone"
                    type="text"
                    name="phoneNumber"
                    className="pp-inset-input"
                    value={editForm.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="pp-inset-read" id="pp-phone">
                    {user.phoneNumber || 'Chưa cập nhật'}
                  </div>
                )}
              </div>
              <div className="pp-form-group">
                <label htmlFor="pp-dob">Ngày sinh</label>
                {isEditing ? (
                  <input
                    id="pp-dob"
                    type="date"
                    name="dateOfBirth"
                    className="pp-inset-input"
                    value={editForm.dateOfBirth}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="pp-inset-read" id="pp-dob">
                    {formatDate(user.dateOfBirth) || 'Chưa cập nhật'}
                  </div>
                )}
              </div>
            </div>

            <div className="pp-form-group pp-form-full">
              <label htmlFor="pp-gender">Giới tính</label>
              {isEditing ? (
                <select
                  id="pp-gender"
                  name="gender"
                  className="pp-inset-input pp-select"
                  value={editForm.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              ) : (
                <div className="pp-inset-read" id="pp-gender">
                  {getGenderDisplay(user.gender) || 'Chưa cập nhật'}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="pp-settings-actions">
                <button type="button" className="pp-btn-save-all" onClick={handleSaveProfile}>
                  <AiOutlineSave /> Lưu thay đổi
                </button>
                <button type="button" className="pp-btn-discard" onClick={handleCancelEdit}>
                  Hủy bỏ
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="password-modal-overlay" onClick={handleClosePasswordModal}>
          <div className="password-modal" onClick={(e) => e.stopPropagation()}>
            <div className="password-modal-header">
              <h2><AiOutlineLock /> Đổi Mật Khẩu</h2>
              <button className="close-modal-btn" onClick={handleClosePasswordModal}>
                <AiOutlineClose />
              </button>
            </div>
            
            <div className="password-modal-body">
              <div className="password-field">
                <label>Mật khẩu hiện tại</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập mật khẩu hiện tại"
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>Mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>Xác nhận mật khẩu mới</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                  <button 
                    type="button" 
                    className="toggle-password-btn"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </button>
                </div>
              </div>
            </div>

            <div className="password-modal-footer">
              <button 
                className="cancel-password-btn" 
                onClick={handleClosePasswordModal}
                disabled={isChangingPassword}
              >
                Hủy
              </button>
              <button 
                className="save-password-btn" 
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

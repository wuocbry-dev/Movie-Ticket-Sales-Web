import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';
import { AiOutlineEdit, AiOutlineSave, AiOutlineClose, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaUser, FaEnvelope, FaPhone, FaBirthdayCake, FaVenusMars, FaCrown, FaTicketAlt, FaKey, FaStar, FaGift, FaCoins } from 'react-icons/fa';
import './ProfilePage.css';

const ProfilePage = () => {
  const navigate = useNavigate();
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
        toast.success('Cập nhật thông tin thành công!');
        // Map userId to id for consistency
        const updatedData = {
          ...response.data.data,
          id: response.data.data.userId || response.data.data.id || userId
        };
        setUser(updatedData);
        setIsEditing(false);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify({
          ...storedUser,
          ...updatedData
        }));
        
        // Dispatch event to update header
        window.dispatchEvent(new Event('userChanged'));
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

  // Lấy màu cho tier
  const getTierColor = (tierName) => {
    const colors = {
      'BRONZE': '#cd7f32',
      'SILVER': '#c0c0c0',
      'GOLD': '#ffd700',
      'PLATINUM': '#e5e4e2',
      'DIAMOND': '#b9f2ff'
    };
    return colors[tierName] || '#666';
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

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <FaUser />
          </div>
          <div className="profile-title">
            <h1>Thông Tin Cá Nhân</h1>
            <p className="profile-subtitle">Quản lý thông tin của bạn</p>
          </div>
        </div>

        <div className="profile-content">
          {/* Membership Info */}
          <div className="membership-card" style={{ borderColor: getTierColor(user.membership?.tierName) }}>
            <div className="membership-icon" style={{ color: getTierColor(user.membership?.tierName) }}>
              <FaCrown />
            </div>
            <div className="membership-info">
              <h3>Hạng Thành Viên</h3>
              <p className="tier-name" style={{ color: getTierColor(user.membership?.tierName) }}>
                {user.membership?.tierNameDisplay || 'Chưa đăng ký'}
              </p>
              <p className="member-number">Mã TV: {user.membership?.membershipNumber || 'N/A'}</p>
            </div>
            {user.membership && (
              <div className="membership-badge">
                <span className={`tier-badge tier-${user.membership?.tierName?.toLowerCase()}`}>
                  Cấp {user.membership?.tierLevel}
                </span>
              </div>
            )}
            <div className="membership-points">
              <FaCoins className="points-icon" />
              <div className="points-info">
                <span className="points-value">{user.membership?.availablePoints || 0}</span>
                <span className="points-label" title="Điểm có thể dùng để chiết khấu hoặc đổi quà">Điểm khả dụng</span>
              </div>
            </div>
          </div>

          {/* Membership Details Card */}
          {user.membership && (
            <div className="membership-details-card">
              <h3><FaStar /> Chi Tiết Hạng Thành Viên</h3>
              
              <div className="membership-stats">
                <div className="stat-item" title="Tổng điểm bạn đã tích lũy từ các giao dịch">
                  <FaCoins className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Tổng điểm</span>
                    <span className="stat-value points">{user.membership.totalPoints?.toLocaleString() || 0}</span>
                  </div>
                </div>
                
                <div className="stat-item" title="Điểm có thể sử dụng để chiết khấu hoặc đổi quà ngay">
                  <FaCoins className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Điểm khả dụng</span>
                    <span className="stat-value points">{user.membership.availablePoints?.toLocaleString() || 0}</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <FaTicketAlt className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Vé miễn phí/năm</span>
                    <span className="stat-value">{user.membership.freeTicketsPerYear || 0}</span>
                  </div>
                </div>
                
                <div className="stat-item">
                  <FaStar className="stat-icon" />
                  <div className="stat-content">
                    <span className="stat-label">Tỷ lệ tích điểm</span>
                    <span className="stat-value">{user.membership.pointsEarnRate || 1}x</span>
                  </div>
                </div>
              </div>

              <div className="spending-info">
                <div className="spending-row">
                  <span>Chi tiêu trong năm:</span>
                  <span className="spending-value">{formatCurrency(user.membership.annualSpending)}</span>
                </div>
                <div className="spending-row">
                  <span>Tổng chi tiêu:</span>
                  <span className="spending-value">{formatCurrency(user.membership.lifetimeSpending)}</span>
                </div>
              </div>

              {/* Progress to next tier */}
              {user.membership.nextTierName && (
                <div className="tier-progress">
                  <div className="progress-header">
                    <span>Tiến độ lên hạng <strong>{user.membership.nextTierName}</strong></span>
                    <span>{formatCurrency(user.membership.annualSpending)} / {formatCurrency(user.membership.minSpendingForNextTier)}</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateProgress(user.membership)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Birthday Gift */}
              {user.membership.birthdayGift && (
                <div className="birthday-gift">
                  <FaGift className="gift-icon" />
                  <div className="gift-content">
                    <span className="gift-label">Quà sinh nhật</span>
                    <span className="gift-value">{user.membership.birthdayGift}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Details */}
          <div className="profile-details-card">
            <div className="pp-card-header">
              <h2>Thông Tin Chi Tiết</h2>
              {!isEditing ? (
                <button className="edit-btn" onClick={handleEditClick}>
                  <AiOutlineEdit /> Chỉnh sửa
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="save-btn" onClick={handleSaveProfile}>
                    <AiOutlineSave /> Lưu
                  </button>
                  <button className="cancel-btn" onClick={handleCancelEdit}>
                    <AiOutlineClose /> Hủy
                  </button>
                </div>
              )}
            </div>

            <div className="profile-fields">
              <div className="field-row">
                <div className="field-icon">
                  <FaUser />
                </div>
                <div className="field-content">
                  <label>Họ và Tên</label>
                  {!isEditing ? (
                    <p>{user.fullName}</p>
                  ) : (
                    <input
                      type="text"
                      name="fullName"
                      value={editForm.fullName}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaEnvelope />
                </div>
                <div className="field-content">
                  <label>Email</label>
                  <p>{user.email}</p>
                  {user.isEmailVerified ? (
                    <span className="verified-badge">✓ Đã xác thực</span>
                  ) : (
                    <span className="unverified-badge">Chưa xác thực</span>
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaPhone />
                </div>
                <div className="field-content">
                  <label>Số Điện Thoại</label>
                  {!isEditing ? (
                    <p>{user.phoneNumber || 'Chưa cập nhật'}</p>
                  ) : (
                    <input
                      type="text"
                      name="phoneNumber"
                      value={editForm.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                    />
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaBirthdayCake />
                </div>
                <div className="field-content">
                  <label>Ngày Sinh</label>
                  {!isEditing ? (
                    <p>{formatDate(user.dateOfBirth) || 'Chưa cập nhật'}</p>
                  ) : (
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={editForm.dateOfBirth}
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>

              <div className="field-row">
                <div className="field-icon">
                  <FaVenusMars />
                </div>
                <div className="field-content">
                  <label>Giới Tính</label>
                  {!isEditing ? (
                    <p>{getGenderDisplay(user.gender) || 'Chưa cập nhật'}</p>
                  ) : (
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/bookings')}>
              <FaTicketAlt />
              <span>Lịch Sử Đặt Vé</span>
            </button>
            <button className="action-btn change-password-btn" onClick={handleOpenPasswordModal}>
              <FaKey />
              <span>Đổi Mật Khẩu</span>
            </button>
          </div>
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

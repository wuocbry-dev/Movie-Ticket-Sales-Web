import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaUser, FaSignOutAlt, FaTachometerAlt, FaBars, FaHistory } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import { TOAST_IDS } from '../../utils/toastIds';
import { getDashboardPath, getRoleDisplayName, getHighestRole, isStaffMember } from '../../utils/roleUtils';
import { useQuickBooking } from './QuickBookingContext';
import QuickBookingMini from './QuickBookingMini';
import { loyaltyService } from '../../services/loyaltyService';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isQuickBookingOpen, openQuickBooking, closeQuickBooking } = useQuickBooking();
  const [user, setUser] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('language') || 'vi';
  });

  const languages = [
    { code: 'vi', name: 'Tiếng Việt', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"%3E%3Crect width="30" height="20" fill="%23da251d"/%3E%3Cpolygon points="15,4 11.47,14.85 20.71,8.15 9.29,8.15 18.53,14.85" fill="%23ff0"/%3E%3C/svg%3E' },
    { code: 'en', name: 'English', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"%3E%3Crect width="60" height="30" fill="%23012169"/%3E%3Cpath d="M0,0 L60,30 M60,0 L0,30" stroke="%23fff" stroke-width="6"/%3E%3Cpath d="M0,0 L60,30 M60,0 L0,30" stroke="%23C8102E" stroke-width="4"/%3E%3Cpath d="M30,0 V30 M0,15 H60" stroke="%23fff" stroke-width="10"/%3E%3Cpath d="M30,0 V30 M0,15 H60" stroke="%23C8102E" stroke-width="6"/%3E%3C/svg%3E' },
    { code: 'ko', name: '한국어', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"%3E%3Crect width="900" height="600" fill="%23fff"/%3E%3Ccircle cx="450" cy="300" r="120" fill="%23c60c30"/%3E%3Cpath d="M450,180 A120,120 0 0,1 450,420" fill="%230047a0"/%3E%3Ccircle cx="450" cy="240" r="40" fill="%230047a0"/%3E%3Ccircle cx="450" cy="360" r="40" fill="%23c60c30"/%3E%3C/svg%3E' },
    { code: 'ja', name: '日本語', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600"%3E%3Crect width="900" height="600" fill="%23fff"/%3E%3Ccircle cx="450" cy="300" r="180" fill="%23bc002d"/%3E%3C/svg%3E' },
    { code: 'zh', name: '中文', flag: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"%3E%3Crect width="30" height="20" fill="%23de2910"/%3E%3Cpolygon points="5,3 4.5,4.5 3,4.5 4.2,5.4 3.8,7 5,6 6.2,7 5.8,5.4 7,4.5 5.5,4.5" fill="%23ffde00"/%3E%3C/svg%3E' }
  ];

  // Kiểm tra xem có phải trang chủ không
  const isHomePage = location.pathname === '/';
  
  // Kiểm tra xem có phải trang quản lý không (admin, system-admin, staff)
  const isAdminPage = location.pathname.startsWith('/admin') || 
                      location.pathname.startsWith('/system-admin') ||
                      location.pathname.startsWith('/staff');

  useEffect(() => {
    // Kiểm tra user trong localStorage khi component mount
    const checkUser = async () => {
      const userData = localStorage.getItem('user');
      const token = Cookies.get('accessToken');
      
      if (userData && userData !== 'undefined' && token) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Fetch loyalty points - only if token exists
          if (parsedUser.userId) {
            try {
              const balance = await loyaltyService.getPointsBalance(parsedUser.userId);
              setLoyaltyPoints(balance.availablePoints || 0);
            } catch (error) {
              console.error('Error fetching loyalty points:', error);
              setLoyaltyPoints(0);
            }
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          localStorage.removeItem('user');
          setUser(null);
          setLoyaltyPoints(0);
        }
      } else {
        setUser(null);
        setLoyaltyPoints(0);
      }
    };

    // Hàm refresh chỉ points (không check lại user)
    const refreshPoints = async () => {
      const userData = localStorage.getItem('user');
      const token = Cookies.get('accessToken');
      
      if (userData && userData !== 'undefined' && token) {
        try {
          const parsedUser = JSON.parse(userData);
          if (parsedUser.userId) {
            const balance = await loyaltyService.getPointsBalance(parsedUser.userId);
            setLoyaltyPoints(balance.availablePoints || 0);
            console.log('🔄 Points refreshed:', balance.availablePoints);
          }
        } catch (error) {
          console.error('Error refreshing points:', error);
        }
      }
    };

    checkUser();

    // Lắng nghe sự kiện storage để cập nhật khi localStorage thay đổi
    window.addEventListener('storage', checkUser);
    
    // Custom event cho việc login/logout
    window.addEventListener('userChanged', checkUser);
    
    // Custom event để refresh points khi có thay đổi (booking, sử dụng điểm, etc.)
    window.addEventListener('pointsChanged', refreshPoints);

    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userChanged', checkUser);
      window.removeEventListener('pointsChanged', refreshPoints);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showLanguageMenu && !event.target.closest('.language-selector')) {
        setShowLanguageMenu(false);
      }
      if (showMobileMenu && !event.target.closest('.header')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showLanguageMenu, showMobileMenu]);

  const handleLogout = () => {
    // Xóa token và user data
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setShowUserMenu(false);
    
    // Dispatch event để các component khác cập nhật
    window.dispatchEvent(new Event('userChanged'));
    
    toast.success('Đăng xuất thành công!', { toastId: TOAST_IDS.LOGOUT_SUCCESS });
    navigate('/');
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('language', langCode);
    setShowLanguageMenu(false);
    
    const langName = languages.find(l => l.code === langCode)?.name;
    toast.success(`Đã chuyển sang ${langName}`);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <img src="/cinema-logo.png" alt="Q Cinema" className="logo-image" />
        </Link>

        {/* Quick Booking: hiện nút trên trang chủ; modal mở được từ mọi trang (vd Bắp nước) */}
        {!isAdminPage && (
          <QuickBookingMini
            triggerLabel={isMobile ? 'Chọn Rạp' : 'ĐẶT VÉ NHANH'}
            showTrigger={isHomePage}
            isOpen={isQuickBookingOpen}
            onClose={closeQuickBooking}
            onOpen={openQuickBooking}
          />
        )}

        {/* Search Bar - ẩn trên mobile (vào hamburger) */}
        <div className="search-bar header-search">
          <input 
            type="text" 
            placeholder="Tìm phim, rạp" 
            className="search-input"
          />
          <button className="search-button">
            <FaSearch />
          </button>
        </div>

        {/* Right Menu - Desktop | Mobile: Hamburger */}
        <div className="header-menu">
          {isMobile && (
            <button
              className="header-hamburger"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Menu"
            >
              <FaBars size={20} />
            </button>
          )}
          {!isMobile && user ? (
            <div className="user-menu-container">
              <button 
                className="menu-item user-button"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUser size={16} />
                <span>{user.fullName}</span>
                <span className="user-points">💎 {loyaltyPoints.toLocaleString()} điểm</span>
              </button>
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info user-dropdown-card">
                    <p className="user-name">{user.fullName}</p>
                    <p className="user-tier">
                      {user.roles && user.roles.length > 0 ? (
                        <>{getRoleDisplayName(getHighestRole(user.roles))}</>
                      ) : (
                        <>{user.membershipTier}</>
                      )}
                    </p>
                  </div>
                  <div className="user-dropdown-panel">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FaUser /> Thông tin cá nhân
                    </Link>
                    <Link to="/bookings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      <FaHistory /> Lịch sử đặt vé
                    </Link>

                    {user.roles && isStaffMember(user.roles) && (
                      <>
                        <div className="dropdown-divider" />
                        <Link
                          to={getDashboardPath(user.roles)}
                          className="dropdown-item admin-link"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <FaTachometerAlt /> {getRoleDisplayName(getHighestRole(user.roles))} Dashboard
                        </Link>
                      </>
                    )}

                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !isMobile && (
            <Link to="/login" className="menu-item">Đăng nhập</Link>
          )}
          {!isMobile && (
          <div className="language-selector">
            <button 
              className="language-button"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            >
              <img 
                src={languages.find(l => l.code === selectedLanguage)?.flag}
                alt={selectedLanguage.toUpperCase()} 
                className="flag-icon"
              />
              {selectedLanguage.toUpperCase()}
            </button>
            
            {showLanguageMenu && (
              <div className="language-dropdown">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    className={`language-option ${selectedLanguage === lang.code ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    <img 
                      src={lang.flag}
                      alt={lang.code}
                      className="flag-icon"
                    />
                    <span>{lang.name}</span>
                    {selectedLanguage === lang.code && (
                      <span className="check-icon">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobile && showMobileMenu && (
        <div className="header-mobile-menu">
          <div className="mobile-menu-search">
            <input type="text" placeholder="Tìm phim, rạp" className="search-input" />
            <FaSearch />
          </div>
          {user ? (
            <>
              <Link to="/profile" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
                <FaUser /> {user.fullName}
              </Link>
              <Link to="/bookings" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
                Lịch sử đặt vé
              </Link>
              {user.roles && isStaffMember(user.roles) && (
                <Link to={getDashboardPath(user.roles)} className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
                  <FaTachometerAlt /> Dashboard
                </Link>
              )}
              <button className="mobile-menu-item logout-btn" onClick={() => { handleLogout(); setShowMobileMenu(false); }}>
                <FaSignOutAlt /> Đăng xuất
              </button>
              <div className="mobile-menu-item mobile-points">💎 {loyaltyPoints.toLocaleString()} điểm</div>
            </>
          ) : (
            <Link to="/login" className="mobile-menu-item" onClick={() => setShowMobileMenu(false)}>
              Đăng nhập
            </Link>
          )}
          <div className="mobile-menu-lang">
            <span className="mobile-menu-label">Ngôn ngữ:</span>
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`mobile-lang-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
                onClick={() => { handleLanguageChange(lang.code); }}
              >
                <img src={lang.flag} alt={lang.code} className="flag-icon" />
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

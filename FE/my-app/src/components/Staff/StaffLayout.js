import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaCheckCircle,
  FaHamburger,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaStore,
  FaTachometerAlt,
} from 'react-icons/fa';
import './StaffLayout.css';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const StaffLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [staffCinema, setStaffCinema] = useState(null);
  const navigate = useNavigate();

  const menuItems = useMemo(
    () => [
      { path: '/staff/dashboard', icon: FaTachometerAlt, label: 'Tổng quan' },
      { path: '/staff/check-in', icon: FaCheckCircle, label: 'Check-in vé' },
      { path: '/staff/concession-orders', icon: FaHamburger, label: 'Đơn bắp nước' },
    ],
    []
  );

  const fetchStaffCinema = useCallback(async () => {
    const token = Cookies.get('accessToken');
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      setStaffCinema(null);
      return;
    }
    if (!user.userId || !token) {
      setStaffCinema(null);
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/tickets/staff/my-cinema?staffId=${user.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) return;
      const json = await response.json();
      if (json.success === false) return;
      const payload = json.data !== undefined ? json.data : json;
      if (payload && (payload.cinemaId || payload.cinemaName)) {
        setStaffCinema(payload);
      }
    } catch {
      setStaffCinema(null);
    }
  }, []);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      navigate('/login');
      return;
    }
    if (!token || !user.userId) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const handleResize = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      if (mobile) setIsCollapsed(true);
      else setIsCollapsed(false);
    };
    handleResize();
    mq.addEventListener('change', handleResize);
    window.addEventListener('resize', handleResize);
    fetchStaffCinema();
    return () => {
      mq.removeEventListener('change', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [fetchStaffCinema]);

  const toggleSidebar = useCallback(() => setIsCollapsed((v) => !v), []);

  const closeMobileSidebar = useCallback(() => setIsCollapsed(true), []);

  const openMobileSidebar = useCallback(() => setIsCollapsed(false), []);

  const handleLogout = useCallback(() => {
    Cookies.remove('accessToken');
    Cookies.remove('token');
    localStorage.removeItem('user');
    navigate('/login');
  }, [navigate]);

  const sidebarState = isMobile ? (isCollapsed ? 'collapsed' : 'open') : isCollapsed ? 'collapsed' : 'open';

  return (
    <div className="stf-shell" data-sidebar={sidebarState} data-mobile={isMobile ? 'true' : 'false'}>
      {isMobile && !isCollapsed && (
        <button
          type="button"
          className="stf-backdrop"
          aria-label="Đóng menu"
          onClick={closeMobileSidebar}
        />
      )}
      {isMobile && isCollapsed && (
        <button type="button" className="stf-menu-btn" onClick={openMobileSidebar} aria-label="Mở menu">
          <FaBars />
          <span>Menu</span>
        </button>
      )}

      <aside
        className={`stf-sidebar ${isCollapsed ? 'stf-sidebar--collapsed' : ''} ${
          isMobile ? 'stf-sidebar--drawer' : ''
        }`}
        aria-label="Menu nhân viên rạp"
      >
        <div className="stf-sidebar__head">
          <div className="stf-brand">
            <FaStore className="stf-brand__ico" aria-hidden />
            {!isCollapsed && <span className="stf-brand__txt">Nhân viên rạp</span>}
          </div>
          <button
            type="button"
            className="stf-sidebar__toggle"
            onClick={toggleSidebar}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        {!isCollapsed && staffCinema && (
          <div className="stf-cinema">
            <div className="stf-cinema__name">{staffCinema.cinemaName || '—'}</div>
            <div className="stf-cinema__role">{staffCinema.position || 'Nhân viên'}</div>
          </div>
        )}

        <nav className="stf-nav" aria-label="Chức năng">
          {!isCollapsed && <div className="stf-nav__label">Chức năng</div>}
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `stf-nav__link${isActive ? ' is-active' : ''}`
              }
              onClick={() => isMobile && closeMobileSidebar()}
            >
              <span className="stf-nav__ico">
                <item.icon aria-hidden />
              </span>
              {!isCollapsed && <span className="stf-nav__txt">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="stf-sidebar__foot">
          <NavLink to="/" className="stf-nav__link stf-nav__link--muted" onClick={() => isMobile && closeMobileSidebar()}>
            <span className="stf-nav__ico">
              <FaHome aria-hidden />
            </span>
            {!isCollapsed && <span className="stf-nav__txt">Trang chủ</span>}
          </NavLink>
          <button type="button" className="stf-nav__link stf-nav__link--danger" onClick={handleLogout}>
            <span className="stf-nav__ico">
              <FaSignOutAlt aria-hidden />
            </span>
            {!isCollapsed && <span className="stf-nav__txt">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="stf-main">
        <div className="stf-outlet">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default StaffLayout;

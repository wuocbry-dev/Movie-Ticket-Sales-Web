import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  FaFilm,
  FaTicketAlt,
  FaUsers,
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt,
  FaClock,
  FaBuilding,
  FaUtensils,
  FaBoxes,
  FaShoppingCart,
  FaClipboardList,
  FaUserTie,
  FaGift,
  FaTachometerAlt,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import { TOAST_IDS } from '../../utils/toastIds';
import './AdminLayout.css';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isCinemaManager, setIsCinemaManager] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showtimePath = isCinemaManager ? '/admin/manager-showtimes' : '/admin/showtimes';

  const menuItems = useMemo(
    () => [
      {
        title: 'Tổng quan',
        icon: <FaTachometerAlt aria-hidden />,
        path: '/admin/dashboard',
        description: 'Dashboard thống kê',
        section: 'core',
        hidden: false,
      },
      {
        title: 'Quản lý phim',
        icon: <FaFilm aria-hidden />,
        path: '/admin/movies',
        description: 'Thêm, sửa, xóa phim',
        section: 'core',
        hidden: isCinemaManager,
      },
      {
        title: 'Quản lý chuỗi rạp',
        icon: <FaBuilding aria-hidden />,
        path: '/admin/cinema-management',
        description: 'Chuỗi rạp',
        section: 'core',
        hidden: isCinemaManager,
      },
      {
        title: 'Quản lý suất chiếu',
        icon: <FaClock aria-hidden />,
        path: showtimePath,
        description: isCinemaManager ? 'Suất chiếu rạp của bạn' : 'Lịch chiếu toàn hệ thống',
        section: 'core',
        hidden: false,
      },
      {
        title: 'Quản lý đặt vé',
        icon: <FaClipboardList aria-hidden />,
        path: '/admin/bookings',
        description: 'Đơn đặt vé, đặt hộ khách',
        section: 'core',
        hidden: false,
      },
      {
        title: 'Quản lý thanh toán',
        icon: <FaTicketAlt aria-hidden />,
        path: '/admin/payment-manager',
        description: 'Xác nhận thanh toán',
        section: 'sales',
        hidden: isCinemaManager,
      },
      {
        title: 'Khuyến mãi',
        icon: <FaGift aria-hidden />,
        path: '/admin/promotions',
        description: 'Chương trình ưu đãi',
        section: 'sales',
        hidden: false,
      },
      {
        title: 'Danh mục bắp nước',
        icon: <FaBoxes aria-hidden />,
        path: '/admin/concession-categories',
        description: 'Danh mục sản phẩm',
        section: 'concession',
        adminOnly: true,
      },
      {
        title: 'Sản phẩm bắp nước',
        icon: <FaUtensils aria-hidden />,
        path: '/admin/concession-items',
        description: 'Combo, đồ uống',
        section: 'concession',
        adminOnly: true,
      },
      {
        title: 'Bắp nước rạp',
        icon: <FaShoppingCart aria-hidden />,
        path: '/admin/cinema-concessions',
        description: 'Giá & tồn theo rạp',
        section: 'concession',
        adminOnly: false,
      },
      {
        title: 'Đơn hàng bắp nước',
        icon: <FaClipboardList aria-hidden />,
        path: '/admin/concession-orders',
        description: 'Theo dõi đơn',
        section: 'concession',
        adminOnly: false,
      },
      {
        title: 'Quản lý tài khoản',
        icon: <FaUsers aria-hidden />,
        path: '/admin/accounts',
        description: 'Người dùng & phân quyền',
        section: 'users',
        hidden: isCinemaManager,
      },
      {
        title: 'Quản lý nhân viên',
        icon: <FaUserTie aria-hidden />,
        path: '/admin/cinema-staffs',
        description: 'Gán nhân viên rạp',
        section: 'users',
        hidden: false,
      },
    ],
    [isCinemaManager, showtimePath]
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)');
    const handler = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') {
      try {
        const userData = JSON.parse(raw);
        setIsSystemAdmin(Boolean(userData.roles?.includes('SYSTEM_ADMIN')));
        setIsCinemaManager(Boolean(userData.roles?.includes('CINEMA_MANAGER')));
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const userLabel = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw || raw === 'undefined') return 'Admin';
      const u = JSON.parse(raw);
      return u.fullName || u.email || 'Admin';
    } catch {
      return 'Admin';
    }
  }, []);

  const isNavActive = useCallback(
    (path) => {
      const cur = (location.pathname || '').replace(/\/$/, '') || '/';
      const target = path.replace(/\/$/, '');
      if (cur === target) return true;
      if (target === '/admin/cinemas' && cur.startsWith('/admin/cinemas/')) return true;
      return false;
    },
    [location.pathname]
  );

  const handleLogout = useCallback(() => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged'));
    toast.success('Đăng xuất thành công!', { toastId: TOAST_IDS.LOGOUT_SUCCESS });
    navigate('/');
  }, [navigate]);

  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const closeMobileSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const renderNavSection = (sectionKey, title, options = {}) => {
    const { hideLabel = false } = options;
    const items = menuItems.filter((item) => {
      if (item.section !== sectionKey || item.hidden) return false;
      if (item.adminOnly && !isSystemAdmin) return false;
      return true;
    });
    if (items.length === 0) return null;
    return (
      <>
        {sidebarOpen && !hideLabel && (
          <div className="adm-nav__label" role="presentation">
            {title}
          </div>
        )}
        {items.map((item) => (
          <Link
            key={item.path + item.title}
            to={item.path}
            className={`adm-nav__link ${isNavActive(item.path) ? 'is-active' : ''}`}
            title={item.description}
            onClick={() => isMobile && closeMobileSidebar()}
          >
            <span className="adm-nav__ico">{item.icon}</span>
            {sidebarOpen && <span className="adm-nav__text">{item.title}</span>}
          </Link>
        ))}
      </>
    );
  };

  return (
    <div className="adm-shell" data-sidebar={sidebarOpen ? 'open' : 'collapsed'}>
      <aside
        className={`adm-sidebar ${sidebarOpen ? 'is-open' : 'is-collapsed'}`}
        aria-label="Menu quản trị"
      >
        <div className="adm-sidebar__brand">
          {sidebarOpen ? (
            <>
              <span className="adm-sidebar__logo">Q2K</span>
              <span className="adm-sidebar__badge">Admin</span>
            </>
          ) : (
            <span className="adm-sidebar__logo adm-sidebar__logo--sm">Q</span>
          )}
        </div>

        <button
          type="button"
          className="adm-sidebar__collapse"
          onClick={toggleSidebar}
          aria-expanded={sidebarOpen}
          title={sidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        <nav className="adm-sidebar__nav">
          {renderNavSection('core', 'Quản lý chính')}
          {renderNavSection('sales', 'Bán hàng')}
          {renderNavSection('concession', 'Bắp nước', { hideLabel: isCinemaManager })}
          {renderNavSection('users', 'Người dùng')}
        </nav>

        <div className="adm-sidebar__footer">
          <Link
            to="/"
            className="adm-nav__link adm-nav__link--muted"
            onClick={() => isMobile && closeMobileSidebar()}
          >
            <span className="adm-nav__ico">
              <FaHome aria-hidden />
            </span>
            {sidebarOpen && <span className="adm-nav__text">Về trang chủ</span>}
          </Link>
          <button type="button" className="adm-nav__link adm-nav__link--danger" onClick={handleLogout}>
            <span className="adm-nav__ico">
              <FaSignOutAlt aria-hidden />
            </span>
            {sidebarOpen && <span className="adm-nav__text">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <div className="adm-topbar__left">
            {isMobile && (
              <button
                type="button"
                className="adm-topbar__icon-btn"
                onClick={openMobileSidebar}
                aria-label="Mở menu"
              >
                <FaBars />
              </button>
            )}
            <div className="adm-topbar__titles">
              <span className="adm-topbar__eyebrow">Bảng điều khiển</span>
              <h1 className="adm-topbar__title">Quản trị hệ thống</h1>
            </div>
          </div>
          <div className="adm-topbar__right">
            <a href="/" className="adm-topbar__link" target="_blank" rel="noopener noreferrer">
              <FaExternalLinkAlt aria-hidden />
              <span>Xem website</span>
            </a>
            <div className="adm-topbar__user" title={userLabel}>
              <span className="adm-topbar__avatar" aria-hidden>
                {userLabel.charAt(0).toUpperCase()}
              </span>
              <span className="adm-topbar__name">{userLabel}</span>
            </div>
          </div>
        </header>

        <div className="adm-outlet">
          <Outlet />
        </div>
      </div>

      {isMobile && sidebarOpen && (
        <button
          type="button"
          className="adm-backdrop"
          aria-label="Đóng menu"
          onClick={closeMobileSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout;

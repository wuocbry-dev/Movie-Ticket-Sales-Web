import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { 
  FaFilm, 
  FaTheaterMasks, 
  FaTicketAlt, 
  FaUsers, 
  FaChartLine, 
  FaTags,
  FaBars,
  FaTimes,
  FaHome,
  FaSignOutAlt,
  FaClock,
  FaCalendarAlt,
  FaUserShield,
  FaBell,
  FaClipboardList,
  FaCog,
  FaBuilding,
  FaUtensils,
  FaBoxes,
  FaShoppingCart,
  FaUserTie
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import './AdminLayout.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  const [isCinemaManager, setIsCinemaManager] = useState(false);

  // Check user roles
  React.useEffect(() => {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      try {
        const userData = JSON.parse(user);
        const hasSystemAdminRole = userData.roles && userData.roles.includes('SYSTEM_ADMIN');
        const hasCinemaManagerRole = userData.roles && userData.roles.includes('CINEMA_MANAGER');
        setIsSystemAdmin(hasSystemAdminRole);
        setIsCinemaManager(hasCinemaManagerRole);
      } catch (e) {
        console.error('Error parsing user data:', e);
        localStorage.removeItem('user');
      }
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    // Core Management
    // Ẩn "Quản lý phim" nếu là cinema manager
    {
      title: 'Quản lý phim',
      icon: <FaFilm />,
      path: '/admin/movies',
      description: 'Thêm, sửa, xóa phim',
      section: 'core',
      hidden: isCinemaManager
    },
    // Ẩn "Quản lý chuỗi rạp" nếu là cinema manager
    {
      title: 'Quản lý chuỗi rạp',
      icon: <FaBuilding />,
      path: '/admin/cinema-management',
      description: 'Quản lý chuỗi rạp chiếu phim',
      section: 'core',
      hidden: isCinemaManager
    },
    {
      title: 'Quản lý suất chiếu',
      icon: <FaClock />,
      path: isCinemaManager ? '/admin/manager-showtimes' : '/admin/showtimes',
      description: isCinemaManager ? 'Quản lý suất chiếu rạp của bạn' : 'Lịch chiếu phim',
      section: 'core'
    },
    // Booking & Sales
    // Ẩn "Quản lý thanh toán" nếu là cinema manager
    {
      title: 'Quản lý thanh toán',
      icon: <FaTicketAlt />,
      path: '/admin/payment-manager',
      description: 'Quản lý thanh toán',
      section: 'sales',
      hidden: isCinemaManager
    },
    // Concession Management
    {
      title: 'Danh mục bắp nước',
      icon: <FaBoxes />,
      path: '/admin/concession-categories',
      description: 'Quản lý danh mục sản phẩm',
      section: 'concession',
      adminOnly: true
    },
    {
      title: 'Sản phẩm bắp nước',
      icon: <FaUtensils />,
      path: '/admin/concession-items',
      description: 'Quản lý sản phẩm combo, bắp rang, nước',
      section: 'concession',
      adminOnly: true
    },
    {
      title: 'Bắp nước rạp',
      icon: <FaShoppingCart />,
      path: '/admin/cinema-concessions',
      description: 'Quản lý bắp nước theo rạp',
      section: 'concession'
    },
    {
      title: 'Đơn hàng bắp nước',
      icon: <FaClipboardList />,
      path: '/admin/concession-orders',
      description: 'Quản lý đơn hàng bắp nước',
      section: 'concession'
    },
    // User Management
    // Ẩn "Quản lý tài khoản" nếu là cinema manager
    {
      title: 'Quản lý tài khoản',
      icon: <FaUsers />,
      path: '/admin/accounts',
      description: 'Quản lý tài khoản người dùng',
      section: 'users',
      hidden: isCinemaManager
    },
    // Quản lý nhân viên rạp - cho Manager và Admin
    {
      title: 'Quản lý nhân viên',
      icon: <FaUserTie />,
      path: '/admin/cinema-staffs',
      description: 'Gán nhân viên vào rạp',
      section: 'users'
    }
  ];

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged'));
    toast.success('Đăng xuất thành công!');
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {/* Core Management Section */}
          {sidebarOpen && <div className="nav-section-title">QUẢN LÝ CHÍNH</div>}
          {menuItems.filter(item => item.section === 'core' && !item.hidden).map((item, index) => (
            <Link
              key={`core-${index}`}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                </div>
              )}
            </Link>
          ))}

          {/* Sales Section */}
          {sidebarOpen && <div className="nav-section-title">BÁN HÀNG</div>}
          {menuItems.filter(item => item.section === 'sales' && !item.hidden).map((item, index) => (
            <Link
              key={`sales-${index}`}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                </div>
              )}
            </Link>
          ))}

          {/* Concession Section */}
          {sidebarOpen && !isCinemaManager && <div className="nav-section-title">BẮP NƯỚC</div>}
          {menuItems.filter(item => item.section === 'concession').filter(item => {
            // Filter out admin-only items for non-admins
            if (item.adminOnly && !isSystemAdmin) return false;
            return true;
          }).map((item, index) => (
            <Link
              key={`concession-${index}`}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                </div>
              )}
            </Link>
          ))}

          {/* Users Section */}
          {sidebarOpen && !isCinemaManager && <div className="nav-section-title">NGƯỜI DÙNG</div>}
          {menuItems.filter(item => item.section === 'users' && !item.hidden).map((item, index) => (
            <Link
              key={`users-${index}`}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-title">{item.title}</span>
                </div>
              )}
            </Link>
          ))}

          {/* System Section */}
          {/* Đã xoá dòng chữ HỆ THỐNG */}
          {menuItems.filter(item => item.section === 'system').map((item, index) => null)}
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="nav-item">
            <span className="nav-icon"><FaHome /></span>
            {sidebarOpen && <span className="nav-title">Về trang chủ</span>}
          </Link>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <span className="nav-icon"><FaSignOutAlt /></span>
            {sidebarOpen && <span className="nav-title">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`admin-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <Outlet />
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;

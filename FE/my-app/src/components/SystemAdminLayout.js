import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaFilm, 
  FaTheaterMasks, 
  FaUsers, 
  FaCog, 
  FaChartBar, 
  FaClipboardList,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaTicketAlt,
  FaGift,
  FaBell,
  FaDatabase,
  FaUserShield
} from 'react-icons/fa';
import './SystemAdminLayout.css';
import Cookies from 'js-cookie';

const SystemAdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/system-admin/dashboard', icon: FaTachometerAlt, label: 'Tổng Quan', active: true },
  ];

  return (
    <div className="system-admin-layout">
      <aside className={`system-admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="system-admin-sidebar-header">
          <div className="system-admin-logo">
            <FaDatabase className="logo-icon" />
            {!isCollapsed && <span>SYSTEM ADMIN</span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        <nav className="system-admin-sidebar-nav">
          <div className="nav-section">
            {!isCollapsed && <div className="nav-section-title">QUẢN TRỊ HỆ THỐNG</div>}
            {menuItems.filter(item => item.active).map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `nav-item ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="nav-icon" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="system-admin-sidebar-footer">
          <NavLink to="/" className="nav-item">
            <FaHome className="nav-icon" />
            {!isCollapsed && <span>Trang Chủ</span>}
          </NavLink>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" />
            {!isCollapsed && <span>Đăng Xuất</span>}
          </button>
        </div>
      </aside>

      <main className={`system-admin-content ${isCollapsed ? 'expanded' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default SystemAdminLayout;

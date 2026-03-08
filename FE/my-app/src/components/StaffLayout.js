import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  FaClock,
  FaTicketAlt,
  FaCheckCircle,
  FaHamburger,
  FaCalendarAlt,
  FaUndo,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaStore,
  FaClipboardList,
  FaTachometerAlt
} from 'react-icons/fa';
import './StaffLayout.css';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const StaffLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [staffCinema, setStaffCinema] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Fetch staff's cinema info
    fetchStaffCinema();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchStaffCinema = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const token = Cookies.get('accessToken');
      if (!user.userId || !token) return;

      const response = await fetch(
        `${API_BASE_URL}/tickets/staff/my-cinema?staffId=${user.userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffCinema(data);
        }
      }
    } catch (error) {
      console.error('Error fetching staff cinema:', error);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { path: '/staff/dashboard', icon: FaTachometerAlt, label: 'Dashboard', active: true },
    { path: '/staff/check-in', icon: FaCheckCircle, label: 'Check-in Vé', active: true },
    { path: '/staff/concession-orders', icon: FaHamburger, label: 'Đơn Bắp Nước', active: true },
  ];

  return (
    <div className="staff-layout">
      <aside className={`staff-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="staff-sidebar-header">
          <div className="staff-logo">
            <FaStore className="logo-icon" />
            {!isCollapsed && <span>CINEMA STAFF</span>}
          </div>
          <button className="toggle-btn" onClick={toggleSidebar}>
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </button>
        </div>

        {/* Hiển thị thông tin rạp của staff */}
        {!isCollapsed && staffCinema && (
          <div className="staff-cinema-info">
            <div className="cinema-name">{staffCinema.cinemaName}</div>
            <div className="staff-position">{staffCinema.position || 'Nhân viên'}</div>
          </div>
        )}

        <nav className="staff-sidebar-nav">
          <div className="nav-section">
            {!isCollapsed && <div className="nav-section-title">CHỨC NĂNG</div>}
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

        <div className="staff-sidebar-footer">
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

      <main className={`staff-content ${isCollapsed ? 'expanded' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default StaffLayout;

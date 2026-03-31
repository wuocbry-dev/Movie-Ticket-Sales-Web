import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaFilm, FaCookieBite, FaTicketAlt, FaGift, FaUser } from 'react-icons/fa';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/now-showing', icon: FaFilm, label: 'Lịch chiếu' },
    { path: '/concessions', icon: FaCookieBite, label: 'Bắp nước' },
    { path: '/', icon: FaTicketAlt, label: 'Đặt vé' },
    { path: '/promotions', icon: FaGift, label: 'Khuyến mãi' },
    { path: '/profile', icon: FaUser, label: 'Tài khoản' },
  ];

  const isActive = (item) => {
    if (item.path === '/' && item.hash) return location.pathname === '/' && location.hash === item.hash;
    if (item.path === '/') return location.pathname === '/';
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="bottom-nav-mobile">
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.path}
          className={`bottom-nav-item ${isActive(item) ? 'active' : ''}`}
        >
          <item.icon className="bottom-nav-icon" />
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};

export default BottomNav;

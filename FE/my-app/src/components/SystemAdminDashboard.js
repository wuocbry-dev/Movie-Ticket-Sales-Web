import React, { useState, useEffect } from 'react';
import './SystemAdminDashboard.css';
import { 
  FaTheaterMasks, 
  FaFilm, 
  FaUsers, 
  FaMoneyBillWave,
  FaUserShield,
  FaStore,
  FaArrowUp,
  FaChartLine
} from 'react-icons/fa';

const SystemAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCinemas: 0,
    totalMovies: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalManagers: 0,
    totalStaff: 0,
  });

  useEffect(() => {
    // Mock data
    setTimeout(() => {
      setStats({
        totalCinemas: 15,
        totalMovies: 248,
        totalUsers: 45230,
        totalRevenue: 8950000000,
        totalManagers: 15,
        totalStaff: 89,
      });
    }, 500);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statsCards = [
    { title: 'Tổng Rạp Chiếu', value: stats.totalCinemas, icon: FaTheaterMasks, color: '#8a2be2' },
    { title: 'Tổng Phim', value: stats.totalMovies, icon: FaFilm, color: '#00d4ff' },
    { title: 'Tổng Khách Hàng', value: stats.totalUsers.toLocaleString(), icon: FaUsers, color: '#ffd700' },
    { title: 'Doanh Thu Tổng', value: formatCurrency(stats.totalRevenue), icon: FaMoneyBillWave, color: '#00ff88' },
    { title: 'Quản Lý Rạp', value: stats.totalManagers, icon: FaUserShield, color: '#ff6b6b' },
    { title: 'Nhân Viên', value: stats.totalStaff, icon: FaStore, color: '#22d3ee' },
  ];

  return (
    <div className="system-admin-dashboard">
      <div className="sad-dashboard-header">
        <h1>QUẢN TRỊ HỆ THỐNG</h1>
        <p className="sad-header-subtitle">Tổng quan toàn bộ hệ thống rạp chiếu phim</p>
      </div>

      <div className="sad-stats-grid">
        {statsCards.map((stat, index) => (
          <div key={index} className="sad-stat-card" style={{ '--card-color': stat.color }}>
            <div className="sad-stat-icon">
              <stat.icon />
            </div>
            <div className="sad-stat-content">
              <div className="sad-stat-title">{stat.title}</div>
              <div className="sad-stat-value">{stat.value}</div>
              <div className="sad-stat-trend">
                <FaArrowUp /> Hoạt động tốt
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sad-activity-section">
        <h2>Hoạt Động Gần Đây</h2>
        <div className="sad-activity-placeholder">
          <FaChartLine className="sad-placeholder-icon" />
          <p>Biểu đồ thống kê sẽ được hiển thị tại đây</p>
        </div>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFilm, 
  FaTheaterMasks, 
  FaTicketAlt, 
  FaUsers, 
  FaChartLine,
  FaDollarSign,
  FaArrowUp,
  FaStar
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    activeUsers: 0,
  });

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setStats({
      totalMovies: 45,
      totalCinemas: 12,
      totalBookings: 1234,
      totalRevenue: 567890000,
      todayBookings: 89,
      activeUsers: 2340,
    });
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statsCards = [
    {
      title: 'Tổng số phim',
      value: stats.totalMovies,
      icon: <FaFilm />,
      color: '#e50914',
      link: '/admin/movies',
      change: '+5 phim mới',
      changeType: 'positive'
    },
    {
      title: 'Số rạp chiếu',
      value: stats.totalCinemas,
      icon: <FaTheaterMasks />,
      color: '#ff9800',
      link: '/admin/cinemas',
      change: '2 rạp mới',
      changeType: 'positive'
    },
    {
      title: 'Tổng vé đã bán',
      value: stats.totalBookings.toLocaleString(),
      icon: <FaTicketAlt />,
      color: '#4CAF50',
      link: '/admin/bookings',
      change: '+89 hôm nay',
      changeType: 'positive'
    },
    {
      title: 'Doanh thu',
      value: formatCurrency(stats.totalRevenue),
      icon: <FaDollarSign />,
      color: '#2196F3',
      link: '/admin/reports',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      title: 'Người dùng hoạt động',
      value: stats.activeUsers.toLocaleString(),
      icon: <FaUsers />,
      color: '#9c27b0',
      link: '/admin/users',
      change: '+234 tuần này',
      changeType: 'positive'
    },
    {
      title: 'Đánh giá trung bình',
      value: '4.5/5',
      icon: <FaStar />,
      color: '#ff5722',
      link: '/admin/reviews',
      change: '+0.3',
      changeType: 'positive'
    }
  ];
};

export default Dashboard;
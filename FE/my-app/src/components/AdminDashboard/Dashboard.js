import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaFilm,
  FaTheaterMasks,
  FaTicketAlt,
  FaUsers,
  FaChartLine,
  FaDollarSign,
  FaArrowUp,
  FaBullhorn,
} from 'react-icons/fa';
import './Dashboard.css';

const formatVnd = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    activeUsers: 0,
  });

  const [isCinemaManager, setIsCinemaManager] = useState(false);

  const displayName = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw || raw === 'undefined') return '';
      const u = JSON.parse(raw);
      return u.fullName || u.email || '';
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw && raw !== 'undefined') {
        const u = JSON.parse(raw);
        setIsCinemaManager(Boolean(u.roles?.includes('CINEMA_MANAGER')));
      }
    } catch {
      setIsCinemaManager(false);
    }
  }, []);

  useEffect(() => {
    setStats({
      totalMovies: 45,
      totalCinemas: 12,
      totalBookings: 1234,
      totalRevenue: 567890000,
      todayBookings: 89,
      activeUsers: 2340,
    });
  }, []);

  const showtimePath = isCinemaManager ? '/admin/manager-showtimes' : '/admin/showtimes';

  const statsCards = useMemo(
    () => [
      {
        title: 'Tổng số phim',
        value: stats.totalMovies,
        icon: FaFilm,
        tone: 'rose',
        link: '/admin/movies',
        change: '+5 phim mới',
        hide: isCinemaManager,
      },
      {
        title: 'Số rạp chiếu',
        value: stats.totalCinemas,
        icon: FaTheaterMasks,
        tone: 'amber',
        link: '/admin/cinema-management',
        change: '2 rạp mới',
        hide: isCinemaManager,
      },
      {
        title: 'Tổng vé đã bán',
        value: stats.totalBookings.toLocaleString('vi-VN'),
        icon: FaTicketAlt,
        tone: 'emerald',
        link: '/admin/bookings',
        change: `+${stats.todayBookings} hôm nay`,
        hide: false,
      },
      {
        title: 'Doanh thu (gần đúng)',
        value: formatVnd(stats.totalRevenue),
        icon: FaDollarSign,
        tone: 'sky',
        link: '/admin/reports',
        change: '+12.5%',
        hide: false,
      },
      {
        title: 'Người dùng hoạt động',
        value: stats.activeUsers.toLocaleString('vi-VN'),
        icon: FaUsers,
        tone: 'violet',
        link: '/admin/accounts',
        change: '+234 tuần này',
        hide: isCinemaManager,
      },
      {
        title: 'Khuyến mãi',
        value: 'Xem',
        icon: FaBullhorn,
        tone: 'orange',
        link: '/admin/promotions',
        change: 'Đang chờ API',
        hide: false,
      },
    ],
    [stats, isCinemaManager]
  );

  const quickActions = useMemo(
    () => [
      {
        title: 'Thêm phim',
        desc: 'Đăng phim mới',
        icon: <FaFilm />,
        path: '/admin/movies',
        hide: isCinemaManager,
      },
      {
        title: 'Lịch chiếu',
        desc: 'Quản lý suất chiếu',
        icon: <FaChartLine />,
        path: showtimePath,
        hide: false,
      },
      {
        title: 'Đơn đặt vé',
        desc: 'Theo dõi booking',
        icon: <FaTicketAlt />,
        path: '/admin/bookings',
        hide: false,
      },
    ],
    [isCinemaManager, showtimePath]
  );

  const visibleCards = statsCards.filter((c) => !c.hide);
  const visibleQuick = quickActions.filter((a) => !a.hide);

  return (
    <div className="adm-dash" role="main" aria-label="Tổng quan admin">
      <header className="adm-dash__hero">
        <div>
          <p className="adm-dash__kicker">Xin chào{displayName ? `, ${displayName}` : ''}</p>
          <h2 className="adm-dash__title">Tổng quan điều hành</h2>
          <p className="adm-dash__desc">
            Số liệu mẫu để bố cục; kết nối API thống kê khi backend sẵn sàng.
          </p>
        </div>
        <div className="adm-dash__actions">
          <Link to={showtimePath} className="adm-dash__btn adm-dash__btn--ghost">
            Lịch chiếu
          </Link>
          <Link to="/admin/bookings" className="adm-dash__btn adm-dash__btn--primary">
            Đơn đặt vé
          </Link>
        </div>
      </header>

      <div className="adm-dash__grid">
        {visibleCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link key={index} to={card.link} className={`adm-dash__card adm-dash__card--${card.tone}`}>
              <div className="adm-dash__card-ico">
                <Icon aria-hidden />
              </div>
              <div className="adm-dash__card-body">
                <div className="adm-dash__card-label">{card.title}</div>
                <div className="adm-dash__card-value">{card.value}</div>
                <div className="adm-dash__card-delta">
                  <FaArrowUp aria-hidden /> {card.change}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="adm-dash__split">
        <section className="adm-dash__panel">
          <div className="adm-dash__panel-head">
            <h3 className="adm-dash__panel-title">Doanh thu</h3>
            <div className="adm-dash__tabs">
              <button type="button" className="adm-dash__tab is-active">
                7 ngày
              </button>
              <button type="button" className="adm-dash__tab" disabled>
                30 ngày
              </button>
            </div>
          </div>
          <div className="adm-dash__chart" aria-hidden>
            <FaChartLine />
            <span>Biểu đồ khi gắn API hoặc thư viện chart</span>
          </div>
        </section>

        <section className="adm-dash__panel">
          <h3 className="adm-dash__panel-title adm-dash__panel-title--solo">Thao tác nhanh</h3>
          <div className="adm-dash__quick">
            {visibleQuick.map((action, index) => (
              <Link key={index} to={action.path} className="adm-dash__quick-item">
                <span className="adm-dash__quick-ico">{action.icon}</span>
                <span className="adm-dash__quick-t">{action.title}</span>
                <span className="adm-dash__quick-d">{action.desc}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;

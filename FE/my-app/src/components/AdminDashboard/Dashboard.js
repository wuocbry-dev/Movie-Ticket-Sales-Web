import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import {
  Film, Users, Ticket, DollarSign, TrendingUp, TrendingDown,
  Calendar, CheckCircle, Clock, Percent, Activity, AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import Cookies from 'js-cookie';
import './Dashboard.css';

// --- MOCK DATA ---
const MOCK_SUMMARY = {
  revenue: 85500000, revTrend: 12.5,
  tickets: 1245, tktTrend: 5.2,
  bookings: 342, bkgTrend: -2.4,
  occupancy: 76.5, occTrend: 8.1,
  activeMovies: 12,
  todayShowtimes: 85,
  newUsers: 128,
  successfulPayments: 320,
  failedPayments: 15,
  pendingPayments: 7
};

const MOCK_REVENUE_DATA = [
  { name: 'T2', value: 45000000 },
  { name: 'T3', value: 52000000 },
  { name: 'T4', value: 48000000 },
  { name: 'T5', value: 61000000 },
  { name: 'T6', value: 59000000 },
  { name: 'T7', value: 85000000 },
  { name: 'CN', value: 92000000 },
];

const MOCK_PAYMENT_DATA = [
  { name: 'Thành công', value: 320, color: '#38a169' },
  { name: 'Thất bại', value: 15, color: '#e53e3e' },
  { name: 'Đang xử lý', value: 7, color: '#f6ad55' },
];

const MOCK_TOP_MOVIES = [
  { name: 'Avatar: The Way of Water', tickets: 4500 },
  { name: 'Lật Mặt 6', tickets: 3800 },
  { name: 'Dune: Part Two', tickets: 3200 },
  { name: 'Mai', tickets: 2900 },
  { name: 'Oppenheimer', tickets: 2100 },
];

const MOCK_RECENT_BOOKINGS = [
  { id: '#BK-1204', user: 'Nguyen Van A', movie: 'Dune: Part Two', amount: 240000, status: 'PAID', time: '10 phút trước' },
  { id: '#BK-1205', user: 'Tran Thi B', movie: 'Mai', amount: 120000, status: 'PENDING', time: '15 phút trước' },
  { id: '#BK-1206', user: 'Le Van C', movie: 'Avatar', amount: 360000, status: 'PAID', time: '1 giờ trước' },
  { id: '#BK-1207', user: 'Hoang D', movie: 'Lật Mặt 6', amount: 480000, status: 'FAILED', time: '2 giờ trước' },
];

const formatVnd = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const StatCard = ({ title, value, icon: Icon, trend, color, isCurrency, prefix, suffix }) => {
  const isUp = trend > 0;
  return (
    <div className={`ov-stat-card ov-border-${color}`}>
      <div className="ov-stat-top">
        <h4 className="ov-stat-title">{title}</h4>
        <div className={`ov-stat-icon bg-${color}-dim`}><Icon size={18} /></div>
      </div>
      <div className="ov-stat-value">
        {prefix && <span className="ov-prefix">{prefix}</span>}
        <CountUp end={value} duration={1.5} separator="," decimals={isCurrency ? 0 : (value % 1 !== 0 ? 1 : 0)} />
        {suffix && <span className="ov-suffix">{suffix}</span>}
      </div>
      {trend !== undefined && (
        <div className={`ov-stat-trend ${isUp ? 'trend-up' : 'trend-down'}`}>
          {isUp ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
          <span>{Math.abs(trend)}% so với hôm qua</span>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const currentYear = new Date().getFullYear();
  const [revenueData, setRevenueData] = useState([]);
  const [revenueMode, setRevenueMode] = useState('RECENT');
  const [revenueDays, setRevenueDays] = useState(7);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [paymentData, setPaymentData] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = Cookies.get('accessToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const [sumRes, payRes, topRes, recRes] = await Promise.all([
          fetch('http://localhost:8080/api/v1/dashboard/summary', { headers }),
          fetch('http://localhost:8080/api/v1/dashboard/payments', { headers }),
          fetch('http://localhost:8080/api/v1/dashboard/top-movies', { headers }),
          fetch('http://localhost:8080/api/v1/dashboard/recent-bookings', { headers })
        ]);

        if (sumRes.ok) setStats(await sumRes.json());
        if (payRes.ok) setPaymentData(await payRes.json());
        if (topRes.ok) setTopMovies(await topRes.json());
        if (recRes.ok) setRecentBookings(await recRes.json());

      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRevenueData = async (mode, days, year, month) => {
    try {
      const token = Cookies.get('accessToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      let url = `http://localhost:8080/api/v1/dashboard/revenue?mode=${mode}`;
      if (mode === 'RECENT') {
        url += `&days=${days}`;
      } else if (mode === 'CUSTOM') {
        url += `&year=${year}&month=${month}`;
      } else if (mode === 'ALL_TIME') {
        // Just use mode=ALL_TIME
      }
      
      const res = await fetch(url, { headers });
      if (res.ok) {
        setRevenueData(await res.json());
      }
    } catch (error) {
      console.error('Lỗi khi đổi filter doanh thu:', error);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchRevenueData(revenueMode, revenueDays, selectedYear, selectedMonth);
    }
  }, [revenueMode, revenueDays, selectedYear, selectedMonth, loading]);

  const displayName = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      return u?.fullName || u?.email || 'Admin';
    } catch { return 'Admin'; }
  }, []);

  if (loading || !stats) {
    return (
      <div className="ov-loading">
        <div className="ov-spinner"></div>
        <p>Đang tải dữ liệu tổng quan hệ thống rạp...</p>
      </div>
    );
  }

  return (
    <div className="ov-dashboard">
      {/* 1. HERO SUMMARY & QUICK ACTIONS */}
      <header className="ov-hero">
        <div className="ov-hero-text">
          <h1>Xin chào, {displayName} 👋</h1>
          <p>Dưới đây là tình hình hoạt động trực tiếp của hệ thống rạp chiếu phim trong ngày hôm nay.</p>
        </div>
        <div className="ov-quick-actions">
          <Link to="/admin/movies/new" className="ov-btn ov-btn-primary"><Film size={16}/> Thêm Phim Mới</Link>
          <Link to="/admin/manager-showtimes" className="ov-btn ov-btn-secondary"><Calendar size={16}/> Tạo Suất Chiếu</Link>
        </div>
      </header>

      {/* 2. KPI CARDS GRID */}
      <div className="ov-grid-cards">
        <StatCard title="Doanh thu hôm nay" value={stats.revenue} prefix="₫" icon={DollarSign} trend={stats.revTrend} color="gold" isCurrency />
        <StatCard title="Vé bán hôm nay" value={stats.tickets} icon={Ticket} trend={stats.tktTrend} color="blue" />
        <StatCard title="Tỉ lệ lấp đầy phòng" value={stats.occupancy} suffix="%" icon={Percent} trend={stats.occTrend} color="green" />
        <StatCard title="Lượt Đặt Vé (Booking)" value={stats.bookings} icon={Activity} trend={stats.bkgTrend} color="purple" />
        
        <StatCard title="Suất chiếu đang chạy" value={stats.todayShowtimes} icon={Clock} color="orange" />
        <StatCard title="Phim đang chiếu" value={stats.activeMovies} icon={Film} color="cyan" />
        <StatCard title="Thanh toán thành công" value={stats.successfulPayments} icon={CheckCircle} color="emerald" />
        <StatCard title="Thanh toán thất bại" value={stats.failedPayments} icon={AlertCircle} color="red" />
      </div>

      {/* 3. CHARTS ROW 1: REVENUE & PAYMENTS */}
      <div className="ov-grid-charts">
        {/* REVENUE CHART */}
        <div className="ov-card ov-col-span-2">
          <div className="ov-card-header">
            <h3>Doanh thu</h3>
            <div className="ov-flex-center" style={{gap: '10px'}}>
              <select className="ov-select" value={revenueMode} onChange={(e) => setRevenueMode(e.target.value)}>
                <option value="RECENT">Gần đây</option>
                <option value="CUSTOM">Chọn Năm / Tháng</option>
                <option value="ALL_TIME">Các năm hoạt động</option>
              </select>

              {revenueMode === 'RECENT' && (
                <select className="ov-select" value={revenueDays} onChange={(e) => setRevenueDays(Number(e.target.value))}>
                  <option value={7}>7 Ngày qua</option>
                  <option value={30}>30 Ngày qua</option>
                </select>
              )}

              {revenueMode === 'CUSTOM' && (
                <>
                  <select className="ov-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {[...Array(5)].map((_, i) => (
                      <option key={i} value={currentYear - i}>Năm {currentYear - i}</option>
                    ))}
                  </select>
                  <select className="ov-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="ALL">Cả năm</option>
                    {[...Array(12)].map((_, i) => (
                      <option key={i+1} value={i+1}>Tháng {i+1}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
          <div className="ov-chart-body">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f0b429" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#f0b429" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9fb4d6', fontSize: 13}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val / 1000000}M`} tick={{fill: '#9fb4d6', fontSize: 13}} dx={-10} />
                <RechartsTooltip 
                  formatter={(value) => [formatVnd(value), 'Doanh thu']} 
                  contentStyle={{backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff'}} 
                  itemStyle={{color: '#f0b429', fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="value" stroke="#f0b429" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PAYMENT DONUT */}
        <div className="ov-card">
          <div className="ov-card-header">
            <h3>Tỉ lệ trạng thái giao dịch</h3>
          </div>
          <div className="ov-chart-body ov-flex-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none">
                  {paymentData.map((entry, index) => ( <Cell key={`cell-${index}`} fill={entry.color} /> ))}
                </Pie>
                <RechartsTooltip contentStyle={{backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. CHARTS ROW 2: TOP MOVIES & RECENT BOOKINGS */}
      <div className="ov-grid-charts ov-mt-4">
        {/* TOP MOVIES BAR CHART */}
        <div className="ov-card">
          <div className="ov-card-header">
            <h3>Top 5 Phim Bán Chạy (Vé)</h3>
          </div>
          <div className="ov-chart-body">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={topMovies} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#9fb4d6'}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#eef5ff', fontSize: 13, width: 120}} width={120} />
                <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#161b22', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                <Bar dataKey="tickets" fill="#3182ce" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RECENT BOOKINGS TABLE */}
        <div className="ov-card ov-col-span-2">
          <div className="ov-card-header">
            <h3>Giao Dịch Đặt Vé Mới Nhất</h3>
            <Link to="/admin/bookings" className="ov-link">Xem tất cả</Link>
          </div>
          <div className="ov-table-container">
            <table className="ov-table">
              <thead>
                <tr>
                  <th>Mã Đơn</th>
                  <th>Khách hàng</th>
                  <th>Phim</th>
                  <th>Số tiền</th>
                  <th>Thời gian</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((bk, i) => (
                  <tr key={i}>
                    <td className="ov-font-mono">{bk.id}</td>
                    <td>{bk.user}</td>
                    <td className="ov-text-highlight">{bk.movie}</td>
                    <td className="ov-font-bold">{formatVnd(bk.amount)}</td>
                    <td className="ov-text-muted">{bk.time}</td>
                    <td>
                      <span className={`ov-badge badge-${bk.status.toLowerCase()}`}>
                        {bk.status === 'COMPLETED' ? 'Thành công' : bk.status === 'PENDING' ? 'Chờ thanh toán' : 'Thất bại'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

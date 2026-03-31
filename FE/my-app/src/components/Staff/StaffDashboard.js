import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClock,
  FaCheckCircle,
  FaCalendarDay,
  FaUserClock,
  FaQrcode,
  FaHamburger,
  FaChevronRight,
} from 'react-icons/fa';
import './StaffDashboard.css';

const SHIFT = { startTime: '08:00', endTime: '16:00' };

const StaffDashboard = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    let parsed = [];
    try {
      parsed = JSON.parse(localStorage.getItem('staffActivities') || '[]');
      if (!Array.isArray(parsed)) parsed = [];
    } catch {
      parsed = [];
    }
    setActivities(parsed);
    return () => clearInterval(timer);
  }, []);

  const formatTime = useCallback(
    (date) =>
      date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    []
  );

  const formatDate = useCallback(
    (date) =>
      date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const timeStr = useMemo(() => formatTime(currentTime), [currentTime, formatTime]);
  const dateStr = useMemo(() => formatDate(currentTime), [currentTime, formatDate]);

  const checkInCount = useMemo(
    () => activities.filter((a) => a.type === 'check-in').length,
    [activities]
  );

  const getActivityIcon = useCallback((type) => {
    if (type === 'check-in') {
      return <FaCheckCircle className="stf-dash__act-ico stf-dash__act-ico--check" aria-hidden />;
    }
    return <FaCheckCircle className="stf-dash__act-ico" aria-hidden />;
  }, []);

  return (
    <div className="stf-dash">
      <header className="stf-dash__hero">
        <div className="stf-dash__hero-top">
          <div>
            <p className="stf-dash__eyebrow">Ca làm việc</p>
            <h1 className="stf-dash__title">Bảng điều khiển nhân viên</h1>
          </div>
          <div className="stf-dash__clock">
            <div className="stf-dash__clock-row">
              <FaCalendarDay aria-hidden />
              <span>{dateStr}</span>
            </div>
            <div className="stf-dash__clock-row stf-dash__clock-row--time">
              <FaClock aria-hidden />
              <span>{timeStr}</span>
            </div>
          </div>
        </div>
        <div className="stf-dash__shift">
          <FaUserClock className="stf-dash__shift-ico" aria-hidden />
          <div>
            <span className="stf-dash__shift-label">Giờ làm việc</span>
            <span className="stf-dash__shift-time">
              {SHIFT.startTime} – {SHIFT.endTime}
            </span>
          </div>
        </div>
      </header>

      <section className="stf-dash__quick" aria-label="Lối tắt">
        <h2 className="stf-dash__section-title">Thao tác nhanh</h2>
        <div className="stf-dash__quick-grid">
          <Link to="/staff/check-in" className="stf-dash__quick-card">
            <span className="stf-dash__quick-ico">
              <FaQrcode aria-hidden />
            </span>
            <span className="stf-dash__quick-txt">Check-in vé</span>
            <FaChevronRight className="stf-dash__quick-arrow" aria-hidden />
          </Link>
          <Link to="/staff/concession-orders" className="stf-dash__quick-card">
            <span className="stf-dash__quick-ico">
              <FaHamburger aria-hidden />
            </span>
            <span className="stf-dash__quick-txt">Đơn bắp nước</span>
            <FaChevronRight className="stf-dash__quick-arrow" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="stf-dash__activity" aria-labelledby="stf-dash-activity-heading">
        <h2 id="stf-dash-activity-heading" className="stf-dash__section-title">
          Hoạt động hôm nay
        </h2>
        {activities.length > 0 ? (
          <ul className="stf-dash__list">
            {activities.map((activity, index) => (
              <li key={`${activity.timestamp ?? index}-${index}`} className="stf-dash__item">
                {getActivityIcon(activity.type)}
                <div className="stf-dash__item-body">
                  <div className="stf-dash__item-title">{activity.title}</div>
                  <div className="stf-dash__item-details">{activity.details}</div>
                </div>
                <time className="stf-dash__item-time" dateTime={activity.timestamp ? String(activity.timestamp) : undefined}>
                  {activity.time}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <div className="stf-dash__empty">
            <FaCheckCircle className="stf-dash__empty-ico" aria-hidden />
            <h3 className="stf-dash__empty-title">Chưa có hoạt động</h3>
            <p className="stf-dash__empty-desc">
              Các hoạt động check-in vé sẽ hiển thị tại đây sau khi bạn xác nhận tại trang Check-in.
            </p>
          </div>
        )}
      </section>

      <section className="stf-dash__stats" aria-labelledby="stf-dash-stats-heading">
        <h2 id="stf-dash-stats-heading" className="stf-dash__section-title">
          Thống kê ca
        </h2>
        <div className="stf-dash__stats-grid">
          <div className="stf-dash__stat">
            <div className="stf-dash__stat-num">{activities.length}</div>
            <div className="stf-dash__stat-label">Tổng hoạt động</div>
          </div>
          <div className="stf-dash__stat">
            <div className="stf-dash__stat-num">{checkInCount}</div>
            <div className="stf-dash__stat-label">Vé đã check-in</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StaffDashboard;

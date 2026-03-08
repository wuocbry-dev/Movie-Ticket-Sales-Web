import React, { useState, useEffect } from 'react';
import './StaffDashboard.css';
import { 
  FaClock,
  FaCheckCircle,
  FaCalendarDay,
  FaUserClock
} from 'react-icons/fa';

const StaffDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activities, setActivities] = useState([]);
  
  const shiftInfo = {
    startTime: '08:00',
    endTime: '16:00',
  };

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // TODO: Fetch actual activities from API
    // For now, showing empty state or you can load from localStorage
    const savedActivities = JSON.parse(localStorage.getItem('staffActivities') || '[]');
    setActivities(savedActivities);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'check-in':
        return <FaCheckCircle className="sd-activity-icon check-in" />;
      default:
        return <FaCheckCircle className="sd-activity-icon" />;
    }
  };

  return (
    <div className="staff-dashboard">
      <div className="sd-dashboard-header">
        <div className="sd-header-content">
          <h1>🎬 CA LÀM VIỆC</h1>
          <div className="sd-current-datetime">
            <div className="sd-current-date">
              <FaCalendarDay /> {formatDate(currentTime)}
            </div>
            <div className="sd-current-time">
              <FaClock /> {formatTime(currentTime)}
            </div>
          </div>
        </div>
        <div className="sd-shift-info-card">
          <FaUserClock className="sd-shift-icon" />
          <div className="sd-shift-details">
            <span className="sd-shift-label">Giờ làm việc</span>
            <span className="sd-shift-time">{shiftInfo.startTime} - {shiftInfo.endTime}</span>
          </div>
        </div>
      </div>

      <div className="sd-activity-section">
        <h2>📋 Hoạt Động Hôm Nay</h2>
        
        {activities.length > 0 ? (
          <div className="sd-activity-list">
            {activities.map((activity, index) => (
              <div key={index} className="sd-activity-item">
                {getActivityIcon(activity.type)}
                <div className="sd-activity-content">
                  <div className="sd-activity-title">{activity.title}</div>
                  <div className="sd-activity-details">{activity.details}</div>
                </div>
                <div className="sd-activity-time">{activity.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sd-activity-empty">
            <div className="sd-empty-icon">📝</div>
            <h3>Chưa có hoạt động nào</h3>
            <p>Các hoạt động check-in vé của bạn sẽ được hiển thị ở đây</p>
          </div>
        )}
      </div>

      <div className="sd-stats-section">
        <h2>📊 Thống Kê Ca Làm Việc</h2>
        <div className="sd-stats-grid">
          <div className="sd-stat-box">
            <div className="sd-stat-number">{activities.length}</div>
            <div className="sd-stat-label">Tổng hoạt động</div>
          </div>
          <div className="sd-stat-box">
            <div className="sd-stat-number">
              {activities.filter(a => a.type === 'check-in').length}
            </div>
            <div className="sd-stat-label">Vé đã check-in</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;

import React from 'react';
import './ComingSoon.css';

const ComingSoon = ({ feature = 'Tính năng này' }) => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">🚧</div>
        <h1>Đang Phát Triển</h1>
        <p>{feature} đang được phát triển và sẽ sớm ra mắt!</p>
        <div className="features-preview">
          <h3>Các tính năng đang hoàn thiện:</h3>
          <ul>
            <li>✅ Quản lý phim - Đã hoàn thành</li>
            <li>🔄 Quản lý rạp chiếu - Đang phát triển</li>
            <li>🔄 Quản lý suất chiếu - Đang phát triển</li>
            <li>🔄 Quản lý vé đặt - Đang phát triển</li>
            <li>🔄 Quản lý người dùng - Đang phát triển</li>
            <li>🔄 Khuyến mãi - Đang phát triển</li>
            <li>🔄 Báo cáo thống kê - Đang phát triển</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

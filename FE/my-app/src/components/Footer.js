import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo & Description */}
        <div className="footer-section footer-brand">
          <h2 className="footer-logo">
            <span className="logo-q">Q</span>
            <span className="logo-2">2</span>
            <span className="logo-k">K</span>
          </h2>
          <p className="footer-desc">
            Hệ thống đặt vé xem phim trực tuyến hàng đầu Việt Nam. 
            Trải nghiệm điện ảnh tuyệt vời với công nghệ hiện đại.
          </p>
          <div className="footer-social">
            <a href="https://www.facebook.com/quoc0.0quoc?locale=vi_VN" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/quoc0.0quoc/" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://www.youtube.com/@hikari_204" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.tiktok.com/@jk.hikari" target="_blank" rel="noopener noreferrer" className="social-link">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-title">Khám Phá</h3>
          <ul className="footer-links">
            <li><Link to="/now-showing">Phim Đang Chiếu</Link></li>
            <li><Link to="/coming-soon">Phim Sắp Chiếu</Link></li>
            <li><Link to="/cinemas">Hệ Thống Rạp</Link></li>
            <li><Link to="/">Khuyến Mãi</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h3 className="footer-title">Hỗ Trợ</h3>
          <ul className="footer-links">
            <li><Link to="/">Hướng Dẫn Đặt Vé</Link></li>
            <li><Link to="/">Câu Hỏi Thường Gặp</Link></li>
            <li><Link to="/">Điều Khoản Sử Dụng</Link></li>
            <li><Link to="/">Chính Sách Bảo Mật</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3 className="footer-title">Liên Hệ</h3>
          <ul className="footer-contact">
            <li>
              <i className="fas fa-map-marker-alt"></i>
              <span>11/7 Đường số 385, Phường Tăng Nhơn Phú A, TP Thủ Đức, TP.HCM</span>
            </li>
            <li>
              <i className="fas fa-phone-alt"></i>
              <div className="contact-multi">
                <span>0877 999 484</span>
                <span>0915 232 119</span>
                <span>0836 237 476</span>
              </div>
            </li>
            <li>
              <i className="fas fa-envelope"></i>
              <div className="contact-multi">
                <span>nguyenvanquoc11112004@gmail.com</span>
                <span>khanhkhoi08@gmail.com</span>
                <span>khanh115423@gmail.com</span>
              </div>
            </li>
            <li>
              <i className="fas fa-clock"></i>
              <span>8:00 - 22:00 (Hàng ngày)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2025 NHS Cinema. All rights reserved.</p>
          <div className="payment-methods">
            <span>Thanh toán:</span>
            <i className="fab fa-cc-visa"></i>
            <i className="fab fa-cc-mastercard"></i>
            <i className="fas fa-wallet"></i>
            <i className="fas fa-qrcode"></i>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

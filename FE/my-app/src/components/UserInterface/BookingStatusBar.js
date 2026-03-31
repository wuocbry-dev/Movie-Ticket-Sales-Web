import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimes, FaTicketAlt } from 'react-icons/fa';
import './BookingStatusBar.css';

const STORAGE_KEY = 'mtw:lastBookingNotice:v1';

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function hasLoggedInUser() {
  const u = localStorage.getItem('user');
  return !!(u && u !== 'undefined');
}

export default function BookingStatusBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(hasLoggedInUser);

  const [state, setState] = useState(() => {
    const raw = safeParse(localStorage.getItem(STORAGE_KEY));
    const list = Array.isArray(raw?.bookings) ? raw.bookings : raw ? [raw] : [];
    const now = Date.now();
    const valid = list
      .filter((b) => b && typeof b === 'object')
      .filter((b) => !(typeof b.showtimeEnd === 'number' && b.showtimeEnd > 0 && now > b.showtimeEnd));
    return {
      count: valid.length,
      latest: valid[0] || null,
    };
  });

  const hidden = useMemo(() => {
    const path = location.pathname || '';
    // Tránh che UI các trang quản trị / đăng nhập
    return ['/admin', '/staff', '/system-admin', '/login', '/forgot-password'].some((p) =>
      path.startsWith(p)
    );
  }, [location.pathname]);

  useEffect(() => {
    const readNotice = () => {
      const raw = safeParse(localStorage.getItem(STORAGE_KEY));
      const list = Array.isArray(raw?.bookings) ? raw.bookings : raw ? [raw] : [];
      const now = Date.now();
      const valid = list
        .filter((b) => b && typeof b === 'object')
        .filter((b) => !(typeof b.showtimeEnd === 'number' && b.showtimeEnd > 0 && now > b.showtimeEnd));

      if (valid.length === 0) {
        setState({ count: 0, latest: null });
        return;
      }

      setState({ count: valid.length, latest: valid[0] });
    };
    const onUserChanged = () => {
      const loggedIn = hasLoggedInUser();
      setIsLoggedIn(loggedIn);
      if (loggedIn) readNotice();
      else setState({ count: 0, latest: null });
    };
    const interval = setInterval(readNotice, 60000);
    window.addEventListener('mtw:lastBookingNotice', readNotice);
    window.addEventListener('userChanged', onUserChanged);
    return () => {
      clearInterval(interval);
      window.removeEventListener('mtw:lastBookingNotice', readNotice);
      window.removeEventListener('userChanged', onUserChanged);
    };
  }, []);

  const dismiss = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('mtw:lastBookingNotice'));
    setState({ count: 0, latest: null });
  };

  if (hidden || !isLoggedIn || !state.latest) return null;

  return (
    <>
      <div className="bsb" role="status" aria-live="polite">
        <div className="bsb__inner">
          <div className="bsb__left">
            <FaCheckCircle className="bsb__ico" aria-hidden="true" />
            <span className="bsb__title">Đặt vé thành công</span>
            <span className="bsb__chip" title={state.latest.bookingCode || ''}>
              <FaTicketAlt aria-hidden="true" />
              <span className="bsb__chip-code">{state.latest.bookingCode || '—'}</span>
            </span>
            {state.count > 1 ? <span className="bsb__count">+{state.count - 1} vé còn hiệu lực</span> : null}
            {typeof state.latest.total === 'number' ? (
              <span className="bsb__muted">Tổng: {state.latest.total.toLocaleString('vi-VN')} đ</span>
            ) : null}
          </div>
          <div className="bsb__actions">
            <button type="button" className="bsb__btn bsb__btn--primary" onClick={() => navigate('/bookings')}>
              Xem hết
            </button>
            <button type="button" className="bsb__btn bsb__btn--icon" onClick={dismiss} aria-label="Đóng">
              <FaTimes aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      <div className="bsb__spacer" aria-hidden="true" />
    </>
  );
}


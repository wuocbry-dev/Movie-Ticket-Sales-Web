import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTicketAlt } from 'react-icons/fa';
import './Q2KThankYouPage.css';

const Q2KThankYouPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const totalAmount = state.totalAmount;
  const seatsCount = state.seatsCount;
  const isGuest = state.isGuest;

  const formatCurrency = useMemo(
    () =>
      (amount) =>
        new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(amount || 0),
    []
  );

  return (
    <div className="q2kty">
      <div className="q2kty__card">
        <div className="q2kty__icon" aria-hidden>
          <FaCheckCircle />
        </div>

        <h1 className="q2kty__title">Cảm ơn bạn đã thanh toán!</h1>
        <p className="q2kty__sub">
          {isGuest
            ? 'Chúng tôi đã ghi nhận thanh toán của bạn. Vui lòng kiểm tra email/SĐT để nhận thông tin vé.'
            : 'Thanh toán thành công. Chúc bạn có một buổi xem phim vui vẻ :)).'}
        </p>
        <p className="q2kty__sub">AI LỚP DIU</p>

        {(typeof seatsCount === 'number' || typeof totalAmount === 'number') && (
          <div className="q2kty__summary">
            {typeof seatsCount === 'number' && (
              <div className="q2kty__summary-row">
                <span className="q2kty__summary-kpi">
                  <FaTicketAlt className="q2kty__kpi-ico" />
                  Số ghế
                </span>
                <span className="q2kty__summary-val">{seatsCount}</span>
              </div>
            )}
            {typeof totalAmount === 'number' && (
              <div className="q2kty__summary-row">
                <span className="q2kty__summary-kpi">Tổng thanh toán</span>
                <span className="q2kty__summary-val q2kty__summary-val--money">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="q2kty__actions">
          <button
            type="button"
            className="q2kty__btn q2kty__btn--home"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </button>
          <button
            type="button"
            className="q2kty__btn q2kty__btn--primary"
            onClick={() => navigate('/bookings')}
          >
            Chi tiết vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default Q2KThankYouPage;


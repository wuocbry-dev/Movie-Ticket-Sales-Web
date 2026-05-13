import React from 'react';
import './notification.css';

/**
 * InlineError — hiển thị lỗi ngay dưới input/form field.
 *
 * Dùng cho: sai mật khẩu, email invalid, field trống, lỗi API liên quan form.
 * KHÔNG dùng toast cho các lỗi này.
 *
 * @param {string} message - Nội dung lỗi. Nếu falsy → không render gì.
 * @param {string} [className] - CSS class bổ sung.
 */
const InlineError = ({ message, className = '' }) => {
  if (!message) return null;
  return (
    <p className={`q2k-inline-error ${className}`} role="alert">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
        <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="7" cy="10" r="0.75" fill="currentColor" />
      </svg>
      <span>{message}</span>
    </p>
  );
};

export default InlineError;

import React, { useEffect, useRef, useCallback } from 'react';
import './notification.css';

/**
 * ConfirmDialog — modal xác nhận thay thế window.confirm()
 *
 * Dùng cho: xóa phim, hủy vé, thao tác nguy hiểm cần xác nhận.
 *
 * @param {boolean}  isOpen       - Hiện/ẩn dialog
 * @param {string}   title        - Tiêu đề (VD: "Xác nhận xóa")
 * @param {string}   message      - Nội dung mô tả
 * @param {Function} onConfirm    - Callback khi bấm Xác nhận
 * @param {Function} onCancel     - Callback khi bấm Hủy / Escape / click ngoài
 * @param {string}   [confirmText="Xác nhận"]  - Text nút xác nhận
 * @param {string}   [cancelText="Hủy"]        - Text nút hủy
 * @param {string}   [variant="danger"]         - "danger" | "warning" | "info"
 * @param {boolean}  [loading=false]            - Disable buttons khi đang xử lý
 */
const ConfirmDialog = ({
  isOpen,
  title = 'Xác nhận',
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger',
  loading = false,
}) => {
  const confirmBtnRef = useRef(null);
  const overlayRef = useRef(null);

  // Focus confirm button when opening
  useEffect(() => {
    if (isOpen && confirmBtnRef.current) {
      confirmBtnRef.current.focus();
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, loading, onCancel]);

  // Click backdrop
  const handleBackdropClick = useCallback((e) => {
    if (e.target === overlayRef.current && !loading) onCancel?.();
  }, [loading, onCancel]);

  if (!isOpen) return null;

  const variantIcon = {
    danger: (
      <svg className="q2k-confirm__icon q2k-confirm__icon--danger" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 7v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1.2" fill="currentColor" />
      </svg>
    ),
    warning: (
      <svg className="q2k-confirm__icon q2k-confirm__icon--warning" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L1 21h22L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="1" fill="currentColor" />
      </svg>
    ),
    info: (
      <svg className="q2k-confirm__icon q2k-confirm__icon--info" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="7.5" r="1.2" fill="currentColor" />
      </svg>
    ),
  };

  return (
    <div className="q2k-confirm__overlay" ref={overlayRef} onClick={handleBackdropClick}>
      <div className="q2k-confirm__dialog" role="alertdialog" aria-modal="true" aria-labelledby="q2k-confirm-title">
        <div className="q2k-confirm__header">
          {variantIcon[variant] || variantIcon.danger}
          <h3 id="q2k-confirm-title" className="q2k-confirm__title">{title}</h3>
        </div>
        {message && <p className="q2k-confirm__message">{message}</p>}
        <div className="q2k-confirm__actions">
          <button
            type="button"
            className="q2k-confirm__btn q2k-confirm__btn--cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            ref={confirmBtnRef}
            className={`q2k-confirm__btn q2k-confirm__btn--${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

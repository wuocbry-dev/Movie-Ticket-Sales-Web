import React, { useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import { hasAnyRole, getDashboardPath } from '../../utils/roleUtils';
import { TOAST_IDS } from '../../utils/toastIds';

/**
 * ProtectedRoute component - Bảo vệ route theo role
 * Dùng toastId để chỉ hiện 1 thông báo, tránh lặp khi re-render.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const userStr = localStorage.getItem('user');
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');
  const shownRef = useRef({ login: false, forbidden: false, invalid: false });

  const clearAuthSession = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userChanged'));
  };

  if (!userStr) {
    if (!shownRef.current.login) {
      shownRef.current.login = true;
      toast.error('Vui lòng đăng nhập để tiếp tục', { toastId: TOAST_IDS.AUTH_LOGIN_REQUIRED });
    }
    return <Navigate to="/login" replace />;
  }

  // Allow route access if refresh token still exists; API layer will refresh access token on-demand.
  if (!accessToken && !refreshToken) {
    clearAuthSession();
    if (!shownRef.current.invalid) {
      shownRef.current.invalid = true;
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', {
        toastId: TOAST_IDS.AUTH_INVALID_SESSION,
      });
    }
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr || '{}');
    const userRoles = user.roles || [];

    if (allowedRoles.length === 0) {
      return children;
    }

    if (!hasAnyRole(userRoles, allowedRoles)) {
      if (!shownRef.current.forbidden) {
        shownRef.current.forbidden = true;
        toast.error('Bạn không có quyền truy cập trang này', { toastId: TOAST_IDS.AUTH_FORBIDDEN });
      }
      const dashboardPath = getDashboardPath(userRoles);
      return <Navigate to={dashboardPath} replace />;
    }

    return children;
  } catch (error) {
    console.error('Error parsing user data:', error);
    clearAuthSession();
    if (!shownRef.current.invalid) {
      shownRef.current.invalid = true;
      toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.', { toastId: TOAST_IDS.AUTH_INVALID_SESSION });
    }
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { hasAnyRole, getDashboardPath } from '../utils/roleUtils';

/**
 * ProtectedRoute component - Bảo vệ route theo role
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component con
 * @param {Array<string>} props.allowedRoles - Mảng các role được phép truy cập
 * @param {string} props.redirectTo - Đường dẫn chuyển hướng nếu không có quyền (optional)
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  // Lấy thông tin user từ localStorage
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    // Chưa đăng nhập
    toast.error('Vui lòng đăng nhập để tiếp tục');
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr || '{}');
    const userRoles = user.roles || [];

    // Nếu không có role yêu cầu, cho phép tất cả user đã đăng nhập
    if (allowedRoles.length === 0) {
      return children;
    }

    // Kiểm tra xem user có role phù hợp không
    if (!hasAnyRole(userRoles, allowedRoles)) {
      // Không có quyền truy cập
      toast.error('Bạn không có quyền truy cập trang này');
      
      // Chuyển về dashboard phù hợp với role của user
      const dashboardPath = getDashboardPath(userRoles);
      return <Navigate to={dashboardPath} replace />;
    }

    // Có quyền truy cập
    return children;
    
  } catch (error) {
    // Lỗi khi parse JSON
    console.error('Error parsing user data:', error);
    localStorage.removeItem('user');
    toast.error('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;

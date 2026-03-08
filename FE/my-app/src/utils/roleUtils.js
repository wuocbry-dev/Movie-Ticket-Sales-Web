/**
 * Utility functions for role-based routing and access control
 */

// Role constants
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  CINEMA_STAFF: 'CINEMA_STAFF',
  CINEMA_MANAGER: 'CINEMA_MANAGER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  ADMIN: 'ADMIN'
};

// Dashboard paths for each role
export const DASHBOARD_PATHS = {
  [ROLES.CUSTOMER]: '/',
  [ROLES.CINEMA_STAFF]: '/staff/dashboard',
  [ROLES.CINEMA_MANAGER]: '/admin/dashboard',
  [ROLES.SYSTEM_ADMIN]: '/admin/dashboard', // Unified with CINEMA_MANAGER
  [ROLES.ADMIN]: '/admin/dashboard'
};

/**
 * Get the appropriate dashboard path for a user based on their roles
 * Priority: SYSTEM_ADMIN > ADMIN > CINEMA_MANAGER > CINEMA_STAFF > CUSTOMER
 * @param {Array<string>} roles - Array of user roles
 * @returns {string} Dashboard path
 */
export const getDashboardPath = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return DASHBOARD_PATHS[ROLES.CUSTOMER];
  }

  // Check roles in priority order
  if (roles.includes(ROLES.SYSTEM_ADMIN)) {
    return DASHBOARD_PATHS[ROLES.SYSTEM_ADMIN];
  }
  
  if (roles.includes(ROLES.ADMIN)) {
    return DASHBOARD_PATHS[ROLES.ADMIN];
  }
  
  if (roles.includes(ROLES.CINEMA_MANAGER)) {
    return DASHBOARD_PATHS[ROLES.CINEMA_MANAGER];
  }
  
  if (roles.includes(ROLES.CINEMA_STAFF)) {
    return DASHBOARD_PATHS[ROLES.CINEMA_STAFF];
  }
  
  return DASHBOARD_PATHS[ROLES.CUSTOMER];
};

/**
 * Get the highest priority role from user's roles
 * @param {Array<string>} roles - Array of user roles
 * @returns {string} Highest priority role
 */
export const getHighestRole = (roles) => {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return ROLES.CUSTOMER;
  }

  if (roles.includes(ROLES.SYSTEM_ADMIN)) {
    return ROLES.SYSTEM_ADMIN;
  }
  
  if (roles.includes(ROLES.CINEMA_MANAGER)) {
    return ROLES.CINEMA_MANAGER;
  }
  
  if (roles.includes(ROLES.CINEMA_STAFF)) {
    return ROLES.CINEMA_STAFF;
  }
  
  return ROLES.CUSTOMER;
};

/**
 * Check if user has a specific role
 * @param {Array<string>} userRoles - Array of user roles
 * @param {string} requiredRole - Required role to check
 * @returns {boolean}
 */
export const hasRole = (userRoles, requiredRole) => {
  if (!userRoles || !Array.isArray(userRoles)) {
    return false;
  }
  return userRoles.includes(requiredRole);
};

/**
 * Check if user has any of the specified roles
 * @param {Array<string>} userRoles - Array of user roles
 * @param {Array<string>} requiredRoles - Array of required roles
 * @returns {boolean}
 */
export const hasAnyRole = (userRoles, requiredRoles) => {
  if (!userRoles || !Array.isArray(userRoles) || !requiredRoles || !Array.isArray(requiredRoles)) {
    return false;
  }
  return requiredRoles.some(role => userRoles.includes(role));
};

/**
 * Check if user is a staff member (CINEMA_STAFF, CINEMA_MANAGER, or SYSTEM_ADMIN)
 * @param {Array<string>} roles - Array of user roles
 * @returns {boolean}
 */
export const isStaffMember = (roles) => {
  return hasAnyRole(roles, [ROLES.CINEMA_STAFF, ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]);
};

/**
 * Check if user is an admin (CINEMA_MANAGER or SYSTEM_ADMIN)
 * @param {Array<string>} roles - Array of user roles
 * @returns {boolean}
 */
export const isAdmin = (roles) => {
  return hasAnyRole(roles, [ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]);
};

/**
 * Get role display name
 * @param {string} role - Role constant
 * @returns {string} Display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.CUSTOMER]: 'Khách hàng',
    [ROLES.CINEMA_STAFF]: 'Nhân viên',
    [ROLES.CINEMA_MANAGER]: 'Quản lý rạp',
    [ROLES.SYSTEM_ADMIN]: 'Quản trị hệ thống'
  };
  
  return roleNames[role] || role;
};

export default {
  ROLES,
  DASHBOARD_PATHS,
  getDashboardPath,
  getHighestRole,
  hasRole,
  hasAnyRole,
  isStaffMember,
  isAdmin,
  getRoleDisplayName
};

/**
 * Toast IDs để tránh thông báo lặp lại (chỉ hiện 1 lần cho cùng 1 sự kiện).
 * Dùng với: toast.error('msg', { toastId: TOAST_IDS.AUTH_LOGIN_REQUIRED })
 */
export const TOAST_IDS = {
  AUTH_LOGIN_REQUIRED: 'auth-login-required',
  AUTH_FORBIDDEN: 'auth-forbidden',
  AUTH_INVALID_SESSION: 'auth-invalid-session',
  AUTH_LOGIN_TO_VIEW: 'auth-login-to-view',
  AUTH_SESSION_EXPIRED: 'auth-session-expired',
  LOGOUT_SUCCESS: 'logout-success',
};

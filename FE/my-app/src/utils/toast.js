/**
 * Toast Notification System — powered by Sonner
 *
 * Features:
 * - Deduplicate: same message won't fire again within COOLDOWN_MS
 * - Compact API matching react-toastify: toast.success(), toast.error(), etc.
 * - Call from anywhere — no Provider/Context needed
 */
import { toast as sonnerToast } from 'sonner';

const COOLDOWN_MS = 2000; // 2-second cooldown for same message
const recentMessages = new Map();

/**
 * Check if a message was recently shown; if not, mark it as shown.
 * Returns true if the message should be BLOCKED (duplicate).
 */
function isDuplicate(message) {
  if (!message) return false;
  const key = typeof message === 'string' ? message : JSON.stringify(message);
  const now = Date.now();
  const lastShown = recentMessages.get(key);
  if (lastShown && now - lastShown < COOLDOWN_MS) {
    return true; // duplicate — block it
  }
  recentMessages.set(key, now);

  // Cleanup old entries every 50 entries to prevent memory leak
  if (recentMessages.size > 50) {
    const cutoff = now - COOLDOWN_MS;
    for (const [k, v] of recentMessages) {
      if (v < cutoff) recentMessages.delete(k);
    }
  }
  return false;
}

function showToast(message, options) {
  if (isDuplicate(message)) return;
  return sonnerToast(message, options);
}

function success(message, options) {
  if (isDuplicate(message)) return;
  return sonnerToast.success(message, options);
}

function error(message, options) {
  if (isDuplicate(message)) return;
  return sonnerToast.error(message, options);
}

function warning(message, options) {
  if (isDuplicate(message)) return;
  return sonnerToast.warning(message, options);
}

function info(message, options) {
  if (isDuplicate(message)) return;
  return sonnerToast.info(message, options);
}

// Build the export object with the same shape as react-toastify
const toastImpl = Object.assign(showToast, {
  success,
  error,
  info,
  warning,
  warn: warning,
  dismiss: sonnerToast.dismiss,
  // Compatibility stubs
  clearWaitingQueue: () => {},
  isActive: () => false,
  update: () => {},
  done: () => {},
});

export { toastImpl as toast };

/**
 * Toast tắt toàn hệ thống — API tương thích react-toastify, không hiển thị gì.
 */
function noop() {}

const toastImpl = Object.assign(
  function toast() {
    return noop;
  },
  {
    success: noop,
    error: noop,
    info: noop,
    warning: noop,
    warn: noop,
    dismiss: noop,
    clearWaitingQueue: noop,
    isActive: () => false,
    update: noop,
    done: noop,
  }
);

export { toastImpl as toast };

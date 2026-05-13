import { useState, useCallback } from 'react';

/**
 * Hook tiện ích để dùng ConfirmDialog dễ dàng.
 *
 * Usage:
 * const { confirmProps, showConfirm } = useConfirmDialog();
 *
 * // Trigger:
 * showConfirm({
 *   title: 'Xóa phim',
 *   message: 'Bạn có chắc muốn xóa phim này?',
 *   variant: 'danger',
 *   onConfirm: async () => { await deleteMovie(id); }
 * });
 *
 * // Render:
 * <ConfirmDialog {...confirmProps} />
 */
export function useConfirmDialog() {
  const [state, setState] = useState({
    isOpen: false,
    title: 'Xác nhận',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    variant: 'danger',
    loading: false,
    onConfirmFn: null,
  });

  const showConfirm = useCallback(({
    title = 'Xác nhận',
    message = '',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    onConfirm,
  }) => {
    setState({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      variant,
      loading: false,
      onConfirmFn: onConfirm,
    });
  }, []);

  const handleCancel = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false, loading: false }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!state.onConfirmFn) {
      setState((s) => ({ ...s, isOpen: false }));
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    try {
      await state.onConfirmFn();
    } catch (err) {
      console.error('ConfirmDialog action failed:', err);
    } finally {
      setState((s) => ({ ...s, isOpen: false, loading: false }));
    }
  }, [state.onConfirmFn]);

  const confirmProps = {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirmText: state.confirmText,
    cancelText: state.cancelText,
    variant: state.variant,
    loading: state.loading,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { confirmProps, showConfirm };
}

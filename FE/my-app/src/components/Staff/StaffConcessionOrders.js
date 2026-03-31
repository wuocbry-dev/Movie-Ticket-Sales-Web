import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import {
  FaSync,
  FaCheck,
  FaUtensils,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaFilter,
  FaEdit,
  FaSave,
  FaTimes,
  FaHamburger,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import './StaffConcessionOrders.css';
import { API_BASE_URL } from '../../config/api';

const StaffConcessionOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);
  const [staffResolved, setStaffResolved] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  useEffect(() => {
    const token = Cookies.get('accessToken');
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      navigate('/login');
      return;
    }
    if (!token || !user.userId) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const fetchStaffInfo = useCallback(async (userId) => {
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/tickets/staff/my-cinema?staffId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success !== false && (data.cinemaId || data.data?.cinemaId)) {
        const payload = data.data !== undefined ? data.data : data;
        setStaffInfo(payload);
      } else {
        setStaffInfo(null);
        toast.error(data.message || 'Bạn chưa được gán vào rạp nào');
      }
    } catch {
      setStaffInfo(null);
      toast.error('Lỗi kết nối server');
    } finally {
      setStaffResolved(true);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.userId) {
      fetchStaffInfo(currentUser.userId);
    }
  }, [currentUser, fetchStaffInfo]);

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.userId) return;

    setIsLoading(true);
    try {
      const token = Cookies.get('accessToken');
      let url = `${API_BASE_URL}/concessions/orders/staff/my-cinema?staffId=${currentUser.userId}`;
      if (statusFilter) {
        url += `&status=${encodeURIComponent(statusFilter)}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        let msg = 'Không thể tải danh sách đơn hàng';
        try {
          const err = await response.json();
          msg = err.message || msg;
        } catch {
          /* ignore */
        }
        toast.error(msg);
      }
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, statusFilter]);

  useEffect(() => {
    if (staffInfo?.cinemaId) {
      fetchOrders();
    }
  }, [staffInfo, fetchOrders]);

  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      try {
        const token = Cookies.get('accessToken');
        const statusEndpoint = {
          CONFIRMED: 'confirm',
          PREPARING: 'prepare',
          READY: 'ready',
          COMPLETED: 'complete',
          CANCELLED: 'cancel',
        };

        const endpoint = statusEndpoint[newStatus];
        if (!endpoint) {
          toast.error('Trạng thái không hợp lệ');
          return;
        }

        const response = await fetch(
          `${API_BASE_URL}/concessions/orders/${orderId}/${endpoint}?staffId=${currentUser.userId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body:
              newStatus === 'CANCELLED'
                ? JSON.stringify({ reason: 'Nhân viên hủy đơn' })
                : undefined,
          }
        );

        if (response.ok) {
          toast.success('Cập nhật trạng thái thành công!');
          fetchOrders();
        } else {
          let msg = 'Không thể cập nhật trạng thái';
          try {
            const err = await response.json();
            msg = err.message || msg;
          } catch {
            /* ignore */
          }
          toast.error(msg);
        }
      } catch {
        toast.error('Lỗi kết nối server');
      }
    },
    [currentUser, fetchOrders]
  );

  const startEditNote = useCallback((order) => {
    setEditingNoteId(order.orderId);
    setEditNoteText(order.notes || '');
  }, []);

  const cancelEditNote = useCallback(() => {
    setEditingNoteId(null);
    setEditNoteText('');
  }, []);

  const saveNote = useCallback(
    async (orderId) => {
      try {
        const token = Cookies.get('accessToken');
        const response = await fetch(
          `${API_BASE_URL}/concessions/orders/${orderId}/notes?staffId=${currentUser.userId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ notes: editNoteText }),
          }
        );

        if (response.ok) {
          toast.success('Cập nhật ghi chú thành công!');
          setEditingNoteId(null);
          setEditNoteText('');
          fetchOrders();
        } else {
          let msg = 'Không thể cập nhật ghi chú';
          try {
            const err = await response.json();
            msg = err.message || msg;
          } catch {
            /* ignore */
          }
          toast.error(msg);
        }
      } catch {
        toast.error('Lỗi kết nối server');
      }
    },
    [currentUser, editNoteText, fetchOrders]
  );

  const statusConfig = useMemo(
    () => ({
      CONFIRMED: { color: 'info', icon: FaCheck, label: 'Đã xác nhận' },
      PREPARING: { color: 'primary', icon: FaUtensils, label: 'Đang chuẩn bị' },
      READY: { color: 'success', icon: FaBoxOpen, label: 'Sẵn sàng' },
      COMPLETED: { color: 'secondary', icon: FaCheckCircle, label: 'Hoàn thành' },
      CANCELLED: { color: 'danger', icon: FaTimesCircle, label: 'Đã hủy' },
    }),
    []
  );

  const getStatusBadge = useCallback(
    (status) => {
      const config = statusConfig[status] || {
        color: 'secondary',
        icon: FaClock,
        label: status,
      };
      const Icon = config.icon;
      return (
        <span className={`stf-co__badge stf-co__badge--${config.color}`}>
          <Icon aria-hidden /> {config.label}
        </span>
      );
    },
    [statusConfig]
  );

  const getNextActions = useCallback((status) => {
    switch (status) {
      case 'CONFIRMED':
        return [
          { status: 'PREPARING', label: 'Bắt đầu chuẩn bị', color: 'primary' },
          { status: 'CANCELLED', label: 'Hủy đơn', color: 'danger' },
        ];
      case 'PREPARING':
        return [
          { status: 'READY', label: 'Sẵn sàng lấy', color: 'success' },
          { status: 'CANCELLED', label: 'Hủy đơn', color: 'danger' },
        ];
      case 'READY':
        return [
          { status: 'COMPLETED', label: 'Đã giao', color: 'secondary' },
          { status: 'CANCELLED', label: 'Hủy đơn', color: 'danger' },
        ];
      default:
        return [];
    }
  }, []);

  const formatCurrency = useCallback(
    (amount) =>
      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount),
    []
  );

  const formatTime = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  }, []);

  if (!staffResolved || !currentUser) {
    return (
      <div className="stf-co">
        <div className="stf-co__loading">
          <FaSync className="stf-co__spin" aria-hidden />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!staffInfo?.cinemaId) {
    return (
      <div className="stf-co">
        <div className="stf-co__warn" role="alert">
          <FaTimesCircle className="stf-co__warn-ico" aria-hidden />
          <h3 className="stf-co__warn-title">Chưa được gán vào rạp</h3>
          <p className="stf-co__warn-desc">Vui lòng liên hệ quản lý để được gán vào rạp làm việc.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stf-co">
      <header className="stf-co__head">
        <div className="stf-co__head-left">
          <span className="stf-co__head-ico" aria-hidden>
            <FaHamburger />
          </span>
          <div>
            <h2 className="stf-co__title">Đơn bắp nước</h2>
            <span className="stf-co__cinema">
              <FaMapMarkerAlt aria-hidden /> {staffInfo.cinemaName}
            </span>
          </div>
        </div>
        <div className="stf-co__head-actions">
          <div className="stf-co__filter">
            <FaFilter className="stf-co__filter-ico" aria-hidden />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="stf-co__select"
              aria-label="Lọc theo trạng thái"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PREPARING">Đang chuẩn bị</option>
              <option value="READY">Sẵn sàng</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
          <button
            type="button"
            className="stf-co__refresh"
            onClick={fetchOrders}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? 'stf-co__spin' : ''} aria-hidden />
            Làm mới
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="stf-co__loading">
          <FaSync className="stf-co__spin" aria-hidden />
          <p>Đang tải đơn hàng...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="stf-co__empty">
          <FaBoxOpen className="stf-co__empty-ico" aria-hidden />
          <h3>Không có đơn hàng</h3>
          <p>Chưa có đơn hàng nào {statusFilter ? 'với trạng thái này' : ''}</p>
        </div>
      ) : (
        <div className="stf-co__list-panel">
          <div className="stf-co__scroll">
            <table className="stf-co__table">
              <thead>
                <tr>
                  <th className="stf-co__th stf-co__th--order">Đơn</th>
                  <th className="stf-co__th">Khách hàng</th>
                  <th className="stf-co__th">Sản phẩm</th>
                  <th className="stf-co__th stf-co__th--num">Tổng</th>
                  <th className="stf-co__th stf-co__th--time">Thời gian</th>
                  <th className="stf-co__th">Ghi chú</th>
                  <th className="stf-co__th stf-co__th--act">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.orderId}
                    className={`stf-co__tr stf-co__tr--${(order.status || '').toLowerCase()}`}
                  >
                    <td className="stf-co__td">
                      <div className="stf-co__cell-order">
                        <span className="stf-co__oid">#{order.orderId}</span>
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="stf-co__td">
                      <div className="stf-co__cell-cust">
                        <strong>{order.userName || 'Khách'}</strong>
                        {order.userEmail && (
                          <span className="stf-co__email">{order.userEmail}</span>
                        )}
                      </div>
                    </td>
                    <td className="stf-co__td">
                      <ul className="stf-co__lines">
                        {order.items?.map((item, idx) => (
                          <li key={idx}>
                            <span className="stf-co__iname">{item.itemName}</span>
                            <span className="stf-co__iqty">×{item.quantity}</span>
                            <span className="stf-co__iprice">{formatCurrency(item.subtotal)}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="stf-co__td stf-co__td--total">
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                    </td>
                    <td className="stf-co__td stf-co__td--muted">
                      <span className="stf-co__time-inline">
                        <FaClock aria-hidden /> {formatTime(order.createdAt)}
                      </span>
                    </td>
                    <td className="stf-co__td">
                      <div className="stf-co__notes stf-co__notes--compact">
                        <div className="stf-co__notes-head">
                          {editingNoteId !== order.orderId && (
                            <button
                              type="button"
                              className="stf-co__icon-btn"
                              onClick={() => startEditNote(order)}
                              title="Chỉnh sửa ghi chú"
                              aria-label="Chỉnh sửa ghi chú"
                            >
                              <FaEdit />
                            </button>
                          )}
                        </div>
                        {editingNoteId === order.orderId ? (
                          <div className="stf-co__note-form">
                            <textarea
                              value={editNoteText}
                              onChange={(e) => setEditNoteText(e.target.value)}
                              placeholder="Nhập ghi chú..."
                              rows={3}
                            />
                            <div className="stf-co__note-actions">
                              <button
                                type="button"
                                className="stf-co__btn stf-co__btn--save"
                                onClick={() => saveNote(order.orderId)}
                              >
                                <FaSave aria-hidden /> Lưu
                              </button>
                              <button
                                type="button"
                                className="stf-co__btn stf-co__btn--muted"
                                onClick={cancelEditNote}
                              >
                                <FaTimes aria-hidden /> Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="stf-co__note-body">
                            {order.notes || (
                              <span className="stf-co__note-empty">Chưa có ghi chú</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="stf-co__td stf-co__td--actions">
                      <div className="stf-co__actions">
                        {getNextActions(order.status).map((action) => (
                          <button
                            key={action.status}
                            type="button"
                            className={`stf-co__act stf-co__act--${action.color}`}
                            onClick={() => updateOrderStatus(order.orderId, action.status)}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffConcessionOrders;

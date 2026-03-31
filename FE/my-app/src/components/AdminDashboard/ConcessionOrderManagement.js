import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaClipboardList,
  FaSync,
  FaSpinner,
  FaTimes,
  FaEye,
  FaBuilding,
  FaFilter,
  FaUser,
  FaTicketAlt,
  FaBox,
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import './ConcessionOrderManagement.css';

const ORDER_STATUSES = [
  { value: 'PENDING', label: 'Chờ xử lý', pill: 'adm-cord__pill--pending' },
  { value: 'CONFIRMED', label: 'Đã xác nhận', pill: 'adm-cord__pill--confirmed' },
  { value: 'PREPARING', label: 'Đang chuẩn bị', pill: 'adm-cord__pill--preparing' },
  { value: 'READY', label: 'Sẵn sàng lấy', pill: 'adm-cord__pill--ready' },
  { value: 'COMPLETED', label: 'Hoàn thành', pill: 'adm-cord__pill--completed' },
  { value: 'CANCELLED', label: 'Đã hủy', pill: 'adm-cord__pill--cancelled' },
];

const ConcessionOrderManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const [orders, setOrders] = useState([]);
  const [myCinemas, setMyCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [listTick, setListTick] = useState(0);

  const bumpList = useCallback(() => setListTick((t) => t + 1), []);

  const authHeaders = useMemo(
    () => ({
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const fetchMyCinemas = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/my-cinemas`, {
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể tải danh sách rạp');
      const data = await response.json();
      if (data.success && data.data) {
        const cinemaList = data.data.data || [];
        const activeCinemas = cinemaList.filter((c) => c.isActive === true);
        setMyCinemas(activeCinemas);
        if (activeCinemas.length > 0) {
          setSelectedCinema((prev) => prev || String(activeCinemas[0].cinemaId));
        }
      }
    } catch {
      toast.error('Không thể tải danh sách rạp');
    }
  }, [token, navigate, API_BASE_URL, authHeaders]);

  const fetchOrders = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!selectedCinema) return;
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/concessions/orders/cinema/${selectedCinema}`;
      if (filterStatus) url += `?status=${encodeURIComponent(filterStatus)}`;
      const response = await fetch(url, { headers: authHeaders });
      if (!response.ok) throw new Error('Không thể tải đơn hàng');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách đơn hàng');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, selectedCinema, filterStatus, API_BASE_URL, authHeaders]);

  useEffect(() => {
    fetchMyCinemas();
  }, [fetchMyCinemas]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, listTick]);

  useEffect(() => {
    if (!showDetailModal || !selectedOrder?.orderId) return;
    const fresh = orders.find((o) => o.orderId === selectedOrder.orderId);
    if (fresh) setSelectedOrder(fresh);
  }, [orders, showDetailModal, selectedOrder?.orderId]);

  const closeModal = useCallback(() => setShowDetailModal(false), []);

  useEffect(() => {
    if (!showDetailModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showDetailModal, closeModal]);

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const currentToken = Cookies.get('accessToken');
    if (!currentToken) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật trạng thái');
      }
      toast.success('Cập nhật trạng thái thành công');
      bumpList();
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleQuickAction = async (orderId, action) => {
    const currentToken = Cookies.get('accessToken');
    if (!currentToken) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/orders/${orderId}/${action}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        navigate('/login');
        return;
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật');
      }
      toast.success('Cập nhật thành công');
      bumpList();
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusInfo = (status) =>
    ORDER_STATUSES.find((s) => s.value === status) || {
      label: status,
      pill: 'adm-cord__pill--muted',
    };

  const getNextActions = (status) => {
    switch (status) {
      case 'PENDING':
        return [{ action: 'confirm', label: 'Xác nhận', btn: 'adm-cord__act--blue' }];
      case 'CONFIRMED':
        return [{ action: 'prepare', label: 'Bắt đầu chuẩn bị', btn: 'adm-cord__act--purple' }];
      case 'PREPARING':
        return [{ action: 'ready', label: 'Sẵn sàng lấy', btn: 'adm-cord__act--green' }];
      case 'READY':
        return [{ action: 'complete', label: 'Hoàn thành', btn: 'adm-cord__act--gray' }];
      default:
        return [];
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;

  return (
    <div className="adm-cord" role="main" aria-label="Đơn hàng bắp nước">
      <div className="adm-cord__hero">
        <div className="adm-cord__titles">
          <h1 className="adm-cord__title">
            <FaClipboardList /> Đơn hàng bắp nước
          </h1>
          <p className="adm-cord__sub">Theo dõi và xử lý đơn theo rạp</p>
        </div>
        <button type="button" className="adm-cord__btn adm-cord__btn--refresh" onClick={() => bumpList()}>
          <FaSync /> Làm mới
        </button>
      </div>

      <div className="adm-cord__select-bar">
        <FaBuilding className="adm-cord__select-ico" aria-hidden />
        <label htmlFor="adm-cord-cinema" className="adm-cord__select-label">
          Chọn rạp
        </label>
        <select
          id="adm-cord-cinema"
          className="adm-cord__select"
          value={selectedCinema}
          onChange={(e) => setSelectedCinema(e.target.value)}
        >
          <option value="">— Chọn rạp —</option>
          {myCinemas.map((cinema) => (
            <option key={cinema.cinemaId} value={cinema.cinemaId}>
              {cinema.cinemaName}
            </option>
          ))}
        </select>
      </div>

      {selectedCinema && (
        <div className="adm-cord__stats">
          <div className="adm-cord__stat adm-cord__stat--orange">
            <span className="adm-cord__stat-num">{pendingCount}</span>
            <span className="adm-cord__stat-lbl">Chờ xử lý</span>
          </div>
          <div className="adm-cord__stat adm-cord__stat--purple">
            <span className="adm-cord__stat-num">{preparingCount}</span>
            <span className="adm-cord__stat-lbl">Đang chuẩn bị</span>
          </div>
          <div className="adm-cord__stat adm-cord__stat--green">
            <span className="adm-cord__stat-num">{readyCount}</span>
            <span className="adm-cord__stat-lbl">Sẵn sàng lấy</span>
          </div>
          <div className="adm-cord__filter">
            <FaFilter className="adm-cord__filter-ico" aria-hidden />
            <select
              className="adm-cord__filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="adm-cord__state">
          <FaSpinner className="adm-cord__spin" />
          <p className="adm-cord__muted">Đang tải dữ liệu...</p>
        </div>
      ) : !selectedCinema ? (
        <div className="adm-cord__empty">
          <FaBuilding className="adm-cord__empty-ico" />
          <h3>Chọn rạp</h3>
          <p className="adm-cord__muted">Chọn rạp để xem đơn hàng.</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="adm-cord__empty">
          <FaClipboardList className="adm-cord__empty-ico" />
          <h3>Chưa có đơn</h3>
          <p className="adm-cord__muted">
            {filterStatus ? 'Không có đơn với trạng thái này.' : 'Chưa có đơn bắp nước.'}
          </p>
        </div>
      ) : (
        <div className="adm-cord__grid">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const nextActions = getNextActions(order.status);
            return (
              <div key={order.orderId} className="adm-cord__card">
                <div className="adm-cord__card-head">
                  <div className="adm-cord__card-head-l">
                    <span className="adm-cord__ord-no">#{order.orderNumber}</span>
                    <span className={`adm-cord__pill ${statusInfo.pill}`}>{statusInfo.label}</span>
                  </div>
                  <span className="adm-cord__time">{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="adm-cord__card-body">
                  <div className="adm-cord__row">
                    <span className="adm-cord__lbl">
                      <FaUser /> Khách
                    </span>
                    <span>{order.userName || 'Khách vãng lai'}</span>
                  </div>
                  {order.bookingId && (
                    <div className="adm-cord__row">
                      <span className="adm-cord__lbl">
                        <FaTicketAlt /> Mã vé
                      </span>
                      <span>#{order.bookingId}</span>
                    </div>
                  )}
                  <div className="adm-cord__row">
                    <span className="adm-cord__lbl">
                      <FaBox /> Số món
                    </span>
                    <span>{order.totalItems || order.items?.length || 0}</span>
                  </div>
                  <div className="adm-cord__total">
                    <span>Tổng</span>
                    <span className="adm-cord__amt">{formatCurrency(order.totalAmount || 0)}</span>
                  </div>
                </div>
                <div className="adm-cord__card-actions">
                  <button
                    type="button"
                    className="adm-cord__btn adm-cord__btn--view"
                    onClick={() => handleViewDetail(order)}
                  >
                    <FaEye /> Chi tiết
                  </button>
                  {nextActions.map((a) => (
                    <button
                      key={a.action}
                      type="button"
                      className={`adm-cord__btn adm-cord__act ${a.btn}`}
                      onClick={() => handleQuickAction(order.orderId, a.action)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDetailModal && selectedOrder && (
        <div className="adm-cord__modal" role="presentation">
          <div
            className="adm-cord__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-cord-modal-title"
          >
            <div className="adm-cord__panel-head">
              <h2 id="adm-cord-modal-title">Đơn #{selectedOrder.orderNumber}</h2>
              <button type="button" className="adm-cord__panel-x" onClick={closeModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <div className="adm-cord__panel-body">
              <div className="adm-cord__sec">
                <h3 className="adm-cord__sec-title">Thông tin đơn</h3>
                <div className="adm-cord__detail-grid">
                  <div className="adm-cord__detail-item">
                    <span className="adm-cord__d-lbl">Trạng thái</span>
                    <span className={`adm-cord__pill ${getStatusInfo(selectedOrder.status).pill}`}>
                      {getStatusInfo(selectedOrder.status).label}
                    </span>
                  </div>
                  <div className="adm-cord__detail-item">
                    <span className="adm-cord__d-lbl">Thời gian</span>
                    <span>{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                  <div className="adm-cord__detail-item">
                    <span className="adm-cord__d-lbl">Khách</span>
                    <span>{selectedOrder.userName || 'Khách vãng lai'}</span>
                  </div>
                  {selectedOrder.userEmail && (
                    <div className="adm-cord__detail-item">
                      <span className="adm-cord__d-lbl">Email</span>
                      <span>{selectedOrder.userEmail}</span>
                    </div>
                  )}
                  {selectedOrder.bookingId && (
                    <div className="adm-cord__detail-item">
                      <span className="adm-cord__d-lbl">Đặt vé</span>
                      <span>#{selectedOrder.bookingId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="adm-cord__sec">
                <h3 className="adm-cord__sec-title">Sản phẩm</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <div className="adm-cord__table-wrap">
                    <table className="adm-cord__items-table">
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Đơn giá</th>
                          <th>SL</th>
                          <th>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.itemName}</td>
                            <td>{formatCurrency(item.unitPrice)}</td>
                            <td>{item.quantity}</td>
                            <td>{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} className="adm-cord__tf-lbl">
                            Tổng cộng
                          </td>
                          <td className="adm-cord__tf-amt">{formatCurrency(selectedOrder.totalAmount)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p className="adm-cord__muted">Không có chi tiết sản phẩm.</p>
                )}
              </div>

              <div className="adm-cord__sec">
                <h3 className="adm-cord__sec-title">Cập nhật trạng thái</h3>
                <div className="adm-cord__status-btns">
                  {ORDER_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      className={`adm-cord__st-btn ${status.pill} ${
                        selectedOrder.status === status.value ? 'adm-cord__st-btn--active' : ''
                      }`}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId, status.value)}
                      disabled={selectedOrder.status === status.value}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="adm-cord__sec">
                  <h3 className="adm-cord__sec-title">Ghi chú</h3>
                  <p className="adm-cord__notes">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
            <div className="adm-cord__footer">
              <button type="button" className="adm-cord__btn adm-cord__btn--ghost" onClick={closeModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcessionOrderManagement;

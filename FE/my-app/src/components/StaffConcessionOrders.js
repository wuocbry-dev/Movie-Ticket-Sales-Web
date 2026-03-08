import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { 
  FaSearch, 
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
  FaTimes
} from 'react-icons/fa';
import './StaffConcessionOrders.css';

const API_BASE_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

const StaffConcessionOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [staffInfo, setStaffInfo] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    if (user.userId) {
      fetchStaffInfo(user.userId);
    }
  }, []);

  useEffect(() => {
    if (staffInfo?.cinemaId) {
      fetchOrders();
    }
  }, [staffInfo, statusFilter]);

  const fetchStaffInfo = async (userId) => {
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/api/tickets/staff/my-cinema?staffId=${userId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStaffInfo(data);
        } else {
          toast.error(data.message || 'Bạn chưa được gán vào rạp nào');
        }
      }
    } catch (error) {
      console.error('Error fetching staff info:', error);
      toast.error('Lỗi kết nối server');
    }
  };

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.userId) return;
    
    setIsLoading(true);
    try {
      const token = Cookies.get('accessToken');
      let url = `${API_BASE_URL}/api/concessions/orders/staff/my-cinema?staffId=${currentUser.userId}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, statusFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = Cookies.get('accessToken');
      const statusEndpoint = {
        'CONFIRMED': 'confirm',
        'PREPARING': 'prepare',
        'READY': 'ready',
        'COMPLETED': 'complete',
        'CANCELLED': 'cancel'
      };
      
      const endpoint = statusEndpoint[newStatus];
      if (!endpoint) {
        toast.error('Trạng thái không hợp lệ');
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/concessions/orders/${orderId}/${endpoint}?staffId=${currentUser.userId}`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: newStatus === 'CANCELLED' ? JSON.stringify({ reason: 'Nhân viên hủy đơn' }) : undefined
        }
      );
      
      if (response.ok) {
        toast.success(`Cập nhật trạng thái thành công!`);
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Lỗi kết nối server');
    }
  };

  const startEditNote = (order) => {
    setEditingNoteId(order.orderId);
    setEditNoteText(order.notes || '');
  };

  const cancelEditNote = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const saveNote = async (orderId) => {
    try {
      const token = Cookies.get('accessToken');
      const response = await fetch(
        `${API_BASE_URL}/api/concessions/orders/${orderId}/notes?staffId=${currentUser.userId}`,
        {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ notes: editNoteText })
        }
      );
      
      if (response.ok) {
        toast.success('Cập nhật ghi chú thành công!');
        setEditingNoteId(null);
        setEditNoteText('');
        fetchOrders();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Không thể cập nhật ghi chú');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Lỗi kết nối server');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'CONFIRMED': { color: 'info', icon: FaCheck, label: 'Đã xác nhận' },
      'PREPARING': { color: 'primary', icon: FaUtensils, label: 'Đang chuẩn bị' },
      'READY': { color: 'success', icon: FaBoxOpen, label: 'Sẵn sàng' },
      'COMPLETED': { color: 'secondary', icon: FaCheckCircle, label: 'Hoàn thành' },
      'CANCELLED': { color: 'danger', icon: FaTimesCircle, label: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || { color: 'secondary', icon: FaClock, label: status };
    const Icon = config.icon;
    
    return (
      <span className={`status-badge status-${config.color}`}>
        <Icon /> {config.label}
      </span>
    );
  };

  // Staff chỉ được cập nhật từ CONFIRMED -> PREPARING -> READY -> COMPLETED
  // Có thể hủy (CANCELLED) ở bất kỳ trạng thái nào trừ COMPLETED
  const getNextActions = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return [
          { status: 'PREPARING', label: 'Bắt đầu chuẩn bị', color: 'primary' },
          { status: 'CANCELLED', label: 'Hủy đơn', color: 'danger' }
        ];
      case 'PREPARING':
        return [
          { status: 'READY', label: 'Sẵn sàng lấy', color: 'success' },
          { status: 'CANCELLED', label: 'Hủy đơn', color: 'danger' }
        ];
      case 'READY':
        return [
          { status: 'COMPLETED', label: 'Đã giao', color: 'secondary' },
          { status: 'CANCELLED', label: 'Hủy đơn', color: 'danger' }
        ];
      default:
        return [];
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  if (!staffInfo) {
    return (
      <div className="staff-orders-container">
        <div className="no-cinema-warning">
          <FaTimesCircle className="warning-icon" />
          <h3>Chưa được gán vào rạp</h3>
          <p>Vui lòng liên hệ quản lý để được gán vào rạp làm việc.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-orders-container">
      <div className="orders-header">
        <div className="header-left">
          <h2>Đơn Bắp Nước</h2>
          <span className="cinema-badge">{staffInfo.cinemaName}</span>
        </div>
        <div className="header-actions">
          <div className="filter-group">
            <FaFilter />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
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
            className="btn-refresh" 
            onClick={fetchOrders}
            disabled={isLoading}
          >
            <FaSync className={isLoading ? 'spinning' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-spinner">
          <FaSync className="spinning" />
          <p>Đang tải...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <FaBoxOpen className="empty-icon" />
          <h3>Không có đơn hàng</h3>
          <p>Chưa có đơn hàng nào {statusFilter ? 'với trạng thái này' : ''}</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.orderId} className={`order-card status-${order.status?.toLowerCase()}`}>
              <div className="order-header">
                <span className="order-number">#{order.orderId}</span>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="order-customer">
                <strong>{order.userName || 'Khách'}</strong>
                {order.userEmail && <span className="customer-email">{order.userEmail}</span>}
              </div>
              
              <div className="order-items">
                <h4>Sản phẩm:</h4>
                <ul>
                  {order.items?.map((item, idx) => (
                    <li key={idx}>
                      <span className="item-name">{item.itemName}</span>
                      <span className="item-qty">x{item.quantity}</span>
                      <span className="item-price">{formatCurrency(item.subtotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="order-total">
                <span>Tổng cộng:</span>
                <strong>{formatCurrency(order.totalAmount)}</strong>
              </div>
              
              <div className="order-time">
                <FaClock /> {formatTime(order.createdAt)}
              </div>
              
              <div className="order-notes-section">
                <div className="notes-header">
                  <strong>Ghi chú:</strong>
                  {editingNoteId !== order.orderId && (
                    <button 
                      className="btn-edit-note" 
                      onClick={() => startEditNote(order)}
                      title="Chỉnh sửa ghi chú"
                    >
                      <FaEdit />
                    </button>
                  )}
                </div>
                {editingNoteId === order.orderId ? (
                  <div className="edit-note-form">
                    <textarea
                      value={editNoteText}
                      onChange={(e) => setEditNoteText(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      rows={3}
                    />
                    <div className="edit-note-actions">
                      <button 
                        className="btn-save-note" 
                        onClick={() => saveNote(order.orderId)}
                      >
                        <FaSave /> Lưu
                      </button>
                      <button 
                        className="btn-cancel-note" 
                        onClick={cancelEditNote}
                      >
                        <FaTimes /> Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="notes-content">
                    {order.notes || <span className="no-note">Chưa có ghi chú</span>}
                  </div>
                )}
              </div>
              
              <div className="order-actions">
                {getNextActions(order.status).map(action => (
                  <button
                    key={action.status}
                    className={`btn-action btn-${action.color}`}
                    onClick={() => updateOrderStatus(order.orderId, action.status)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffConcessionOrders;

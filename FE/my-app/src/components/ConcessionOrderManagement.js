import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './ConcessionOrderManagement.css';

const ConcessionOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [myCinemas, setMyCinemas] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const ORDER_STATUSES = [
    { value: 'PENDING', label: 'Chờ xử lý', color: '#ff9800', icon: '⏳' },
    { value: 'CONFIRMED', label: 'Đã xác nhận', color: '#2196F3', icon: '✅' },
    { value: 'PREPARING', label: 'Đang chuẩn bị', color: '#9c27b0', icon: '🍿' },
    { value: 'READY', label: 'Sẵn sàng lấy', color: '#4CAF50', icon: '📦' },
    { value: 'COMPLETED', label: 'Hoàn thành', color: '#607d8b', icon: '✔️' },
    { value: 'CANCELLED', label: 'Đã hủy', color: '#f44336', icon: '❌' }
  ];

  useEffect(() => {
    checkUserRole();
    fetchMyCinemas();
  }, []);

  useEffect(() => {
    if (selectedCinema) {
      fetchOrders();
    }
  }, [selectedCinema, filterStatus]);

  const checkUserRole = () => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setIsAdmin(userData.roles?.includes('SYSTEM_ADMIN') || userData.roles?.includes('CHAIN_ADMIN'));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  };

  const fetchMyCinemas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/my-cinemas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải danh sách rạp');

      const data = await response.json();
      if (data.success && data.data) {
        const cinemaList = data.data.data || [];
        // Chỉ lấy các rạp có isActive = true
        const activeCinemas = cinemaList.filter(cinema => cinema.isActive === true);
        setMyCinemas(activeCinemas);
        if (activeCinemas.length > 0) {
          setSelectedCinema(activeCinemas[0].cinemaId.toString());
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách rạp');
    }
  };

  const fetchOrders = async () => {
    if (!selectedCinema) return;
    
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/concessions/orders/cinema/${selectedCinema}`;
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải đơn hàng');

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const currentToken = Cookies.get('accessToken');
    
    if (!currentToken) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật trạng thái');
      }

      toast.success('Cập nhật trạng thái thành công');
      fetchOrders();
      if (selectedOrder && selectedOrder.orderId === orderId) {
        const updatedOrder = await response.json();
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleQuickAction = async (orderId, action) => {
    const currentToken = Cookies.get('accessToken');
    
    if (!currentToken) {
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/orders/${orderId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Không thể cập nhật');
      }

      toast.success('Cập nhật thành công');
      fetchOrders();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Không thể cập nhật');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusInfo = (status) => {
    return ORDER_STATUSES.find(s => s.value === status) || { label: status, color: '#999', icon: '❓' };
  };

  const getNextActions = (status) => {
    switch (status) {
      case 'PENDING':
        return [{ action: 'confirm', label: 'Xác nhận', color: '#2196F3' }];
      case 'CONFIRMED':
        return [{ action: 'prepare', label: 'Bắt đầu chuẩn bị', color: '#9c27b0' }];
      case 'PREPARING':
        return [{ action: 'ready', label: 'Sẵn sàng lấy', color: '#4CAF50' }];
      case 'READY':
        return [{ action: 'complete', label: 'Hoàn thành', color: '#607d8b' }];
      default:
        return [];
    }
  };

  const pendingCount = orders.filter(o => o.status === 'PENDING').length;
  const preparingCount = orders.filter(o => o.status === 'PREPARING').length;
  const readyCount = orders.filter(o => o.status === 'READY').length;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Quản Lý Đơn Hàng Bắp Nước</h1>
          <p style={styles.subtitle}>Theo dõi và xử lý đơn hàng bắp nước tại rạp</p>
        </div>
        <button style={styles.refreshButton} onClick={fetchOrders}>
          🔄 Làm mới
        </button>
      </div>

      {/* Cinema Selector */}
      <div style={styles.cinemaSelector}>
        <label style={styles.label}>🏢 Chọn rạp:</label>
        <select 
          value={selectedCinema} 
          onChange={(e) => setSelectedCinema(e.target.value)}
          style={styles.select}
        >
          <option value="">-- Chọn rạp --</option>
          {myCinemas.map(cinema => (
            <option key={cinema.cinemaId} value={cinema.cinemaId}>
              {cinema.cinemaName}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {selectedCinema && (
        <div style={styles.statsContainer}>
          <div style={{...styles.statCard, backgroundColor: '#fff3e0'}}>
            <span style={{...styles.statNumber, color: '#e65100'}}>{pendingCount}</span>
            <span style={styles.statLabel}>⏳ Chờ xử lý</span>
          </div>
          <div style={{...styles.statCard, backgroundColor: '#f3e5f5'}}>
            <span style={{...styles.statNumber, color: '#7b1fa2'}}>{preparingCount}</span>
            <span style={styles.statLabel}>🍿 Đang chuẩn bị</span>
          </div>
          <div style={{...styles.statCard, backgroundColor: '#e8f5e9'}}>
            <span style={{...styles.statNumber, color: '#2e7d32'}}>{readyCount}</span>
            <span style={styles.statLabel}>📦 Sẵn sàng lấy</span>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>🔍 Lọc theo trạng thái:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Tất cả</option>
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.icon} {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : !selectedCinema ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🏢</div>
          <h3>Vui lòng chọn rạp</h3>
          <p>Chọn rạp từ danh sách để xem đơn hàng</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📋</div>
          <h3>Chưa có đơn hàng nào</h3>
          <p>{filterStatus ? 'Không có đơn hàng với trạng thái này' : 'Chưa có đơn hàng bắp nước'}</p>
        </div>
      ) : (
        <div style={styles.ordersGrid}>
          {orders.map(order => {
            const statusInfo = getStatusInfo(order.status);
            const nextActions = getNextActions(order.status);
            
            return (
              <div key={order.orderId} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <span style={styles.orderNumber}>#{order.orderNumber}</span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: statusInfo.color
                    }}>
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                  <span style={styles.orderTime}>{formatDateTime(order.createdAt)}</span>
                </div>

                <div style={styles.orderBody}>
                  <div style={styles.orderInfo}>
                    <span style={styles.infoLabel}>👤 Khách hàng:</span>
                    <span style={styles.infoValue}>{order.userName || 'Khách vãng lai'}</span>
                  </div>
                  {order.bookingId && (
                    <div style={styles.orderInfo}>
                      <span style={styles.infoLabel}>🎟️ Mã vé:</span>
                      <span style={styles.infoValue}>#{order.bookingId}</span>
                    </div>
                  )}
                  <div style={styles.orderInfo}>
                    <span style={styles.infoLabel}>📦 Số món:</span>
                    <span style={styles.infoValue}>{order.totalItems || order.items?.length || 0} sản phẩm</span>
                  </div>
                  <div style={styles.orderTotal}>
                    <span>💰 Tổng tiền:</span>
                    <span style={styles.totalAmount}>{formatCurrency(order.totalAmount || 0)}</span>
                  </div>
                </div>

                <div style={styles.orderActions}>
                  <button 
                    style={styles.viewButton}
                    onClick={() => handleViewDetail(order)}
                  >
                    👁️ Chi tiết
                  </button>
                  {nextActions.map(action => (
                    <button
                      key={action.action}
                      style={{...styles.actionButton, backgroundColor: action.color}}
                      onClick={() => handleQuickAction(order.orderId, action.action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                📋 Chi tiết đơn hàng #{selectedOrder.orderNumber}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowDetailModal(false)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              {/* Order Info */}
              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>📌 Thông tin đơn hàng</h3>
                <div style={styles.detailGrid}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Trạng thái:</span>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: getStatusInfo(selectedOrder.status).color
                    }}>
                      {getStatusInfo(selectedOrder.status).icon} {getStatusInfo(selectedOrder.status).label}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Thời gian tạo:</span>
                    <span>{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Khách hàng:</span>
                    <span>{selectedOrder.userName || 'Khách vãng lai'}</span>
                  </div>
                  {selectedOrder.userEmail && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Email:</span>
                      <span>{selectedOrder.userEmail}</span>
                    </div>
                  )}
                  {selectedOrder.bookingId && (
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Mã đặt vé:</span>
                      <span>#{selectedOrder.bookingId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>🍿 Sản phẩm</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  <table style={styles.itemsTable}>
                    <thead>
                      <tr>
                        <th style={styles.itemTh}>Sản phẩm</th>
                        <th style={styles.itemTh}>Đơn giá</th>
                        <th style={styles.itemTh}>SL</th>
                        <th style={styles.itemTh}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td style={styles.itemTd}>{item.itemName}</td>
                          <td style={styles.itemTd}>{formatCurrency(item.unitPrice)}</td>
                          <td style={styles.itemTd}>{item.quantity}</td>
                          <td style={styles.itemTd}>{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="3" style={{...styles.itemTd, fontWeight: '700', textAlign: 'right'}}>
                          Tổng cộng:
                        </td>
                        <td style={{...styles.itemTd, fontWeight: '700', color: '#e53935'}}>
                          {formatCurrency(selectedOrder.totalAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p>Không có thông tin sản phẩm</p>
                )}
              </div>

              {/* Status Update */}
              <div style={styles.detailSection}>
                <h3 style={styles.sectionTitle}>🔄 Cập nhật trạng thái</h3>
                <div style={styles.statusButtons}>
                  {ORDER_STATUSES.map(status => (
                    <button
                      key={status.value}
                      style={{
                        ...styles.statusUpdateButton,
                        backgroundColor: selectedOrder.status === status.value ? status.color : '#f0f0f0',
                        color: selectedOrder.status === status.value ? 'white' : '#333',
                        opacity: selectedOrder.status === status.value ? 1 : 0.8
                      }}
                      onClick={() => handleUpdateStatus(selectedOrder.orderId, status.value)}
                      disabled={selectedOrder.status === status.value}
                    >
                      {status.icon} {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div style={styles.detailSection}>
                  <h3 style={styles.sectionTitle}>📝 Ghi chú</h3>
                  <p style={styles.notes}>{selectedOrder.notes}</p>
                </div>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowDetailModal(false)} style={styles.cancelButton}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#f0f2f5',
    minHeight: '100vh',
    fontFamily: 'Arial, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  },
  refreshButton: {
    padding: '12px 24px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  cinemaSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    padding: '20px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  select: {
    flex: '1',
    maxWidth: '400px',
    padding: '10px 14px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px'
  },
  statsContainer: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  statCard: {
    padding: '16px 24px',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '120px'
  },
  statNumber: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '700'
  },
  statLabel: {
    fontSize: '12px',
    color: '#666'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginLeft: 'auto',
    padding: '12px 16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #4CAF50',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 32px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  ordersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  orderHeader: {
    padding: '16px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  orderNumber: {
    fontWeight: '700',
    fontSize: '16px',
    color: '#1a1a1a',
    marginRight: '12px'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: 'white'
  },
  orderTime: {
    fontSize: '12px',
    color: '#666'
  },
  orderBody: {
    padding: '16px'
  },
  orderInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
    fontSize: '14px'
  },
  infoLabel: {
    color: '#666'
  },
  infoValue: {
    fontWeight: '500',
    color: '#333'
  },
  orderTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px dashed #e9ecef',
    fontSize: '14px',
    fontWeight: '600'
  },
  totalAmount: {
    color: '#e53935',
    fontSize: '18px'
  },
  orderActions: {
    padding: '12px 16px',
    backgroundColor: '#fafafa',
    borderTop: '1px solid #f0f0f0',
    display: 'flex',
    gap: '8px'
  },
  viewButton: {
    flex: '1',
    padding: '10px',
    backgroundColor: '#607d8b',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  actionButton: {
    flex: '1',
    padding: '10px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    margin: '0',
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666'
  },
  modalBody: {
    padding: '24px'
  },
  detailSection: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e9ecef'
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detailLabel: {
    fontSize: '12px',
    color: '#666'
  },
  itemsTable: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  itemTh: {
    padding: '10px 12px',
    textAlign: 'left',
    backgroundColor: '#f8f9fa',
    fontSize: '13px',
    fontWeight: '600',
    color: '#495057',
    borderBottom: '1px solid #e9ecef'
  },
  itemTd: {
    padding: '10px 12px',
    fontSize: '14px',
    borderBottom: '1px solid #f0f0f0'
  },
  statusButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  statusUpdateButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  notes: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#333',
    lineHeight: '1.5'
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    justifyContent: 'flex-end',
    backgroundColor: '#f8f9fa'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default ConcessionOrderManagement;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';

const CinemaConcessionManagement = () => {
  const [cinemaItems, setCinemaItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [myCinemas, setMyCinemas] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [addFormData, setAddFormData] = useState({
    itemId: '',
    customPrice: '',
    stockQuantity: 100
  });
  const [editFormData, setEditFormData] = useState({
    customPrice: '',
    stockQuantity: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    fetchMyCinemas();
    fetchCategories();
    fetchAllItems();
  }, []);

  useEffect(() => {
    if (selectedCinema) {
      fetchCinemaItems();
    }
  }, [selectedCinema]);

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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải danh mục');

      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAllItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải sản phẩm');

      const data = await response.json();
      setAllItems(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchCinemaItems = async () => {
    if (!selectedCinema) return;
    
    setLoading(true);
    try {
      // Sử dụng endpoint /all để lấy tất cả items kể cả bị khóa
      const response = await fetch(`${API_BASE_URL}/cinemas/${selectedCinema}/concessions/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải sản phẩm của rạp');

      const data = await response.json();
      setCinemaItems(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách sản phẩm của rạp');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setAddFormData({
      itemId: '',
      customPrice: '',
      stockQuantity: 100
    });
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditFormData({
      customPrice: item.cinemaPrice || item.effectivePrice || item.defaultPrice || item.basePrice || '',
      stockQuantity: item.stockQuantity || 0
    });
    setShowEditModal(true);
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi rạp?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể xóa sản phẩm');

      toast.success('Xóa sản phẩm khỏi rạp thành công');
      fetchCinemaItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${itemId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể cập nhật trạng thái');

      toast.success('Cập nhật trạng thái thành công');
      fetchCinemaItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemId: parseInt(addFormData.itemId),
          customPrice: addFormData.customPrice ? parseFloat(addFormData.customPrice) : null,
          stockQuantity: parseInt(addFormData.stockQuantity)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      toast.success('Thêm sản phẩm vào rạp thành công');
      setShowAddModal(false);
      fetchCinemaItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePrice = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${selectedItem.itemId}/price`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newPrice: parseFloat(editFormData.customPrice)
        })
      });

      if (!response.ok) throw new Error('Không thể cập nhật giá');

      toast.success('Cập nhật giá thành công');
      setShowEditModal(false);
      fetchCinemaItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể cập nhật giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${selectedItem.itemId}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stockQuantity: parseInt(editFormData.stockQuantity)
        })
      });

      if (!response.ok) throw new Error('Không thể cập nhật tồn kho');

      toast.success('Cập nhật tồn kho thành công');
      setShowEditModal(false);
      fetchCinemaItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể cập nhật tồn kho');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncItems = async () => {
    if (!window.confirm('Đồng bộ tất cả sản phẩm vào rạp này?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/cinemas/${selectedCinema}/concessions/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể đồng bộ');

      toast.success('Đồng bộ sản phẩm thành công');
      fetchCinemaItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể đồng bộ sản phẩm');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getAvailableItemsToAdd = () => {
    const existingItemIds = cinemaItems.map(ci => ci.itemId);
    return allItems.filter(item => !existingItemIds.includes(item.id));
  };

  const filteredItems = cinemaItems.filter(item => {
    return !filterCategory || item.categoryId === parseInt(filterCategory);
  });

  const lowStockItems = cinemaItems.filter(item => item.stockQuantity < 20);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🎬 Quản Lý Bắp Nước Tại Rạp</h1>
          <p style={styles.subtitle}>Quản lý sản phẩm, giá và tồn kho tại rạp của bạn</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.syncButton} onClick={handleSyncItems}>
            🔄 Đồng bộ sản phẩm
          </button>
          <button style={styles.createButton} onClick={handleAddItem}>
            + Thêm Sản Phẩm
          </button>
        </div>
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

      {/* Stats & Filters */}
      {selectedCinema && (
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <span style={styles.statNumber}>{cinemaItems.length}</span>
            <span style={styles.statLabel}>Tổng sản phẩm</span>
          </div>
          <div style={{...styles.statCard, backgroundColor: lowStockItems.length > 0 ? '#fff3e0' : '#e8f5e9'}}>
            <span style={{...styles.statNumber, color: lowStockItems.length > 0 ? '#e65100' : '#2e7d32'}}>
              {lowStockItems.length}
            </span>
            <span style={styles.statLabel}>Sắp hết hàng</span>
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>📁 Lọc danh mục:</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="">Tất cả</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && (
        <div style={styles.warningBanner}>
          ⚠️ Có {lowStockItems.length} sản phẩm sắp hết hàng (dưới 20): 
          {lowStockItems.slice(0, 3).map(item => item.itemName).join(', ')}
          {lowStockItems.length > 3 && ` và ${lowStockItems.length - 3} sản phẩm khác...`}
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
          <p>Chọn rạp từ danh sách để quản lý sản phẩm</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🍿</div>
          <h3>Chưa có sản phẩm nào</h3>
          <p>Nhấn "Thêm Sản Phẩm" hoặc "Đồng bộ" để thêm sản phẩm vào rạp</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Sản phẩm</th>
                <th style={styles.th}>Danh mục</th>
                <th style={styles.th}>Giá gốc</th>
                <th style={styles.th}>Giá bán</th>
                <th style={styles.th}>Tồn kho</th>
                <th style={styles.th}>Trạng thái</th>
                <th style={styles.th}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.itemId} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={styles.itemInfo}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.itemName} style={styles.itemImage} />
                      ) : (
                        <div style={styles.itemImagePlaceholder}>🍿</div>
                      )}
                      <div>
                        <div style={styles.itemName}>{item.itemName}</div>
                        {item.isCombo && <span style={styles.comboBadge}>COMBO</span>}
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>{item.categoryName || '-'}</td>
                  <td style={styles.td}>{formatCurrency(item.defaultPrice || item.basePrice || 0)}</td>
                  <td style={styles.td}>
                    <span style={{
                      fontWeight: '700',
                      color: item.cinemaPrice ? '#e53935' : '#333'
                    }}>
                      {formatCurrency(item.effectivePrice || item.cinemaPrice || item.defaultPrice || item.basePrice || 0)}
                    </span>
                    {item.discounted && (
                      <span style={styles.customPriceBadge}>Giá riêng</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.stockBadge,
                      backgroundColor: item.stockQuantity < 20 ? '#ffebee' : '#e8f5e9',
                      color: item.stockQuantity < 20 ? '#c62828' : '#2e7d32'
                    }}>
                      {item.stockQuantity}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: item.isAvailable ? '#e8f5e9' : '#ffebee',
                      color: item.isAvailable ? '#2e7d32' : '#c62828'
                    }}>
                      {item.isAvailable ? 'Đang bán' : 'Tạm ngừng'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button style={styles.editButton} onClick={() => handleEditItem(item)}>
                        ✏️
                      </button>
                      <button style={styles.toggleButton} onClick={() => handleToggleAvailability(item.itemId)}>
                        {item.isAvailable ? '🔒' : '🔓'}
                      </button>
                      <button style={styles.deleteButton} onClick={() => handleRemoveItem(item.itemId)}>
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>➕ Thêm Sản Phẩm Vào Rạp</h2>
              <button style={styles.closeButton} onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmitAdd}>
              <div style={styles.modalBody}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Chọn sản phẩm *</label>
                  <select
                    value={addFormData.itemId}
                    onChange={(e) => {
                      const item = allItems.find(i => i.id === parseInt(e.target.value));
                      setAddFormData({
                        ...addFormData, 
                        itemId: e.target.value,
                        customPrice: item?.price || ''
                      });
                    }}
                    required
                    style={styles.formInput}
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {getAvailableItemsToAdd().map(item => (
                      <option key={item.id} value={item.id}>
                        {item.itemName} - {formatCurrency(item.price)}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Giá bán tại rạp (VNĐ)</label>
                    <input
                      type="number"
                      value={addFormData.customPrice}
                      onChange={(e) => setAddFormData({...addFormData, customPrice: e.target.value})}
                      style={styles.formInput}
                      min="0"
                      step="1000"
                      placeholder="Để trống = giá gốc"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Số lượng tồn kho *</label>
                    <input
                      type="number"
                      value={addFormData.stockQuantity}
                      onChange={(e) => setAddFormData({...addFormData, stockQuantity: e.target.value})}
                      required
                      style={styles.formInput}
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <div style={styles.modalFooter}>
                <button type="button" onClick={() => setShowAddModal(false)} style={styles.cancelButton}>
                  Hủy
                </button>
                <button type="submit" disabled={submitting} style={styles.submitButton}>
                  {submitting ? 'Đang thêm...' : '➕ Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && selectedItem && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>✏️ Chỉnh Sửa: {selectedItem.itemName}</h2>
              <button style={styles.closeButton} onClick={() => setShowEditModal(false)}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.editSection}>
                <h3 style={styles.editSectionTitle}>💰 Cập nhật giá bán</h3>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Giá bán mới (VNĐ)</label>
                    <input
                      type="number"
                      value={editFormData.customPrice}
                      onChange={(e) => setEditFormData({...editFormData, customPrice: e.target.value})}
                      style={styles.formInput}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleUpdatePrice} 
                    disabled={submitting}
                    style={{...styles.submitButton, marginTop: '28px'}}
                  >
                    Cập nhật giá
                  </button>
                </div>
              </div>

              <div style={styles.divider}></div>

              <div style={styles.editSection}>
                <h3 style={styles.editSectionTitle}>📦 Cập nhật tồn kho</h3>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Số lượng tồn kho</label>
                    <input
                      type="number"
                      value={editFormData.stockQuantity}
                      onChange={(e) => setEditFormData({...editFormData, stockQuantity: e.target.value})}
                      style={styles.formInput}
                      min="0"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleUpdateStock} 
                    disabled={submitting}
                    style={{...styles.submitButton, marginTop: '28px', backgroundColor: '#ff9800'}}
                  >
                    Cập nhật kho
                  </button>
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button type="button" onClick={() => setShowEditModal(false)} style={styles.cancelButton}>
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
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  createButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  syncButton: {
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
    backgroundColor: '#e3f2fd',
    borderRadius: '12px',
    textAlign: 'center',
    minWidth: '120px'
  },
  statNumber: {
    display: 'block',
    fontSize: '28px',
    fontWeight: '700',
    color: '#1976d2'
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
  warningBanner: {
    padding: '12px 20px',
    backgroundColor: '#fff3e0',
    borderRadius: '8px',
    marginBottom: '24px',
    color: '#e65100',
    fontSize: '14px',
    fontWeight: '500'
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
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeaderRow: {
    backgroundColor: '#f8f9fa',
    borderBottom: '2px solid #e9ecef'
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: '600',
    fontSize: '13px',
    color: '#495057',
    textTransform: 'uppercase'
  },
  tableRow: {
    borderBottom: '1px solid #f0f0f0'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#333',
    verticalAlign: 'middle'
  },
  itemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  itemImage: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    objectFit: 'cover'
  },
  itemImagePlaceholder: {
    width: '50px',
    height: '50px',
    borderRadius: '8px',
    backgroundColor: '#fff3e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px'
  },
  itemName: {
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px'
  },
  comboBadge: {
    display: 'inline-block',
    padding: '2px 6px',
    backgroundColor: '#ff9800',
    color: 'white',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700'
  },
  customPriceBadge: {
    display: 'block',
    fontSize: '10px',
    color: '#e53935',
    marginTop: '2px'
  },
  stockBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600'
  },
  actionButtons: {
    display: 'flex',
    gap: '6px'
  },
  editButton: {
    padding: '8px 10px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  toggleButton: {
    padding: '8px 10px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '8px 10px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
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
    maxWidth: '500px',
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
  formGroup: {
    marginBottom: '16px',
    flex: '1'
  },
  formLabel: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },
  formInput: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start'
  },
  editSection: {
    marginBottom: '20px'
  },
  editSectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px'
  },
  divider: {
    height: '1px',
    backgroundColor: '#e9ecef',
    margin: '20px 0'
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e9ecef',
    display: 'flex',
    gap: '12px',
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
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

export default CinemaConcessionManagement;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFilm,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaEdit,
  FaTrash,
  FaLock,
  FaUnlock,
  FaSync,
  FaFilter,
  FaExclamationTriangle,
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import './CinemaConcessionManagement.css';

const CinemaConcessionManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

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
    stockQuantity: 100,
  });
  const [editFormData, setEditFormData] = useState({
    customPrice: '',
    stockQuantity: '',
  });
  const [submitting, setSubmitting] = useState(false);
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

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories`, {
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể tải danh mục');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      /* optional toast */
    }
  }, [token, API_BASE_URL, authHeaders]);

  const fetchAllItems = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/items`, {
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể tải sản phẩm');
      const data = await response.json();
      setAllItems(Array.isArray(data) ? data : []);
    } catch {
      /* optional */
    }
  }, [token, API_BASE_URL, authHeaders]);

  const fetchCinemaItems = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!selectedCinema) return;
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/${selectedCinema}/concessions/all`,
        { headers: authHeaders }
      );
      if (!response.ok) throw new Error('Không thể tải sản phẩm của rạp');
      const data = await response.json();
      setCinemaItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách sản phẩm của rạp');
      setCinemaItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, selectedCinema, API_BASE_URL, authHeaders]);

  useEffect(() => {
    fetchMyCinemas();
  }, [fetchMyCinemas]);

  useEffect(() => {
    fetchCategories();
    fetchAllItems();
  }, [fetchCategories, fetchAllItems]);

  useEffect(() => {
    fetchCinemaItems();
  }, [fetchCinemaItems, listTick]);

  const closeAddModal = useCallback(() => setShowAddModal(false), []);
  const closeEditModal = useCallback(() => setShowEditModal(false), []);

  const anyModal = showAddModal || showEditModal;
  useEffect(() => {
    if (!anyModal) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showEditModal) closeEditModal();
      else if (showAddModal) closeAddModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [anyModal, showAddModal, showEditModal, closeAddModal, closeEditModal]);

  const handleAddItem = () => {
    setAddFormData({
      itemId: '',
      customPrice: '',
      stockQuantity: 100,
    });
    setShowAddModal(true);
  };

  const handleEditItem = (item) => {
    setSelectedItem(item);
    setEditFormData({
      customPrice: item.cinemaPrice || item.effectivePrice || item.defaultPrice || item.basePrice || '',
      stockQuantity: item.stockQuantity || 0,
    });
    setShowEditModal(true);
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi rạp?')) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${itemId}`,
        { method: 'DELETE', headers: authHeaders }
      );
      if (!response.ok) throw new Error('Không thể xóa sản phẩm');
      toast.success('Xóa sản phẩm khỏi rạp thành công');
      bumpList();
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${itemId}/toggle`,
        { method: 'PUT', headers: authHeaders }
      );
      if (!response.ok) throw new Error('Không thể cập nhật trạng thái');
      toast.success('Cập nhật trạng thái thành công');
      bumpList();
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items`,
        {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            itemId: parseInt(addFormData.itemId, 10),
            customPrice: addFormData.customPrice ? parseFloat(addFormData.customPrice) : null,
            stockQuantity: parseInt(addFormData.stockQuantity, 10),
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }
      toast.success('Thêm sản phẩm vào rạp thành công');
      setShowAddModal(false);
      bumpList();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePrice = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${selectedItem.itemId}/price`,
        {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ newPrice: parseFloat(editFormData.customPrice) }),
        }
      );
      if (!response.ok) throw new Error('Không thể cập nhật giá');
      toast.success('Cập nhật giá thành công');
      setShowEditModal(false);
      bumpList();
    } catch {
      toast.error('Không thể cập nhật giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStock = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinemas/${selectedCinema}/concessions/items/${selectedItem.itemId}/stock`,
        {
          method: 'PUT',
          headers: authHeaders,
          body: JSON.stringify({ stockQuantity: parseInt(editFormData.stockQuantity, 10) }),
        }
      );
      if (!response.ok) throw new Error('Không thể cập nhật tồn kho');
      toast.success('Cập nhật tồn kho thành công');
      setShowEditModal(false);
      bumpList();
    } catch {
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
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể đồng bộ');
      toast.success('Đồng bộ sản phẩm thành công');
      bumpList();
    } catch {
      toast.error('Không thể đồng bộ sản phẩm');
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const filteredItems = useMemo(() => {
    return cinemaItems.filter((item) => {
      return !filterCategory || item.categoryId === parseInt(filterCategory, 10);
    });
  }, [cinemaItems, filterCategory]);

  const lowStockItems = useMemo(
    () => cinemaItems.filter((item) => item.stockQuantity < 20),
    [cinemaItems]
  );

  const availableItemsToAdd = useMemo(() => {
    const existingItemIds = cinemaItems.map((ci) => ci.itemId);
    return allItems.filter((item) => !existingItemIds.includes(item.id));
  }, [cinemaItems, allItems]);

  return (
    <div className="adm-cnc" role="main" aria-label="Bắp nước tại rạp">
      <div className="adm-cnc__hero">
        <div className="adm-cnc__titles">
          <h1 className="adm-cnc__title">
            <FaFilm /> Bắp nước tại rạp
          </h1>
          <p className="adm-cnc__sub">Giá, tồn kho và trạng thái bán theo từng rạp</p>
        </div>
        <div className="adm-cnc__hero-actions">
          <button
            type="button"
            className="adm-cnc__btn adm-cnc__btn--sync"
            onClick={handleSyncItems}
            disabled={!selectedCinema}
          >
            <FaSync /> Đồng bộ
          </button>
          <button
            type="button"
            className="adm-cnc__btn adm-cnc__btn--primary"
            onClick={handleAddItem}
            disabled={!selectedCinema}
          >
            <FaPlus /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="adm-cnc__select-bar">
        <label htmlFor="adm-cnc-cinema" className="adm-cnc__select-label">
          Chọn rạp
        </label>
        <select
          id="adm-cnc-cinema"
          className="adm-cnc__select"
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
        <div className="adm-cnc__stats">
          <div className="adm-cnc__stat">
            <span className="adm-cnc__stat-num">{cinemaItems.length}</span>
            <span className="adm-cnc__stat-lbl">Tổng SP</span>
          </div>
          <div
            className={`adm-cnc__stat ${lowStockItems.length > 0 ? 'adm-cnc__stat--warn' : 'adm-cnc__stat--ok'}`}
          >
            <span className="adm-cnc__stat-num">{lowStockItems.length}</span>
            <span className="adm-cnc__stat-lbl">Sắp hết</span>
          </div>
          <div className="adm-cnc__stat-filter">
            <FaFilter className="adm-cnc__filter-ico" aria-hidden />
            <select
              className="adm-cnc__filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {selectedCinema && lowStockItems.length > 0 && (
        <div className="adm-cnc__banner" role="status">
          <FaExclamationTriangle />
          <span>
            Có {lowStockItems.length} sản phẩm tồn kho dưới 20:{' '}
            {lowStockItems
              .slice(0, 3)
              .map((i) => i.itemName)
              .join(', ')}
            {lowStockItems.length > 3 && ` và ${lowStockItems.length - 3} món khác…`}
          </span>
        </div>
      )}

      {loading ? (
        <div className="adm-cnc__state">
          <FaSpinner className="adm-cnc__spin" />
          <p className="adm-cnc__muted">Đang tải dữ liệu...</p>
        </div>
      ) : !selectedCinema ? (
        <div className="adm-cnc__empty">
          <FaFilm className="adm-cnc__empty-ico" />
          <h3>Chọn rạp</h3>
          <p className="adm-cnc__muted">Chọn rạp để xem và chỉnh sản phẩm.</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="adm-cnc__empty">
          <FaFilm className="adm-cnc__empty-ico" />
          <h3>Chưa có sản phẩm</h3>
          <p className="adm-cnc__muted">Thêm sản phẩm hoặc dùng Đồng bộ.</p>
        </div>
      ) : (
        <div className="adm-cnc__table-wrap">
          <table className="adm-cnc__table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá gốc</th>
                <th>Giá bán</th>
                <th>Tồn kho</th>
                <th>TT</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.itemId}>
                  <td>
                    <div className="adm-cnc__product">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className="adm-cnc__thumb" />
                      ) : (
                        <div className="adm-cnc__thumb-ph">
                          <FaFilm />
                        </div>
                      )}
                      <div>
                        <div className="adm-cnc__pname">{item.itemName}</div>
                        {item.isCombo && <span className="adm-cnc__combo">COMBO</span>}
                      </div>
                    </div>
                  </td>
                  <td>{item.categoryName || '—'}</td>
                  <td>{formatCurrency(item.defaultPrice || item.basePrice || 0)}</td>
                  <td>
                    <span className="adm-cnc__price">
                      {formatCurrency(
                        item.effectivePrice || item.cinemaPrice || item.defaultPrice || item.basePrice || 0
                      )}
                    </span>
                    {item.discounted && <span className="adm-cnc__tag-price">Giá riêng</span>}
                  </td>
                  <td>
                    <span
                      className={`adm-cnc__stock ${
                        item.stockQuantity < 20 ? 'adm-cnc__stock--low' : ''
                      }`}
                    >
                      {item.stockQuantity}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`adm-cnc__avail ${item.isAvailable ? 'adm-cnc__avail--on' : 'adm-cnc__avail--off'}`}
                    >
                      {item.isAvailable ? 'Đang bán' : 'Tạm ngừng'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-cnc__actions">
                      <button
                        type="button"
                        className="adm-cnc__icon-btn adm-cnc__icon-btn--edit"
                        onClick={() => handleEditItem(item)}
                        aria-label="Sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="adm-cnc__icon-btn adm-cnc__icon-btn--toggle"
                        onClick={() => handleToggleAvailability(item.itemId)}
                        aria-label={item.isAvailable ? 'Ngừng bán' : 'Mở bán'}
                      >
                        {item.isAvailable ? <FaLock /> : <FaUnlock />}
                      </button>
                      <button
                        type="button"
                        className="adm-cnc__icon-btn adm-cnc__icon-btn--del"
                        onClick={() => handleRemoveItem(item.itemId)}
                        aria-label="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="adm-cnc__modal" role="presentation">
          <div
            className="adm-cnc__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-cnc-add-title"
          >
            <div className="adm-cnc__panel-head">
              <h2 id="adm-cnc-add-title">Thêm sản phẩm vào rạp</h2>
              <button type="button" className="adm-cnc__panel-x" onClick={closeAddModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmitAdd}>
              <div className="adm-cnc__panel-body">
                <div className="adm-cnc__field">
                  <label htmlFor="adm-cnc-item">Sản phẩm *</label>
                  <select
                    id="adm-cnc-item"
                    value={addFormData.itemId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const found = allItems.find((i) => i.id === parseInt(v, 10));
                      setAddFormData({
                        ...addFormData,
                        itemId: v,
                        customPrice: found?.price != null ? String(found.price) : '',
                      });
                    }}
                    required
                  >
                    <option value="">— Chọn —</option>
                    {availableItemsToAdd.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName} — {formatCurrency(item.price)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-cnc__row">
                  <div className="adm-cnc__field">
                    <label htmlFor="adm-cnc-price">Giá tại rạp (VNĐ)</label>
                    <input
                      id="adm-cnc-price"
                      type="number"
                      value={addFormData.customPrice}
                      onChange={(e) => setAddFormData({ ...addFormData, customPrice: e.target.value })}
                      min="0"
                      step="1000"
                      placeholder="Trống = giá gốc"
                    />
                  </div>
                  <div className="adm-cnc__field">
                    <label htmlFor="adm-cnc-stock">Tồn kho *</label>
                    <input
                      id="adm-cnc-stock"
                      type="number"
                      value={addFormData.stockQuantity}
                      onChange={(e) => setAddFormData({ ...addFormData, stockQuantity: e.target.value })}
                      required
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="adm-cnc__footer">
                <button type="button" className="adm-cnc__btn adm-cnc__btn--ghost" onClick={closeAddModal}>
                  Hủy
                </button>
                <button type="submit" className="adm-cnc__btn adm-cnc__btn--submit" disabled={submitting}>
                  {submitting ? 'Đang thêm...' : 'Thêm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedItem && (
        <div className="adm-cnc__modal" role="presentation">
          <div
            className="adm-cnc__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-cnc-edit-title"
          >
            <div className="adm-cnc__panel-head">
              <h2 id="adm-cnc-edit-title">Chỉnh sửa: {selectedItem.itemName}</h2>
              <button type="button" className="adm-cnc__panel-x" onClick={closeEditModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <div className="adm-cnc__panel-body">
              <div className="adm-cnc__section">
                <h3 className="adm-cnc__sec-title">Cập nhật giá</h3>
                <div className="adm-cnc__row adm-cnc__row--end">
                  <div className="adm-cnc__field">
                    <label htmlFor="adm-cnc-nprice">Giá bán (VNĐ)</label>
                    <input
                      id="adm-cnc-nprice"
                      type="number"
                      value={editFormData.customPrice}
                      onChange={(e) => setEditFormData({ ...editFormData, customPrice: e.target.value })}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <button
                    type="button"
                    className="adm-cnc__btn adm-cnc__btn--submit"
                    onClick={handleUpdatePrice}
                    disabled={submitting}
                  >
                    Cập nhật giá
                  </button>
                </div>
              </div>
              <div className="adm-cnc__divider" />
              <div className="adm-cnc__section">
                <h3 className="adm-cnc__sec-title">Cập nhật tồn kho</h3>
                <div className="adm-cnc__row adm-cnc__row--end">
                  <div className="adm-cnc__field">
                    <label htmlFor="adm-cnc-nstock">Số lượng</label>
                    <input
                      id="adm-cnc-nstock"
                      type="number"
                      value={editFormData.stockQuantity}
                      onChange={(e) => setEditFormData({ ...editFormData, stockQuantity: e.target.value })}
                      min="0"
                    />
                  </div>
                  <button
                    type="button"
                    className="adm-cnc__btn adm-cnc__btn--amber"
                    onClick={handleUpdateStock}
                    disabled={submitting}
                  >
                    Cập nhật kho
                  </button>
                </div>
              </div>
            </div>
            <div className="adm-cnc__footer">
              <button type="button" className="adm-cnc__btn adm-cnc__btn--ghost" onClick={closeEditModal}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaConcessionManagement;

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCookie,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaLock,
  FaUnlock,
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import './ConcessionItemManagement.css';

const ConcessionItemManagement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    categoryId: '',
    price: '',
    costPrice: '',
    imageUrl: '',
    size: '',
    calories: '',
    ingredients: '',
    isCombo: false,
    comboItems: '',
    displayOrder: 0,
    isAvailable: true,
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
      /* silent — toast on items if needed */
    }
  }, [token, API_BASE_URL, authHeaders]);

  const fetchItems = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/items`, {
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể tải sản phẩm');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, API_BASE_URL, authHeaders]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, listTick]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems, listTick]);

  const closeModal = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    if (!showModal) return undefined;
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
  }, [showModal, closeModal]);

  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setFormData({
      itemName: '',
      description: '',
      categoryId: categories.length > 0 ? String(categories[0].id) : '',
      price: '',
      costPrice: '',
      imageUrl: '',
      size: '',
      calories: '',
      ingredients: '',
      isCombo: false,
      comboItems: '',
      displayOrder: items.length + 1,
      isAvailable: true,
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setFormData({
      itemName: item.itemName || '',
      description: item.description || '',
      categoryId: item.category?.id != null ? String(item.category.id) : '',
      price: item.price || '',
      costPrice: item.costPrice || '',
      imageUrl: item.imageUrl || '',
      size: item.size || '',
      calories: item.calories || '',
      ingredients: item.ingredients || '',
      isCombo: item.isCombo || false,
      comboItems: item.comboItems || '',
      displayOrder: item.displayOrder || 0,
      isAvailable: item.isAvailable !== false,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || '');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/items/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể xóa sản phẩm');
      toast.success('Xóa sản phẩm thành công');
      bumpList();
    } catch {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/items/${id}/toggle`, {
        method: 'PUT',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể cập nhật trạng thái');
      toast.success('Cập nhật trạng thái thành công');
      bumpList();
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async () => {
    if (modalMode === 'edit' && selectedItem?.imageUrl && formData.imageUrl) {
      try {
        const response = await fetch(`${API_BASE_URL}/concessions/items/${selectedItem.id}/image`, {
          method: 'DELETE',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (response.ok) toast.success('Đã xóa hình ảnh');
      } catch {
        /* ignore */
      }
    }
    setImageFile(null);
    setImagePreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const uploadImage = async (itemId) => {
    if (!imageFile) return null;
    setUploadingImage(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', imageFile);
      const response = await fetch(`${API_BASE_URL}/concessions/items/${itemId}/upload-image`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formDataUpload,
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể upload hình ảnh');
      }
      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      toast.error(`Lỗi upload hình ảnh: ${error.message}`);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (modalMode === 'create' && imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('itemName', formData.itemName);
        formDataUpload.append('categoryId', formData.categoryId);
        formDataUpload.append('price', formData.price);
        if (formData.description) formDataUpload.append('description', formData.description);
        if (formData.costPrice) formDataUpload.append('costPrice', formData.costPrice);
        if (formData.size) formDataUpload.append('size', formData.size);
        if (formData.calories) formDataUpload.append('calories', formData.calories);
        if (formData.ingredients) formDataUpload.append('ingredients', formData.ingredients);
        formDataUpload.append('isCombo', formData.isCombo);
        if (formData.comboItems) formDataUpload.append('comboItems', formData.comboItems);
        formDataUpload.append('displayOrder', formData.displayOrder);
        formDataUpload.append('file', imageFile);

        const response = await fetch(`${API_BASE_URL}/concessions/items/with-image`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formDataUpload,
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Có lỗi xảy ra');
        }
        toast.success('Tạo sản phẩm thành công');
        setShowModal(false);
        bumpList();
        return;
      }

      const url =
        modalMode === 'create'
          ? `${API_BASE_URL}/concessions/items`
          : `${API_BASE_URL}/concessions/items/${selectedItem.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const payload = {
        itemName: formData.itemName,
        description: formData.description,
        category: { id: parseInt(formData.categoryId, 10) },
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        imageUrl: formData.imageUrl,
        size: formData.size,
        calories: formData.calories ? parseInt(formData.calories, 10) : null,
        ingredients: formData.ingredients,
        isCombo: formData.isCombo,
        comboItems: formData.comboItems,
        displayOrder: formData.displayOrder,
        isAvailable: formData.isAvailable,
      };

      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }
      const savedItem = await response.json();
      if (imageFile && savedItem.id) {
        await uploadImage(savedItem.id);
      }
      toast.success(modalMode === 'create' ? 'Tạo sản phẩm thành công' : 'Cập nhật sản phẩm thành công');
      setShowModal(false);
      bumpList();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchCategory =
        !filterCategory || item.category?.id === parseInt(filterCategory, 10);
      const matchSearch =
        !searchKeyword || item.itemName?.toLowerCase().includes(searchKeyword.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [items, filterCategory, searchKeyword]);

  return (
    <div className="adm-cit" role="main" aria-label="Quản lý sản phẩm bắp nước">
      <div className="adm-cit__hero">
        <div className="adm-cit__titles">
          <h1 className="adm-cit__title">
            <FaCookie /> Sản phẩm bắp nước
          </h1>
          <p className="adm-cit__sub">Danh sách combo, đồ uống và món ăn kèm</p>
        </div>
        <button type="button" className="adm-cit__btn adm-cit__btn--primary" onClick={handleCreate}>
          <FaPlus /> Thêm sản phẩm
        </button>
      </div>

      <div className="adm-cit__toolbar">
        <div className="adm-cit__filter">
          <FaSearch className="adm-cit__filter-ico" aria-hidden />
          <input
            type="text"
            className="adm-cit__filter-input"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
          />
        </div>
        <div className="adm-cit__filter">
          <FaFilter className="adm-cit__filter-ico" aria-hidden />
          <select
            className="adm-cit__filter-select"
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
        <div className="adm-cit__stat">
          <span>
            Tổng: <strong>{filteredItems.length}</strong> sản phẩm
          </span>
        </div>
      </div>

      {loading ? (
        <div className="adm-cit__state">
          <FaSpinner className="adm-cit__spin" />
          <p className="adm-cit__muted">Đang tải dữ liệu...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="adm-cit__empty">
          <FaCookie className="adm-cit__empty-ico" />
          <h3>Chưa có sản phẩm</h3>
          <p className="adm-cit__muted">Thêm sản phẩm mới hoặc đổi bộ lọc.</p>
        </div>
      ) : (
        <div className="adm-cit__grid">
          {filteredItems.map((item) => (
            <div key={item.id} className="adm-cit__card">
              <div className="adm-cit__card-img">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="adm-cit__img" />
                ) : (
                  <div className="adm-cit__img-ph">
                    <FaCookie />
                  </div>
                )}
                {item.isCombo && <span className="adm-cit__badge adm-cit__badge--combo">COMBO</span>}
                <span
                  className={`adm-cit__badge adm-cit__badge--stock ${
                    item.isAvailable ? 'adm-cit__badge--ok' : 'adm-cit__badge--bad'
                  }`}
                >
                  {item.isAvailable ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </div>
              <div className="adm-cit__card-body">
                <h3 className="adm-cit__card-title">{item.itemName}</h3>
                <p className="adm-cit__card-cat">{item.category?.categoryName || 'Chưa phân loại'}</p>
                <p className="adm-cit__card-desc">{item.description || 'Không có mô tả'}</p>
                <div className="adm-cit__card-row">
                  <span className="adm-cit__price">{formatCurrency(item.price || 0)}</span>
                  {item.size ? <span className="adm-cit__size">{item.size}</span> : null}
                </div>
                {item.calories ? (
                  <p className="adm-cit__cal">{item.calories} kcal</p>
                ) : null}
              </div>
              <div className="adm-cit__card-actions">
                <button
                  type="button"
                  className="adm-cit__btn adm-cit__btn--edit"
                  onClick={() => handleEdit(item)}
                >
                  <FaEdit /> Sửa
                </button>
                <button
                  type="button"
                  className="adm-cit__btn adm-cit__btn--toggle"
                  onClick={() => handleToggle(item.id)}
                >
                  {item.isAvailable ? <FaLock /> : <FaUnlock />}
                </button>
                <button
                  type="button"
                  className="adm-cit__btn adm-cit__btn--del"
                  onClick={() => handleDelete(item.id)}
                  aria-label="Xóa"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="adm-cit__modal" role="presentation">
          <div
            className="adm-cit__panel adm-cit__panel--lg"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-cit-modal-title"
          >
            <div className="adm-cit__panel-head">
              <h2 id="adm-cit-modal-title">
                {modalMode === 'create' ? 'Thêm sản phẩm' : 'Chỉnh sửa sản phẩm'}
              </h2>
              <button type="button" className="adm-cit__panel-x" onClick={closeModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="adm-cit__panel-body">
                <div className="adm-cit__row">
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-name">
                      Tên sản phẩm <span className="adm-cit__req">*</span>
                    </label>
                    <input
                      id="adm-cit-name"
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                      required
                      placeholder="VD: Combo Solo, Bắp rang bơ..."
                    />
                  </div>
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-cat">
                      Danh mục <span className="adm-cit__req">*</span>
                    </label>
                    <select
                      id="adm-cit-cat"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">— Chọn danh mục —</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.categoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="adm-cit__field">
                  <label htmlFor="adm-cit-desc">Mô tả</label>
                  <textarea
                    id="adm-cit-desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Mô tả sản phẩm..."
                  />
                </div>
                <div className="adm-cit__row">
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-price">
                      Giá bán (VNĐ) <span className="adm-cit__req">*</span>
                    </label>
                    <input
                      id="adm-cit-price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-cost">Giá vốn (VNĐ)</label>
                    <input
                      id="adm-cit-cost"
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>
                <div className="adm-cit__field">
                  <label>Hình ảnh</label>
                  <div className="adm-cit__upload">
                    {imagePreview || formData.imageUrl ? (
                      <div className="adm-cit__preview-wrap">
                        <img src={imagePreview || formData.imageUrl} alt="" className="adm-cit__preview-img" />
                        <button type="button" className="adm-cit__preview-rm" onClick={handleRemoveImage}>
                          Xóa ảnh
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="adm-cit__drop"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Chọn ảnh từ máy (PNG, JPG, tối đa 5MB)
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="adm-cit__file"
                    />
                    {!imageFile && !imagePreview && (
                      <div className="adm-cit__url-row">
                        <span className="adm-cit__or">hoặc URL</span>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => {
                            setFormData({ ...formData, imageUrl: e.target.value });
                            setImagePreview(e.target.value);
                          }}
                          placeholder="https://..."
                        />
                      </div>
                    )}
                  </div>
                  {uploadingImage && <p className="adm-cit__uploading">Đang tải ảnh lên...</p>}
                </div>
                <div className="adm-cit__row">
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-size">Size</label>
                    <select
                      id="adm-cit-size"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    >
                      <option value="">— Chọn size —</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-cal">Calories</label>
                    <input
                      id="adm-cit-cal"
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                      min="0"
                      placeholder="VD: 350"
                    />
                  </div>
                </div>
                <div className="adm-cit__field">
                  <label htmlFor="adm-cit-ing">Thành phần</label>
                  <input
                    id="adm-cit-ing"
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="VD: Bắp, bơ, muối..."
                  />
                </div>
                <div className="adm-cit__row">
                  <div className="adm-cit__field adm-cit__field--check">
                    <label className="adm-cit__check">
                      <input
                        type="checkbox"
                        checked={formData.isCombo}
                        onChange={(e) => setFormData({ ...formData, isCombo: e.target.checked })}
                      />
                      Là combo
                    </label>
                  </div>
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-avail">Trạng thái</label>
                    <select
                      id="adm-cit-avail"
                      value={formData.isAvailable}
                      onChange={(e) =>
                        setFormData({ ...formData, isAvailable: e.target.value === 'true' })
                      }
                    >
                      <option value="true">Đang bán</option>
                      <option value="false">Ngừng bán</option>
                    </select>
                  </div>
                </div>
                {formData.isCombo && (
                  <div className="adm-cit__field">
                    <label htmlFor="adm-cit-combo">Thành phần combo</label>
                    <textarea
                      id="adm-cit-combo"
                      value={formData.comboItems}
                      onChange={(e) => setFormData({ ...formData, comboItems: e.target.value })}
                      rows={3}
                      placeholder="VD: 1 Bắp lớn + 2 Coca..."
                    />
                  </div>
                )}
              </div>
              <div className="adm-cit__footer">
                <button
                  type="button"
                  className="adm-cit__btn adm-cit__btn--ghost"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button type="submit" className="adm-cit__btn adm-cit__btn--submit" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : modalMode === 'create' ? 'Tạo mới' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcessionItemManagement;

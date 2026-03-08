import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './ConcessionItemManagement.css';

const ConcessionItemManagement = () => {
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
  const fileInputRef = useRef(null);
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
    isAvailable: true
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, []);

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

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/items`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể tải sản phẩm');

      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      itemName: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      price: '',
      costPrice: '',
      imageUrl: '',
      size: '',
      calories: '',
      ingredients: '',
      isCombo: false,
      comboItems: '',
      displayOrder: items.length + 1,
      isAvailable: true
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
      categoryId: item.category?.id || '',
      price: item.price || '',
      costPrice: item.costPrice || '',
      imageUrl: item.imageUrl || '',
      size: item.size || '',
      calories: item.calories || '',
      ingredients: item.ingredients || '',
      isCombo: item.isCombo || false,
      comboItems: item.comboItems || '',
      displayOrder: item.displayOrder || 0,
      isAvailable: item.isAvailable !== false
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể xóa sản phẩm');

      toast.success('Xóa sản phẩm thành công');
      fetchItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/items/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể cập nhật trạng thái');

      toast.success('Cập nhật trạng thái thành công');
      fetchItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setImageFile(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    if (modalMode === 'edit' && selectedItem?.imageUrl && formData.imageUrl) {
      // Delete image from S3
      try {
        const response = await fetch(`${API_BASE_URL}/concessions/items/${selectedItem.id}/image`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          toast.success('Đã xóa hình ảnh');
          setFormData({...formData, imageUrl: ''});
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    
    setImageFile(null);
    setImagePreview('');
    setFormData({...formData, imageUrl: ''});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Không thể upload hình ảnh');
      }
      
      const result = await response.json();
      return result.imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Lỗi upload hình ảnh: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // If creating with image, use the special endpoint
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
            'Authorization': `Bearer ${token}`
          },
          body: formDataUpload
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Có lỗi xảy ra');
        }

        toast.success('Tạo sản phẩm thành công');
        setShowModal(false);
        fetchItems();
        return;
      }

      // Normal create/update flow
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/concessions/items`
        : `${API_BASE_URL}/concessions/items/${selectedItem.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const payload = {
        itemName: formData.itemName,
        description: formData.description,
        category: { id: parseInt(formData.categoryId) },
        price: parseFloat(formData.price),
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        imageUrl: formData.imageUrl,
        size: formData.size,
        calories: formData.calories ? parseInt(formData.calories) : null,
        ingredients: formData.ingredients,
        isCombo: formData.isCombo,
        comboItems: formData.comboItems,
        displayOrder: formData.displayOrder,
        isAvailable: formData.isAvailable
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      const savedItem = await response.json();

      // If there's a new image file, upload it
      if (imageFile && savedItem.id) {
        await uploadImage(savedItem.id);
      }

      toast.success(modalMode === 'create' ? 'Tạo sản phẩm thành công' : 'Cập nhật sản phẩm thành công');
      setShowModal(false);
      fetchItems();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredItems = items.filter(item => {
    const matchCategory = !filterCategory || item.category?.id === parseInt(filterCategory);
    const matchSearch = !searchKeyword || 
      item.itemName?.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🍿 Quản Lý Sản Phẩm Bắp Nước</h1>
          <p style={styles.subtitle}>Quản lý danh sách sản phẩm bắp nước, combo</p>
        </div>
        <button style={styles.createButton} onClick={handleCreate}>
          + Thêm Sản Phẩm
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filterContainer}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>🔍 Tìm kiếm:</label>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Nhập tên sản phẩm..."
            style={styles.filterInput}
          />
        </div>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>📁 Danh mục:</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </select>
        </div>
        <div style={styles.statsBox}>
          <span>📦 Tổng: <strong>{filteredItems.length}</strong> sản phẩm</span>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🍿</div>
          <h3>Chưa có sản phẩm nào</h3>
          <p>Nhấn "Thêm Sản Phẩm" để tạo sản phẩm mới</p>
        </div>
      ) : (
        <div style={styles.gridContainer}>
          {filteredItems.map(item => (
            <div key={item.id} style={styles.itemCard}>
              <div style={styles.itemImage}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.itemName} style={styles.image} />
                ) : (
                  <div style={styles.imagePlaceholder}>🍿</div>
                )}
                {item.isCombo && <span style={styles.comboBadge}>COMBO</span>}
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: item.isAvailable ? '#4CAF50' : '#f44336'
                }}>
                  {item.isAvailable ? 'Đang bán' : 'Ngừng bán'}
                </span>
              </div>
              <div style={styles.itemContent}>
                <h3 style={styles.itemName}>{item.itemName}</h3>
                <p style={styles.itemCategory}>{item.category?.categoryName || 'Chưa phân loại'}</p>
                <p style={styles.itemDescription}>{item.description || 'Không có mô tả'}</p>
                <div style={styles.itemPriceRow}>
                  <span style={styles.itemPrice}>{formatCurrency(item.price || 0)}</span>
                  {item.size && <span style={styles.itemSize}>Size: {item.size}</span>}
                </div>
                {item.calories && <p style={styles.itemCalories}>🔥 {item.calories} kcal</p>}
              </div>
              <div style={styles.itemActions}>
                <button style={styles.editButton} onClick={() => handleEdit(item)}>
                  ✏️ Sửa
                </button>
                <button style={styles.toggleButton} onClick={() => handleToggle(item.id)}>
                  {item.isAvailable ? '🔒 Tắt' : '🔓 Bật'}
                </button>
                <button style={styles.deleteButton} onClick={() => handleDelete(item.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {modalMode === 'create' ? '✨ Thêm Sản Phẩm Mới' : '✏️ Chỉnh Sửa Sản Phẩm'}
              </h2>
              <button style={styles.closeButton} onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={styles.modalBody}>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Tên sản phẩm *</label>
                    <input
                      type="text"
                      value={formData.itemName}
                      onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                      required
                      style={styles.formInput}
                      placeholder="VD: Combo Solo, Bắp rang bơ..."
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Danh mục *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      required
                      style={styles.formInput}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{...styles.formInput, minHeight: '60px', resize: 'vertical'}}
                    placeholder="Mô tả sản phẩm..."
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Giá bán (VNĐ) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                      style={styles.formInput}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Giá vốn (VNĐ)</label>
                    <input
                      type="number"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
                      style={styles.formInput}
                      min="0"
                      step="1000"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Hình ảnh sản phẩm</label>
                  <div style={styles.imageUploadContainer}>
                    {(imagePreview || formData.imageUrl) ? (
                      <div style={styles.imagePreviewWrapper}>
                        <img 
                          src={imagePreview || formData.imageUrl} 
                          alt="Preview" 
                          style={styles.imagePreviewImg}
                        />
                        <button 
                          type="button" 
                          onClick={handleRemoveImage}
                          style={styles.removeImageButton}
                        >
                          ✕ Xóa
                        </button>
                      </div>
                    ) : (
                      <div 
                        style={styles.uploadZone}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div style={styles.uploadIcon}>📷</div>
                        <p style={styles.uploadText}>Click để chọn hình ảnh</p>
                        <p style={styles.uploadHint}>PNG, JPG, WEBP (max 5MB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {!imageFile && !imagePreview && (
                      <div style={styles.urlInputWrapper}>
                        <span style={styles.orText}>hoặc</span>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => {
                            setFormData({...formData, imageUrl: e.target.value});
                            setImagePreview(e.target.value);
                          }}
                          style={styles.formInput}
                          placeholder="Nhập URL hình ảnh..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Size</label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                      style={styles.formInput}
                    >
                      <option value="">-- Chọn size --</option>
                      <option value="S">S - Nhỏ</option>
                      <option value="M">M - Vừa</option>
                      <option value="L">L - Lớn</option>
                      <option value="XL">XL - Siêu lớn</option>
                    </select>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Calories</label>
                    <input
                      type="number"
                      value={formData.calories}
                      onChange={(e) => setFormData({...formData, calories: e.target.value})}
                      style={styles.formInput}
                      min="0"
                      placeholder="VD: 350"
                    />
                  </div>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Thành phần</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
                    style={styles.formInput}
                    placeholder="VD: Bắp, bơ, muối..."
                  />
                </div>

                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.isCombo}
                        onChange={(e) => setFormData({...formData, isCombo: e.target.checked})}
                        style={styles.checkbox}
                      />
                      Là Combo
                    </label>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Trạng thái</label>
                    <select
                      value={formData.isAvailable}
                      onChange={(e) => setFormData({...formData, isAvailable: e.target.value === 'true'})}
                      style={styles.formInput}
                    >
                      <option value="true">Đang bán</option>
                      <option value="false">Ngừng bán</option>
                    </select>
                  </div>
                </div>

                {formData.isCombo && (
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Thành phần Combo</label>
                    <textarea
                      value={formData.comboItems}
                      onChange={(e) => setFormData({...formData, comboItems: e.target.value})}
                      style={{...styles.formInput, minHeight: '60px', resize: 'vertical'}}
                      placeholder="VD: 1 Bắp lớn + 2 Coca + 1 Snack"
                    />
                  </div>
                )}
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  style={styles.cancelButton}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitButton}
                >
                  {submitting ? 'Đang lưu...' : (modalMode === 'create' ? '✨ Tạo mới' : '💾 Cập nhật')}
                </button>
              </div>
            </form>
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
  filterContainer: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '24px',
    padding: '16px 24px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  filterLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  filterInput: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    width: '200px'
  },
  filterSelect: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    minWidth: '150px'
  },
  statsBox: {
    marginLeft: 'auto',
    padding: '8px 16px',
    backgroundColor: '#e3f2fd',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#1976d2'
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
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px'
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  itemImage: {
    position: 'relative',
    height: '160px',
    backgroundColor: '#f5f5f5'
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '48px',
    backgroundColor: '#fff3e0'
  },
  comboBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    padding: '4px 8px',
    backgroundColor: '#ff9800',
    color: 'white',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '700'
  },
  statusBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 8px',
    color: 'white',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600'
  },
  itemContent: {
    padding: '16px'
  },
  itemName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  itemCategory: {
    margin: '0 0 8px 0',
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#f0f0f0',
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  itemDescription: {
    margin: '0 0 12px 0',
    fontSize: '13px',
    color: '#666',
    lineHeight: '1.4',
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  itemPriceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemPrice: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#e53935'
  },
  itemSize: {
    fontSize: '12px',
    color: '#666',
    backgroundColor: '#e3f2fd',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  itemCalories: {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#ff9800'
  },
  itemActions: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid #f0f0f0',
    backgroundColor: '#fafafa'
  },
  editButton: {
    flex: '1',
    padding: '8px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  toggleButton: {
    flex: '1',
    padding: '8px',
    backgroundColor: '#FF9800',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  deleteButton: {
    padding: '8px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
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
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '0'
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
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
  },
  imageUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: '200px',
    height: '150px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e0e0e0'
  },
  imagePreviewImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  removeImageButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    padding: '4px 8px',
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  uploadZone: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#fafafa',
    transition: 'border-color 0.2s, background-color 0.2s'
  },
  uploadIcon: {
    fontSize: '36px',
    marginBottom: '8px'
  },
  uploadText: {
    margin: '0 0 4px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333'
  },
  uploadHint: {
    margin: '0',
    fontSize: '12px',
    color: '#999'
  },
  urlInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  orText: {
    fontSize: '12px',
    color: '#999',
    fontStyle: 'italic'
  }
};

export default ConcessionItemManagement;

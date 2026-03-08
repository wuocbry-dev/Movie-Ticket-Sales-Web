import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import './ConcessionCategoryManagement.css';

const ConcessionCategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    displayOrder: 0,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
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
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      categoryName: '',
      description: '',
      displayOrder: categories.length + 1,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setModalMode('edit');
    setSelectedCategory(category);
    setFormData({
      categoryName: category.categoryName || '',
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      isActive: category.isActive !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể xóa danh mục');

      toast.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể xóa danh mục');
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories/${id}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Không thể cập nhật trạng thái');

      toast.success('Cập nhật trạng thái thành công');
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = modalMode === 'create'
        ? `${API_BASE_URL}/concessions/categories`
        : `${API_BASE_URL}/concessions/categories/${selectedCategory.id}`;

      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      toast.success(modalMode === 'create' ? 'Tạo danh mục thành công' : 'Cập nhật danh mục thành công');
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="ccm-container">
      {/* Header */}
      <div className="ccm-header">
        <div className="ccm-header-content">
          <h1>Quản Lý Danh Mục Bắp Nước</h1>
          <p className="ccm-header-subtitle">Quản lý các danh mục sản phẩm bắp nước (Combo, Bắp rang, Nước ngọt...)</p>
        </div>
        <button className="ccm-create-btn" onClick={handleCreate}>
          + Thêm Danh Mục
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="ccm-loading">
          <div className="ccm-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="ccm-empty">
          <div className="ccm-empty-icon">🏷️</div>
          <h3>Chưa có danh mục nào</h3>
          <p>Nhấn "Thêm Danh Mục" để tạo danh mục mới</p>
        </div>
      ) : (
        <div className="ccm-table-container">
          <table className="ccm-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên danh mục</th>
                <th>Mô tả</th>
                <th>Thứ tự</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category, index) => (
                <tr key={category.id}>
                  <td>{index + 1}</td>
                  <td>
                    <span className="ccm-category-name">
                      <span className="ccm-category-icon">🏷️</span>
                      {category.categoryName}
                    </span>
                  </td>
                  <td className="ccm-description">{category.description || '-'}</td>
                  <td><span className="ccm-order-badge">{category.displayOrder}</span></td>
                  <td>
                    <span className={`ccm-status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                      <span className="ccm-status-dot"></span>
                      {category.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <div className="ccm-actions">
                      <button className="ccm-btn ccm-btn-edit" onClick={() => handleEdit(category)}>
                        ✏️ Sửa
                      </button>
                      <button className="ccm-btn ccm-btn-toggle" onClick={() => handleToggle(category.id)}>
                        {category.isActive ? '🔒 Tắt' : '🔓 Bật'}
                      </button>
                      <button className="ccm-btn ccm-btn-delete" onClick={() => handleDelete(category.id)}>
                        🗑️ Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="ccm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ccm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ccm-modal-header">
              <h2 className="ccm-modal-title">
                {modalMode === 'create' ? '✨ Thêm Danh Mục Mới' : '✏️ Chỉnh Sửa Danh Mục'}
              </h2>
              <button className="ccm-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ccm-modal-body">
                <div className="ccm-form-group">
                  <label className="ccm-form-label">Tên danh mục <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({...formData, categoryName: e.target.value})}
                    required
                    className="ccm-form-input"
                    placeholder="VD: Combo, Bắp rang, Nước ngọt..."
                  />
                </div>

                <div className="ccm-form-group">
                  <label className="ccm-form-label">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="ccm-form-input ccm-form-textarea"
                    placeholder="Mô tả về danh mục..."
                  />
                </div>

                <div className="ccm-form-row">
                  <div className="ccm-form-group">
                    <label className="ccm-form-label">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData({...formData, displayOrder: parseInt(e.target.value) || 0})}
                      className="ccm-form-input"
                      min="0"
                    />
                  </div>

                  <div className="ccm-form-group">
                    <label className="ccm-form-label">Trạng thái</label>
                    <select
                      value={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                      className="ccm-form-input"
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Tắt</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="ccm-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="ccm-btn-cancel"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ccm-btn-submit"
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

export default ConcessionCategoryManagement;

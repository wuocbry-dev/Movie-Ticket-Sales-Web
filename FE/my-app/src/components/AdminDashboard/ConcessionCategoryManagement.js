import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTags, FaPlus, FaSpinner, FaTimes, FaEdit, FaTrash, FaLock, FaUnlock } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import './ConcessionCategoryManagement.css';

const ConcessionCategoryManagement = () => {
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
  const token = Cookies.get('accessToken');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    description: '',
    displayOrder: 0,
    isActive: true,
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
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories`, {
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể tải danh mục');
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách danh mục');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [token, navigate, API_BASE_URL, authHeaders]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, listTick]);

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
    setSelectedCategory(null);
    setFormData({
      categoryName: '',
      description: '',
      displayOrder: categories.length + 1,
      isActive: true,
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
      isActive: category.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) throw new Error('Không thể xóa danh mục');
      toast.success('Xóa danh mục thành công');
      bumpList();
    } catch {
      toast.error('Không thể xóa danh mục');
    }
  };

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/concessions/categories/${id}/toggle`, {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url =
        modalMode === 'create'
          ? `${API_BASE_URL}/concessions/categories`
          : `${API_BASE_URL}/concessions/categories/${selectedCategory.id}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        let msg = 'Có lỗi xảy ra';
        try {
          const errorData = await response.json();
          msg = errorData.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      toast.success(modalMode === 'create' ? 'Tạo danh mục thành công' : 'Cập nhật danh mục thành công');
      setShowModal(false);
      bumpList();
    } catch (error) {
      toast.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="adm-ctg" role="main" aria-label="Quản lý danh mục bắp nước">
      <div className="adm-ctg__hero">
        <div className="adm-ctg__titles">
          <h1 className="adm-ctg__title">
            <FaTags /> Danh mục bắp nước
          </h1>
          <p className="adm-ctg__sub">Combo, bắp rang, nước ngọt và các nhóm sản phẩm</p>
        </div>
        <button type="button" className="adm-ctg__btn adm-ctg__btn--primary" onClick={handleCreate}>
          <FaPlus /> Thêm danh mục
        </button>
      </div>

      {loading ? (
        <div className="adm-ctg__state">
          <FaSpinner className="adm-ctg__spin" />
          <p className="adm-ctg__muted">Đang tải dữ liệu...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="adm-ctg__empty">
          <FaTags className="adm-ctg__empty-ico" />
          <h3>Chưa có danh mục</h3>
          <p className="adm-ctg__muted">Nhấn &quot;Thêm danh mục&quot; để tạo mới.</p>
        </div>
      ) : (
        <div className="adm-ctg__table-wrap">
          <table className="adm-ctg__table">
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
                    <span className="adm-ctg__name">
                      <span className="adm-ctg__name-ico" aria-hidden>
                        <FaTags />
                      </span>
                      {category.categoryName}
                    </span>
                  </td>
                  <td className="adm-ctg__desc">{category.description || '—'}</td>
                  <td>
                    <span className="adm-ctg__order">{category.displayOrder}</span>
                  </td>
                  <td>
                    <span
                      className={`adm-ctg__pill ${category.isActive ? 'adm-ctg__pill--on' : 'adm-ctg__pill--off'}`}
                    >
                      <span className="adm-ctg__pill-dot" />
                      {category.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-ctg__actions">
                      <button
                        type="button"
                        className="adm-ctg__btn adm-ctg__btn--edit"
                        onClick={() => handleEdit(category)}
                      >
                        <FaEdit /> Sửa
                      </button>
                      <button
                        type="button"
                        className="adm-ctg__btn adm-ctg__btn--toggle"
                        onClick={() => handleToggle(category.id)}
                      >
                        {category.isActive ? <FaLock /> : <FaUnlock />}
                        {category.isActive ? ' Tắt' : ' Bật'}
                      </button>
                      <button
                        type="button"
                        className="adm-ctg__btn adm-ctg__btn--del"
                        onClick={() => handleDelete(category.id)}
                      >
                        <FaTrash /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="adm-ctg__modal" role="presentation">
          <div
            className="adm-ctg__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-ctg-modal-title"
          >
            <div className="adm-ctg__panel-head">
              <h2 id="adm-ctg-modal-title">
                {modalMode === 'create' ? 'Thêm danh mục' : 'Chỉnh sửa danh mục'}
              </h2>
              <button type="button" className="adm-ctg__panel-x" onClick={closeModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="adm-ctg__panel-body">
                <div className="adm-ctg__field">
                  <label htmlFor="adm-ctg-name">
                    Tên danh mục <span className="adm-ctg__req">*</span>
                  </label>
                  <input
                    id="adm-ctg-name"
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    required
                    placeholder="VD: Combo, Bắp rang, Nước ngọt..."
                  />
                </div>
                <div className="adm-ctg__field">
                  <label htmlFor="adm-ctg-desc">Mô tả</label>
                  <textarea
                    id="adm-ctg-desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    placeholder="Mô tả ngắn về danh mục..."
                  />
                </div>
                <div className="adm-ctg__row">
                  <div className="adm-ctg__field">
                    <label htmlFor="adm-ctg-order">Thứ tự hiển thị</label>
                    <input
                      id="adm-ctg-order"
                      type="number"
                      value={formData.displayOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })
                      }
                      min="0"
                    />
                  </div>
                  <div className="adm-ctg__field">
                    <label htmlFor="adm-ctg-active">Trạng thái</label>
                    <select
                      id="adm-ctg-active"
                      value={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.value === 'true' })
                      }
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Tắt</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="adm-ctg__footer">
                <button
                  type="button"
                  className="adm-ctg__btn adm-ctg__btn--ghost"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button type="submit" className="adm-ctg__btn adm-ctg__btn--submit" disabled={submitting}>
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

export default ConcessionCategoryManagement;

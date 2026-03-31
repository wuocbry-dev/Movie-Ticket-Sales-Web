import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTags, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import promotionService from '../../services/promotionService';
import './PromotionManagement.css';

const PROMOTION_TYPES = [
  { value: 'PERCENTAGE', label: 'Giảm theo %' },
  { value: 'FIXED_AMOUNT', label: 'Giảm tiền cố định' },
  { value: 'BUY_X_GET_Y', label: 'Mua X tặng Y' },
  { value: 'FREE_ITEM', label: 'Tặng sản phẩm' },
  { value: 'POINTS_MULTIPLIER', label: 'Nhân điểm thưởng' },
];

const formatDate = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return d.toISOString().slice(0, 16);
};

const emptyForm = () => ({
  promotionCode: '',
  promotionName: '',
  description: '',
  promotionType: 'PERCENTAGE',
  imageUrl: '',
  discountPercentage: null,
  discountAmount: null,
  minPurchaseAmount: null,
  maxDiscountAmount: null,
  applicableToJson: '',
  startDate: '',
  endDate: '',
  maxUsageTotal: null,
  maxUsagePerUser: 1,
  targetUserSegmentsJson: '',
  isActive: true,
});

const PromotionManagement = () => {
  const navigate = useNavigate();
  const token = Cookies.get('accessToken');

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [listTick, setListTick] = useState(0);

  const bumpList = useCallback(() => setListTick((t) => t + 1), []);

  const fetchList = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const data = await promotionService.getAllForAdmin();
      setList(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Không thể tải danh sách khuyến mãi');
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => {
    fetchList();
  }, [fetchList, listTick]);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

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
    setSelected(null);
    setFormData(emptyForm());
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setModalMode('edit');
    setSelected(item);
    setFormData({
      promotionCode: item.promotionCode || '',
      promotionName: item.promotionName || '',
      description: item.description || '',
      promotionType: item.promotionType || 'PERCENTAGE',
      imageUrl: item.imageUrl || '',
      discountPercentage: item.discountPercentage ?? null,
      discountAmount: item.discountAmount ?? null,
      minPurchaseAmount: item.minPurchaseAmount ?? null,
      maxDiscountAmount: item.maxDiscountAmount ?? null,
      applicableToJson:
        typeof item.applicableTo === 'object' && item.applicableTo != null
          ? JSON.stringify(item.applicableTo, null, 2)
          : '',
      startDate: formatDate(item.startDate),
      endDate: formatDate(item.endDate),
      maxUsageTotal: item.maxUsageTotal ?? null,
      maxUsagePerUser: item.maxUsagePerUser ?? 1,
      targetUserSegmentsJson:
        typeof item.targetUserSegments === 'object' && item.targetUserSegments != null
          ? JSON.stringify(item.targetUserSegments, null, 2)
          : '',
      isActive: item.isActive !== false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khuyến mãi này?')) return;
    try {
      await promotionService.delete(id);
      toast.success('Đã xóa khuyến mãi');
      bumpList();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Không thể xóa khuyến mãi');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh (jpg, png, webp...)');
      return;
    }
    setUploadingImage(true);
    try {
      const url = await promotionService.uploadImage(file);
      setFormData((prev) => ({ ...prev, imageUrl: url }));
      toast.success('Đã tải ảnh lên');
    } catch (err) {
      toast.error(err.message || 'Upload ảnh thất bại');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const parseOptionalJson = (str) => {
    if (!str || typeof str !== 'string') return null;
    const trimmed = str.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === 'object' && parsed !== null ? parsed : null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
      toast.error('Vui lòng nhập Ngày bắt đầu và Ngày kết thúc');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        promotionCode: formData.promotionCode.trim() || null,
        promotionName: formData.promotionName.trim(),
        description: formData.description.trim() || null,
        promotionType: formData.promotionType,
        imageUrl: formData.imageUrl?.trim() || null,
        discountPercentage:
          formData.discountPercentage != null && formData.discountPercentage !== ''
            ? Number(formData.discountPercentage)
            : null,
        discountAmount:
          formData.discountAmount != null && formData.discountAmount !== ''
            ? Number(formData.discountAmount)
            : null,
        minPurchaseAmount:
          formData.minPurchaseAmount != null && formData.minPurchaseAmount !== ''
            ? Number(formData.minPurchaseAmount)
            : null,
        maxDiscountAmount:
          formData.maxDiscountAmount != null && formData.maxDiscountAmount !== ''
            ? Number(formData.maxDiscountAmount)
            : null,
        applicableTo: parseOptionalJson(formData.applicableToJson),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        maxUsageTotal:
          formData.maxUsageTotal != null && formData.maxUsageTotal !== ''
            ? Number(formData.maxUsageTotal)
            : null,
        maxUsagePerUser: formData.maxUsagePerUser != null ? Number(formData.maxUsagePerUser) : 1,
        targetUserSegments: parseOptionalJson(formData.targetUserSegmentsJson),
        isActive: formData.isActive,
      };
      if (modalMode === 'create') {
        await promotionService.create(payload);
        toast.success('Đã thêm khuyến mãi');
      } else {
        await promotionService.update(selected.id, payload);
        toast.success('Đã cập nhật khuyến mãi');
      }
      setShowModal(false);
      bumpList();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const typeLabel = (type) => PROMOTION_TYPES.find((t) => t.value === type)?.label || type;

  return (
    <div className="adm-prm" role="main" aria-label="Quản lý khuyến mãi">
      <div className="adm-prm__hero">
        <div className="adm-prm__titles">
          <h1 className="adm-prm__title">
            <FaTags /> Quản lý khuyến mãi
          </h1>
          <p className="adm-prm__sub">Thêm, sửa, xóa thông tin khuyến mãi</p>
        </div>
        <button type="button" className="adm-prm__btn adm-prm__btn--primary" onClick={handleCreate}>
          <FaPlus /> Thêm khuyến mãi
        </button>
      </div>

      {loading ? (
        <div className="adm-prm__state">
          <FaSpinner className="adm-prm__spin" />
          <p className="adm-prm__muted">Đang tải...</p>
        </div>
      ) : list.length === 0 ? (
        <div className="adm-prm__empty">
          <FaTags className="adm-prm__empty-ico" />
          <h3>Chưa có khuyến mãi</h3>
          <p className="adm-prm__muted">Nhấn &quot;Thêm khuyến mãi&quot; để tạo mới.</p>
        </div>
      ) : (
        <div className="adm-prm__table-wrap">
          <table className="adm-prm__table">
            <thead>
              <tr>
                <th>Mã</th>
                <th>Tên</th>
                <th>Loại</th>
                <th>Giảm</th>
                <th>Hạn</th>
                <th>TT</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id}>
                  <td>
                    <code className="adm-prm__code">{row.promotionCode || '—'}</code>
                  </td>
                  <td className="adm-prm__name">{row.promotionName}</td>
                  <td>{typeLabel(row.promotionType)}</td>
                  <td>
                    {row.discountPercentage != null && `${row.discountPercentage}%`}
                    {row.discountAmount != null && row.discountAmount > 0 &&
                      ` ${Number(row.discountAmount).toLocaleString('vi-VN')}₫`}
                    {row.discountPercentage == null &&
                      (!row.discountAmount || row.discountAmount === 0) &&
                      '—'}
                  </td>
                  <td className="adm-prm__dates">
                    {row.endDate ? new Date(row.endDate).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td>
                    <span
                      className={`adm-prm__pill ${row.isActive ? 'adm-prm__pill--on' : 'adm-prm__pill--off'}`}
                    >
                      {row.isActive ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-prm__actions">
                      <button
                        type="button"
                        className="adm-prm__btn adm-prm__btn--edit"
                        onClick={() => handleEdit(row)}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        className="adm-prm__btn adm-prm__btn--del"
                        onClick={() => handleDelete(row.id)}
                      >
                        Xóa
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
        <div
          className="adm-prm__modal"
          role="presentation"
          aria-hidden={!showModal}
        >
          <div
            className="adm-prm__panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-prm-modal-title"
          >
            <div className="adm-prm__panel-head">
              <h2 id="adm-prm-modal-title">
                {modalMode === 'create' ? 'Thêm khuyến mãi' : 'Sửa khuyến mãi'}
              </h2>
              <button
                type="button"
                className="adm-prm__panel-x"
                onClick={closeModal}
                aria-label="Đóng"
              >
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="adm-prm__form">
              <div className="adm-prm__form-body">
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-code">Mã khuyến mãi</label>
                  <input
                    id="adm-prm-code"
                    type="text"
                    value={formData.promotionCode}
                    onChange={(e) => setFormData({ ...formData, promotionCode: e.target.value })}
                    placeholder="VD: SUMMER2025"
                  />
                </div>
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-name">
                    Tên khuyến mãi <span className="adm-prm__req">*</span>
                  </label>
                  <input
                    id="adm-prm-name"
                    type="text"
                    value={formData.promotionName}
                    onChange={(e) => setFormData({ ...formData, promotionName: e.target.value })}
                    required
                    placeholder="VD: Giảm 20% vé xem phim"
                  />
                </div>
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-desc">Mô tả</label>
                  <textarea
                    id="adm-prm-desc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết..."
                    rows={3}
                  />
                </div>
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-img">Ảnh khuyến mãi</label>
                  <div className="adm-prm__image-upload">
                    {formData.imageUrl ? (
                      <div className="adm-prm__image-preview">
                        <img src={formData.imageUrl} alt="" />
                        <button
                          type="button"
                          className="adm-prm__image-remove"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    ) : null}
                    <div className="adm-prm__image-input-wrap">
                      <input
                        id="adm-prm-img"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      {uploadingImage && (
                        <span className="adm-prm__upload-status">Đang tải lên...</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-type">Loại</label>
                  <select
                    id="adm-prm-type"
                    value={formData.promotionType}
                    onChange={(e) => setFormData({ ...formData, promotionType: e.target.value })}
                  >
                    {PROMOTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-prm__row">
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-pct">Giảm (%)</label>
                    <input
                      id="adm-prm-pct"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.discountPercentage ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountPercentage: e.target.value === '' ? null : e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-amt">Giảm (₫)</label>
                    <input
                      id="adm-prm-amt"
                      type="number"
                      min="0"
                      value={formData.discountAmount ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountAmount: e.target.value === '' ? null : e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="adm-prm__row">
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-min">Đơn tối thiểu (₫)</label>
                    <input
                      id="adm-prm-min"
                      type="number"
                      min="0"
                      value={formData.minPurchaseAmount ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPurchaseAmount: e.target.value === '' ? null : e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-maxd">Giảm tối đa (₫)</label>
                    <input
                      id="adm-prm-maxd"
                      type="number"
                      min="0"
                      value={formData.maxDiscountAmount ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxDiscountAmount: e.target.value === '' ? null : e.target.value,
                        })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-app">Áp dụng cho (JSON)</label>
                  <textarea
                    id="adm-prm-app"
                    value={formData.applicableToJson}
                    onChange={(e) => setFormData({ ...formData, applicableToJson: e.target.value })}
                    placeholder=""
                    rows={2}
                  />
                </div>
                <div className="adm-prm__row">
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-start">
                      Ngày bắt đầu <span className="adm-prm__req">*</span>
                    </label>
                    <input
                      id="adm-prm-start"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-end">
                      Ngày kết thúc <span className="adm-prm__req">*</span>
                    </label>
                    <input
                      id="adm-prm-end"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="adm-prm__row">
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-total">Số lần dùng (tổng)</label>
                    <input
                      id="adm-prm-total"
                      type="number"
                      min="0"
                      value={formData.maxUsageTotal ?? ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxUsageTotal: e.target.value === '' ? null : e.target.value,
                        })
                      }
                      placeholder="Không giới hạn"
                    />
                  </div>
                  <div className="adm-prm__field">
                    <label htmlFor="adm-prm-per">Lần/người</label>
                    <input
                      id="adm-prm-per"
                      type="number"
                      min="1"
                      value={formData.maxUsagePerUser}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUsagePerUser: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-seg">Đối tượng khách hàng (JSON)</label>
                  <textarea
                    id="adm-prm-seg"
                    value={formData.targetUserSegmentsJson}
                    onChange={(e) =>
                      setFormData({ ...formData, targetUserSegmentsJson: e.target.value })
                    }
                    placeholder=""
                    rows={2}
                  />
                </div>
                <div className="adm-prm__field">
                  <label htmlFor="adm-prm-active">Trạng thái</label>
                  <select
                    id="adm-prm-active"
                    value={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.value === 'true' })
                    }
                  >
                    <option value="true">Bật</option>
                    <option value="false">Tắt</option>
                  </select>
                </div>
              </div>
              <div className="adm-prm__footer">
                <button
                  type="button"
                  className="adm-prm__btn adm-prm__btn--cancel"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="adm-prm__btn adm-prm__btn--submit"
                  disabled={submitting}
                >
                  {submitting ? 'Đang lưu...' : modalMode === 'create' ? 'Thêm' : 'Cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionManagement;

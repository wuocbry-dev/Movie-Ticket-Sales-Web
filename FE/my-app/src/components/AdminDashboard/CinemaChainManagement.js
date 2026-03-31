import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaSave,
  FaSpinner,
  FaCheck,
  FaBuilding,
} from 'react-icons/fa';
import { toast } from '../../utils/toast';
import Cookies from 'js-cookie';
import './CinemaChainManagement.css';

const PAGE_SIZE = 10;
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const emptyForm = () => ({
  chainName: '',
  logoUrl: '',
  website: '',
  description: '',
});

const CinemaChainManagement = () => {
  const navigate = useNavigate();
  const token = Cookies.get('accessToken');

  const [cinemaChains, setCinemaChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedChain, setSelectedChain] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [listTick, setListTick] = useState(0);

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token]
  );

  const fetchCinemaChains = useCallback(async () => {
    if (!token) {
      toast.error('Vui lòng đăng nhập lại');
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        size: String(PAGE_SIZE),
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
      });
      const url = `${API_BASE_URL}/cinema-chains/admin/all?${params}`;
      const response = await fetch(url, { method: 'GET', headers: authHeaders });

      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        toast.error(`Không thể tải danh sách chuỗi rạp (${response.status})`);
        setCinemaChains([]);
        return;
      }

      const result = await response.json();
      if (result.success && result.data?.data) {
        const chains = result.data.data;
        setCinemaChains(chains);
        setTotalPages(result.data.totalPages ?? 1);
        setTotalElements(result.data.totalElements ?? chains.length);
        if (typeof result.data.currentPage === 'number') {
          setPage(result.data.currentPage);
        }
        if (chains.length === 0 && searchTerm.trim()) {
          toast.info('Không tìm thấy chuỗi rạp phù hợp');
        }
      } else {
        toast.error(result.message || 'Lỗi khi tải danh sách');
        setCinemaChains([]);
      }
    } catch {
      toast.error('Không thể kết nối máy chủ');
      setCinemaChains([]);
    } finally {
      setLoading(false);
    }
  }, [token, page, searchTerm, navigate, authHeaders]);

  useEffect(() => {
    fetchCinemaChains();
  }, [fetchCinemaChains, listTick]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setFormData(emptyForm());
    setIsActive(true);
    setSelectedChain(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (chain) => {
    setModalMode('edit');
    setFormData({
      chainName: chain.chainName,
      logoUrl: chain.logoUrl || '',
      website: chain.website || '',
      description: chain.description || '',
    });
    setIsActive(chain.isActive);
    setSelectedChain(chain);
    setShowModal(true);
  };

  const closeModalRef = useRef(() => {});
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedChain(null);
    setFormData(emptyForm());
    setIsActive(true);
  }, []);
  closeModalRef.current = handleCloseModal;

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModalRef.current();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showModal]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateCinemaChain = async () => {
    if (!formData.chainName.trim()) {
      toast.error('Tên chuỗi rạp không được để trống');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Tạo chuỗi rạp thành công');
        handleCloseModal();
        setPage(0);
        setSearchTerm('');
        setListTick((t) => t + 1);
      } else {
        toast.error(result.message || 'Lỗi khi tạo');
      }
    } catch {
      toast.error('Không thể tạo chuỗi rạp');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCinemaChain = async () => {
    if (!formData.chainName.trim()) {
      toast.error('Tên chuỗi rạp không được để trống');
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/${selectedChain.chainId}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({
          chainId: selectedChain.chainId,
          ...formData,
          isActive,
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Cập nhật thành công');
        handleCloseModal();
        setListTick((t) => t + 1);
      } else {
        toast.error(result.message || 'Lỗi khi cập nhật');
      }
    } catch {
      toast.error('Không thể cập nhật');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCinemaChain = async (chainId) => {
    if (!window.confirm('Bạn có chắc muốn xóa chuỗi rạp này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-chains/admin/${chainId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Đã xóa');
        setListTick((t) => t + 1);
      } else {
        toast.error(result.message || 'Không thể xóa');
      }
    } catch {
      toast.error('Lỗi khi xóa');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') handleCreateCinemaChain();
    else handleUpdateCinemaChain();
  };

  const rangeStart = cinemaChains.length > 0 ? page * PAGE_SIZE + 1 : 0;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <div className="adm-ch">
      <header className="adm-ch__hero">
        <div className="adm-ch__hero-text">
          <p className="adm-ch__eyebrow">Hệ thống</p>
          <h1 className="adm-ch__title">Chuỗi rạp</h1>
          <p className="adm-ch__lead">Quản lý thương hiệu / chuỗi rạp và liên kết tới danh sách rạp.</p>
        </div>
        <button type="button" className="adm-ch__btn adm-ch__btn--primary" onClick={handleOpenCreateModal}>
          <FaPlus aria-hidden />
          Thêm chuỗi
        </button>
      </header>

      <div className="adm-ch__toolbar">
        <div className="adm-ch__search">
          <FaSearch className="adm-ch__search-icon" aria-hidden />
          <input
            type="search"
            className="adm-ch__search-input"
            placeholder="Tìm theo tên chuỗi…"
            value={searchTerm}
            onChange={handleSearchChange}
            autoComplete="off"
          />
        </div>
      </div>

      {loading ? (
        <div className="adm-ch__state" aria-busy="true">
          <FaSpinner className="adm-ch__spin-ico" aria-hidden />
          <p>Đang tải…</p>
        </div>
      ) : cinemaChains.length === 0 ? (
        <div className="adm-ch__empty">
          <FaBuilding className="adm-ch__empty-ico" aria-hidden />
          <p className="adm-ch__empty-title">Chưa có chuỗi rạp</p>
          <button type="button" className="adm-ch__btn adm-ch__btn--primary" onClick={handleOpenCreateModal}>
            <FaPlus aria-hidden />
            Tạo chuỗi đầu tiên
          </button>
        </div>
      ) : (
        <>
          <div className="adm-ch__table-wrap">
            <table className="adm-ch__table">
              <thead>
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Tên chuỗi</th>
                  <th scope="col">Website</th>
                  <th scope="col">Mô tả</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Ngày tạo</th>
                  <th scope="col">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {cinemaChains.map((chain) => (
                  <tr key={chain.chainId} className={!chain.isActive ? 'is-inactive' : undefined}>
                    <td className="adm-ch__mono">{chain.chainId}</td>
                    <td>
                      <button
                        type="button"
                        className="adm-ch__name-btn"
                        onClick={() =>
                          navigate('/admin/cinemas', {
                            state: { chainId: chain.chainId, chainName: chain.chainName },
                          })
                        }
                        title="Xem rạp thuộc chuỗi"
                      >
                        {chain.logoUrl?.trim() ? (
                          <img
                            src={chain.logoUrl}
                            alt=""
                            className="adm-ch__logo"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const ph = e.target.nextSibling;
                              if (ph) ph.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span
                          className="adm-ch__logo-ph"
                          style={{ display: chain.logoUrl?.trim() ? 'none' : 'flex' }}
                          aria-hidden
                        >
                          <FaBuilding />
                        </span>
                        <span className="adm-ch__name-txt">{chain.chainName}</span>
                      </button>
                    </td>
                    <td>
                      {chain.website?.trim() ? (
                        <a
                          className="adm-ch__link"
                          href={chain.website.startsWith('http') ? chain.website : `https://${chain.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {chain.website.length > 32 ? `${chain.website.slice(0, 32)}…` : chain.website}
                        </a>
                      ) : (
                        <span className="adm-ch__muted">—</span>
                      )}
                    </td>
                    <td>
                      {chain.description?.trim() ? (
                        <span title={chain.description}>
                          {chain.description.length > 48 ? `${chain.description.slice(0, 48)}…` : chain.description}
                        </span>
                      ) : (
                        <span className="adm-ch__muted">—</span>
                      )}
                    </td>
                    <td>
                      {chain.isActive ? (
                        <span className="adm-ch__pill adm-ch__pill--ok">
                          <FaCheck aria-hidden /> Hoạt động
                        </span>
                      ) : (
                        <span className="adm-ch__pill adm-ch__pill--bad">
                          <FaTimes aria-hidden /> Ngưng
                        </span>
                      )}
                    </td>
                    <td className="adm-ch__num">
                      {new Date(chain.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td>
                      <div className="adm-ch__actions">
                        <button
                          type="button"
                          className="adm-ch__icon-btn adm-ch__icon-btn--edit"
                          onClick={() => handleOpenEditModal(chain)}
                          title="Sửa"
                          aria-label={`Sửa ${chain.chainName}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="adm-ch__icon-btn adm-ch__icon-btn--del"
                          onClick={() => handleDeleteCinemaChain(chain.chainId)}
                          title="Xóa"
                          aria-label={`Xóa ${chain.chainName}`}
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

          {totalPages > 0 && (
            <nav className="adm-ch__pager" aria-label="Phân trang">
              <p className="adm-ch__pager-info">
                {rangeStart}–{rangeEnd} / {totalElements} chuỗi
              </p>
              <div className="adm-ch__pager-btns">
                <button
                  type="button"
                  className="adm-ch__pager-btn"
                  disabled={page === 0 || loading}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                >
                  ← Trước
                </button>
                <span className="adm-ch__pager-ind">
                  Trang {page + 1} / {totalPages || 1}
                </span>
                <button
                  type="button"
                  className="adm-ch__pager-btn"
                  disabled={page >= totalPages - 1 || loading}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Tiếp →
                </button>
              </div>
            </nav>
          )}
        </>
      )}

      {showModal && (
        <div className="adm-ch__modal" role="presentation">
          <div
            className="adm-ch__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-ch-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-ch__panel-head">
              <h2 id="adm-ch-modal-title">
                {modalMode === 'create' ? 'Thêm chuỗi rạp' : 'Sửa chuỗi rạp'}
              </h2>
              <button type="button" className="adm-ch__panel-x" onClick={handleCloseModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form className="adm-ch__form" onSubmit={handleSubmit}>
              <div className="adm-ch__field">
                <label htmlFor="chainName">Tên chuỗi *</label>
                <input
                  id="chainName"
                  name="chainName"
                  value={formData.chainName}
                  onChange={handleFormChange}
                  placeholder="Tên hiển thị"
                  required
                />
              </div>
              <div className="adm-ch__field">
                <label htmlFor="logoUrl">URL logo</label>
                <input
                  id="logoUrl"
                  name="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={handleFormChange}
                  placeholder="https://…"
                />
                {formData.logoUrl?.trim() ? (
                  <div className="adm-ch__logo-prev">
                    <img src={formData.logoUrl} alt="" />
                  </div>
                ) : null}
              </div>
              <div className="adm-ch__field">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleFormChange}
                  placeholder="https://…"
                />
              </div>
              <div className="adm-ch__field">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Mô tả ngắn"
                />
              </div>
              {modalMode === 'edit' && (
                <label className="adm-ch__check">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  Đang hoạt động
                </label>
              )}
              <div className="adm-ch__panel-actions">
                <button type="button" className="adm-ch__btn adm-ch__btn--ghost" onClick={handleCloseModal} disabled={submitting}>
                  Hủy
                </button>
                <button type="submit" className="adm-ch__btn adm-ch__btn--primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <FaSpinner className="adm-ch__spin-ico sm" aria-hidden /> Đang lưu…
                    </>
                  ) : (
                    <>
                      <FaSave aria-hidden /> Lưu
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaChainManagement;

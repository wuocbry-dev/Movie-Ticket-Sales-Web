import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaTrash, FaSearch, FaBuilding, FaUserTie, FaTimes, FaSpinner } from 'react-icons/fa';
import Cookies from 'js-cookie';
import { toast } from '../../utils/toast';
import './CinemaStaffManagement.css';
import { API_BASE_URL } from '../../config/api';

const CinemaStaffManagement = () => {
  const navigate = useNavigate();
  const token = Cookies.get('accessToken');

  const [staffList, setStaffList] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    userId: '',
    cinemaId: '',
    position: 'TICKET_CHECKER',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCinemaManager, setIsCinemaManager] = useState(false);
  const [managerCinemaId, setManagerCinemaId] = useState(null);
  const [listTick, setListTick] = useState(0);

  const bumpList = useCallback(() => setListTick((t) => t + 1), []);

  const fetchManagerCinema = useCallback(
    async (userId) => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/cinema-staffs/my-cinema?userId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.cinemaId) {
            setManagerCinemaId(data.cinemaId);
            setSelectedCinema(String(data.cinemaId));
          }
        }
      } catch {
        /* ignore */
      }
    },
    [token]
  );

  const fetchCinemas = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cinemas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Không thể tải rạp');
      const data = await response.json();
      let cinemaList = [];
      if (Array.isArray(data)) {
        cinemaList = data;
      } else if (data.data && Array.isArray(data.data.data)) {
        cinemaList = data.data.data;
      } else if (data.data && Array.isArray(data.data)) {
        cinemaList = data.data;
      }
      const activeCinemas = cinemaList.filter((c) => c.isActive === true);
      setCinemas(activeCinemas);
    } catch {
      toast.error('Không thể tải danh sách rạp');
    }
  }, [token, navigate]);

  const fetchAvailableStaffUsers = useCallback(async () => {
    if (!token || !selectedCinema) return;
    try {
      const response = await fetch(`${API_BASE_URL}/admin/roles/CINEMA_STAFF/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const userList = data.data || data || [];
        setAvailableUsers(Array.isArray(userList) ? userList : []);
      }
    } catch {
      toast.error('Không thể tải danh sách user CINEMA_STAFF');
    }
  }, [token, selectedCinema]);

  const fetchStaffByCinema = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (!selectedCinema) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/cinema-staffs/cinema/${selectedCinema}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStaffList(Array.isArray(data) ? data : []);
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.message || 'Không thể tải danh sách nhân viên');
        setStaffList([]);
      }
    } catch {
      toast.error('Không thể tải danh sách nhân viên');
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  }, [token, navigate, selectedCinema]);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        const userData = JSON.parse(raw);
        setCurrentUser(userData);
        const isManager = userData.roles && userData.roles.includes('CINEMA_MANAGER');
        setIsCinemaManager(isManager);
        if (isManager && !userData.roles.includes('SYSTEM_ADMIN')) {
          fetchManagerCinema(userData.userId);
        }
      } catch {
        /* ignore */
      }
    }
    fetchCinemas();
  }, [fetchCinemas, fetchManagerCinema]);

  useEffect(() => {
    fetchStaffByCinema();
  }, [fetchStaffByCinema, listTick]);

  useEffect(() => {
    fetchAvailableStaffUsers();
  }, [fetchAvailableStaffUsers, listTick]);

  const closeAssignModal = useCallback(() => setShowAssignModal(false), []);

  useEffect(() => {
    if (!showAssignModal) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeAssignModal();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [showAssignModal, closeAssignModal]);

  const openAssignModal = () => {
    setAssignForm({
      userId: '',
      cinemaId: selectedCinema || '',
      position: 'TICKET_CHECKER',
      notes: '',
    });
    setShowAssignModal(true);
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!assignForm.userId || !assignForm.cinemaId) {
      toast.error('Vui lòng chọn nhân viên và rạp');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinema-staffs/assign?assignedById=${currentUser?.userId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${Cookies.get('accessToken')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: parseInt(assignForm.userId, 10),
            cinemaId: parseInt(assignForm.cinemaId, 10),
            position: assignForm.position,
            notes: assignForm.notes,
          }),
        }
      );
      if (response.ok) {
        toast.success('Gán nhân viên vào rạp thành công!');
        setShowAssignModal(false);
        setAssignForm({
          userId: '',
          cinemaId: selectedCinema || '',
          position: 'TICKET_CHECKER',
          notes: '',
        });
        bumpList();
      } else {
        const error = await response.json().catch(() => ({}));
        toast.error(error.message || 'Không thể gán nhân viên');
      }
    } catch {
      toast.error('Có lỗi xảy ra khi gán nhân viên');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStaff = async (userId, cinemaId) => {
    if (!window.confirm('Bạn có chắc muốn cho nhân viên này nghỉ việc tại rạp?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/cinema-staffs/remove?userId=${userId}&cinemaId=${cinemaId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
        }
      );
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Đã cho nhân viên nghỉ việc tại rạp');
        bumpList();
      } else {
        toast.error(data.message || 'Không thể xóa nhân viên');
      }
    } catch {
      toast.error('Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = useMemo(
    () =>
      staffList.filter(
        (staff) =>
          staff.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          staff.position?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [staffList, searchTerm]
  );

  const getPositionLabel = (position) => {
    const positions = {
      TICKET_CHECKER: 'Kiểm vé',
      CASHIER: 'Thu ngân',
      CONCESSION: 'Bán bắp nước',
      GENERAL: 'Nhân viên chung',
    };
    return positions[position] || position;
  };

  const positionClass = (pos) => {
    const p = (pos || '').toLowerCase();
    if (p === 'ticket_checker') return 'adm-csf__pos-badge--ticket';
    if (p === 'cashier') return 'adm-csf__pos-badge--cashier';
    if (p === 'concession') return 'adm-csf__pos-badge--concession';
    return 'adm-csf__pos-badge--general';
  };

  return (
    <div className="adm-csf" role="main" aria-label="Quản lý nhân viên rạp">
      <div className="adm-csf__hero">
        <div className="adm-csf__titles">
          <h1 className="adm-csf__title">
            <FaUserTie /> Nhân viên rạp
          </h1>
          <p className="adm-csf__sub">Gán và quản lý nhân sự theo từng rạp</p>
        </div>
        <button type="button" className="adm-csf__btn adm-csf__btn--primary" onClick={openAssignModal}>
          <FaUserPlus /> Gán nhân viên
        </button>
      </div>

      <div className="adm-csf__toolbar">
        <div className="adm-csf__field">
          <label htmlFor="adm-csf-cinema">
            <FaBuilding /> Chọn rạp
          </label>
          <select
            id="adm-csf-cinema"
            value={selectedCinema}
            onChange={(e) => setSelectedCinema(e.target.value)}
          >
            <option value="">— Chọn rạp —</option>
            {cinemas.map((cinema) => (
              <option key={cinema.cinemaId || cinema.id} value={cinema.cinemaId || cinema.id}>
                {cinema.cinemaName}
              </option>
            ))}
          </select>
        </div>
        {selectedCinema && (
          <div className="adm-csf__search">
            <FaSearch className="adm-csf__search-ico" aria-hidden />
            <input
              type="text"
              placeholder="Tìm theo tên, email, vị trí..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </div>

      {selectedCinema ? (
        <div className="adm-csf__panel">
          {isLoading ? (
            <div className="adm-csf__state">
              <FaSpinner className="adm-csf__spin" />
              <p className="adm-csf__muted">Đang tải...</p>
            </div>
          ) : filteredStaff.length > 0 ? (
            <div className="adm-csf__table-wrap">
              <table className="adm-csf__table">
                <thead>
                  <tr>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Vị trí</th>
                    <th>Ngày bắt đầu</th>
                    <th>Trạng thái</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.fullName}</td>
                      <td>{staff.email}</td>
                      <td>{staff.phoneNumber || '—'}</td>
                      <td>
                        <span className={`adm-csf__pos-badge ${positionClass(staff.position)}`}>
                          {getPositionLabel(staff.position)}
                        </span>
                      </td>
                      <td>
                        {staff.startDate ? new Date(staff.startDate).toLocaleDateString('vi-VN') : '—'}
                      </td>
                      <td>
                        <span
                          className={`adm-csf__status ${staff.isActive ? 'adm-csf__status--on' : 'adm-csf__status--off'}`}
                        >
                          {staff.isActive ? 'Đang làm' : 'Đã nghỉ'}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="adm-csf__btn-icon"
                          onClick={() => handleRemoveStaff(staff.userId, staff.cinemaId)}
                          title="Cho nghỉ việc"
                          aria-label="Xóa khỏi rạp"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="adm-csf__empty">
              <FaUserTie className="adm-csf__empty-ico" />
              <p className="adm-csf__muted">Chưa có nhân viên nào được gán vào rạp này.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="adm-csf__empty">
          <FaBuilding className="adm-csf__empty-ico" />
          <p className="adm-csf__muted">Chọn rạp để xem danh sách nhân viên.</p>
        </div>
      )}

      {showAssignModal && (
        <div className="adm-csf__modal" role="presentation">
          <div
            className="adm-csf__modal-panel"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="adm-csf-modal-title"
          >
            <div className="adm-csf__modal-head">
              <h2 id="adm-csf-modal-title">
                <FaUserPlus /> Gán nhân viên vào rạp
              </h2>
              <button type="button" className="adm-csf__modal-x" onClick={closeAssignModal} aria-label="Đóng">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleAssignStaff}>
              <div className="adm-csf__modal-body">
                <div className="adm-csf__form-field">
                  <label htmlFor="adm-csf-user">
                    Nhân viên <span className="adm-csf__req">*</span>
                    <small className="adm-csf__hint"> (role CINEMA_STAFF)</small>
                  </label>
                  <select
                    id="adm-csf-user"
                    value={assignForm.userId}
                    onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                    required
                  >
                    <option value="">— Chọn —</option>
                    {availableUsers.map((user) => (
                      <option key={user.userId || user.id} value={user.userId || user.id}>
                        {user.fullName} ({user.email})
                      </option>
                    ))}
                  </select>
                  {availableUsers.length === 0 && (
                    <p className="adm-csf__warn">Chưa có user nào có role CINEMA_STAFF.</p>
                  )}
                </div>
                <div className="adm-csf__form-field">
                  <label htmlFor="adm-csf-assign-cinema">
                    Rạp <span className="adm-csf__req">*</span>
                  </label>
                  <select
                    id="adm-csf-assign-cinema"
                    value={assignForm.cinemaId}
                    onChange={(e) => setAssignForm({ ...assignForm, cinemaId: e.target.value })}
                    required
                    disabled={isCinemaManager && managerCinemaId}
                  >
                    <option value="">— Chọn —</option>
                    {cinemas.map((cinema) => (
                      <option key={cinema.cinemaId || cinema.id} value={cinema.cinemaId || cinema.id}>
                        {cinema.cinemaName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="adm-csf__form-field">
                  <label htmlFor="adm-csf-pos">Vị trí</label>
                  <select
                    id="adm-csf-pos"
                    value={assignForm.position}
                    onChange={(e) => setAssignForm({ ...assignForm, position: e.target.value })}
                  >
                    <option value="TICKET_CHECKER">Kiểm vé</option>
                    <option value="CASHIER">Thu ngân</option>
                    <option value="CONCESSION">Bán bắp nước</option>
                    <option value="GENERAL">Nhân viên chung</option>
                  </select>
                </div>
                <div className="adm-csf__form-field">
                  <label htmlFor="adm-csf-notes">Ghi chú</label>
                  <textarea
                    id="adm-csf-notes"
                    value={assignForm.notes}
                    onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })}
                    placeholder="Ghi chú..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="adm-csf__modal-foot">
                <button type="button" className="adm-csf__btn adm-csf__btn--ghost" onClick={closeAssignModal}>
                  Hủy
                </button>
                <button type="submit" className="adm-csf__btn adm-csf__btn--primary" disabled={isLoading}>
                  {isLoading ? 'Đang xử lý...' : 'Gán nhân viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CinemaStaffManagement;

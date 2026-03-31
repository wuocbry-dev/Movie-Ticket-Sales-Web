import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { Scanner } from '@yudiel/react-qr-scanner';
import Cookies from 'js-cookie';
import {
  FaTicketAlt,
  FaQrcode,
  FaSearch,
  FaBuilding,
  FaTimes,
} from 'react-icons/fa';
import './TicketCheckIn.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

function getStatusText(status) {
  const statusMap = {
    PENDING: 'Chưa thanh toán',
    CONFIRMED: 'Đã xác nhận',
    PAID: 'Đã thanh toán',
    COMPLETED: 'Đã check-in',
    CANCELLED: 'Đã hủy',
    REFUNDED: 'Đã hoàn tiền',
    CHECKED_IN: 'Đã check-in',
  };
  return statusMap[status] || 'Không hợp lệ';
}

function mapBookingToTicketInfo(data, staffCinema) {
  const tickets = data.tickets || [];
  const isCompleted = data.status === 'COMPLETED';
  const validStatuses = ['CONFIRMED', 'PAID'];
  const isStatusValid = validStatuses.includes(data.status);
  const hasCheckedInTicket = tickets.some(
    (t) => t.checkedInAt !== null && t.checkedInAt !== undefined
  );

  let cinemaName = staffCinema?.cinemaName;
  let cinemaId = staffCinema?.cinemaId;
  if (data.showtime?.hall?.cinema) {
    cinemaName = data.showtime.hall.cinema.cinemaName || cinemaName;
    cinemaId = data.showtime.hall.cinema.cinemaId || cinemaId;
  }

  const isValid = isStatusValid && !isCompleted && !hasCheckedInTicket;
  const seats = tickets.map((t) =>
    t.seat ? `${t.seat.seatRow}${t.seat.seatNumber}` : 'N/A'
  );
  const movieTitle = data.showtime?.movie?.title || 'N/A';
  const showDate = data.showtime?.showDate || 'N/A';
  const startTime = data.showtime?.startTime || 'N/A';
  const hallName = data.showtime?.hall?.hallName || 'N/A';

  return {
    ticketInfo: {
      bookingCode: data.bookingCode,
      customerName: data.customerName || 'N/A',
      movieTitle,
      showtime: startTime,
      date: showDate,
      hall: hallName,
      cinemaId,
      cinemaName,
      seats,
      totalTickets: data.totalSeats || seats.length,
      totalAmount: data.totalAmount || 0,
      status: isValid ? 'valid' : 'invalid',
      originalStatus:
        isCompleted || hasCheckedInTicket ? 'COMPLETED' : data.status,
      tickets,
    },
    alreadyCheckedIn: isCompleted || hasCheckedInTicket,
  };
}

const TicketCheckIn = () => {
  const navigate = useNavigate();
  const [bookingCode, setBookingCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [staffCinema, setStaffCinema] = useState(null);
  const qrHandledRef = useRef(false);

  useEffect(() => {
    const token = Cookies.get('accessToken');
    let user;
    try {
      user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      navigate('/login');
      return;
    }
    if (!token || !user.userId) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStaffCinema = async () => {
      const token = Cookies.get('accessToken');
      let user;
      try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        setStaffCinema(null);
        return;
      }
      const staffId = user.userId;
      if (!staffId || !token) {
        setStaffCinema(null);
        return;
      }
      try {
        const response = await fetch(
          `${API_BASE_URL}/tickets/staff/my-cinema?staffId=${staffId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) return;
        const json = await response.json();
        if (json.success === false) return;
        const payload = json.data !== undefined ? json.data : json;
        if (payload && (payload.cinemaId || payload.cinemaName)) {
          setStaffCinema(payload);
        }
      } catch {
        setStaffCinema(null);
      }
    };
    fetchStaffCinema();
  }, []);

  useEffect(() => {
    if (!showScanner) {
      document.body.style.overflow = '';
      qrHandledRef.current = false;
      return undefined;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') setShowScanner(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [showScanner]);

  const loadBookingByCode = useCallback(
    async (rawCode) => {
      const code = (rawCode || '').trim();
      if (!code) {
        toast.error('Vui lòng nhập mã đặt vé');
        return;
      }
      if (!staffCinema || !staffCinema.cinemaId) {
        toast.error('Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.');
        return;
      }

      setIsLoading(true);
      try {
        const token = Cookies.get('accessToken');
        const response = await fetch(
          `${API_BASE_URL}/tickets/staff/${staffCinema.cinemaId}/booking-details?bookingCode=${encodeURIComponent(code)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        const data = await response.json();

        if (!response.ok || data.success === false) {
          toast.error(data.message || 'Có lỗi xảy ra khi tìm kiếm vé');
          setIsLoading(false);
          return;
        }

        const { ticketInfo: mapped, alreadyCheckedIn } = mapBookingToTicketInfo(
          data,
          staffCinema
        );
        if (alreadyCheckedIn) {
          toast.warning('Vé đã được check-in trước đó! Không thể check-in lại.');
        }
        setTicketInfo(mapped);
        toast.success('Tìm thấy vé');
      } catch {
        toast.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } finally {
        setIsLoading(false);
      }
    },
    [staffCinema]
  );

  const handleScan = useCallback(() => {
    loadBookingByCode(bookingCode);
  }, [bookingCode, loadBookingByCode]);

  const handleCheckIn = useCallback(async () => {
    if (!ticketInfo) return;

    setIsLoading(true);
    try {
      let userInfo;
      try {
        userInfo = JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        toast.error('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        setIsLoading(false);
        return;
      }
      const staffId = userInfo.userId;
      if (!staffId) {
        toast.error('Không tìm thấy thông tin nhân viên. Vui lòng đăng nhập lại.');
        setIsLoading(false);
        return;
      }

      const token = Cookies.get('accessToken');
      const response = await fetch(`${API_BASE_URL}/tickets/check-in`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingCode,
          staffId,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Có lỗi xảy ra khi check-in';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          /* ignore */
        }
        toast.error(errorMessage);
        setIsLoading(false);
        return;
      }

      const activity = {
        type: 'check-in',
        title: 'Check-in vé thành công',
        details: `Mã vé: ${bookingCode} - Phim: ${ticketInfo.movieTitle} - Ghế: ${ticketInfo.seats.join(', ')}`,
        time: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        timestamp: Date.now(),
      };

      let activities = [];
      try {
        activities = JSON.parse(localStorage.getItem('staffActivities') || '[]');
        if (!Array.isArray(activities)) activities = [];
      } catch {
        activities = [];
      }
      activities.unshift(activity);
      if (activities.length > 20) activities.pop();
      localStorage.setItem('staffActivities', JSON.stringify(activities));

      toast.success('Check-in thành công!');
      setTicketInfo(null);
      setBookingCode('');
    } catch {
      toast.error('Không thể kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  }, [bookingCode, ticketInfo]);

  const handleReset = useCallback(() => {
    setBookingCode('');
    setTicketInfo(null);
  }, []);

  const openScanner = useCallback(() => {
    qrHandledRef.current = false;
    setShowScanner(true);
  }, []);

  const closeScanner = useCallback(() => setShowScanner(false), []);

  const handleQRScan = useCallback(
    (result) => {
      if (!result?.[0]?.rawValue || qrHandledRef.current) return;
      qrHandledRef.current = true;
      const scannedCode = result[0].rawValue;
      setBookingCode(scannedCode);
      setShowScanner(false);
      loadBookingByCode(scannedCode);
    },
    [loadBookingByCode]
  );

  const handleQRError = useCallback(() => {
    toast.error('Lỗi khi quét QR. Vui lòng thử lại!');
  }, []);

  return (
    <div className="stf-ci">
      <header className="stf-ci__head">
        <span className="stf-ci__head-ico" aria-hidden>
          <FaTicketAlt />
        </span>
        <div>
          <h1 className="stf-ci__title">Xác nhận check-in vé</h1>
          <p className="stf-ci__sub">
            Quét mã QR hoặc nhập mã đặt vé để xác nhận
          </p>
        </div>
        {staffCinema && (
          <div className="stf-ci__badge">
            <FaBuilding aria-hidden />
            <span>
              Đang làm việc tại: <strong>{staffCinema.cinemaName}</strong>
            </span>
          </div>
        )}
      </header>

      <section className="stf-ci__panel" aria-label="Tìm vé">
        <div className="stf-ci__row">
          <input
            className="stf-ci__input"
            type="text"
            placeholder="Nhập mã đặt vé (ví dụ: BK20241205001)"
            value={bookingCode}
            onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleScan();
            }}
            disabled={isLoading || !!ticketInfo}
            autoComplete="off"
          />
          <button
            type="button"
            className="stf-ci__btn stf-ci__btn--secondary"
            onClick={openScanner}
            disabled={isLoading || !!ticketInfo}
            title="Quét mã QR"
          >
            <FaQrcode aria-hidden /> Quét QR
          </button>
          <button
            type="button"
            className="stf-ci__btn stf-ci__btn--primary"
            onClick={handleScan}
            disabled={isLoading || !!ticketInfo}
          >
            <FaSearch aria-hidden /> {isLoading ? 'Đang tìm...' : 'Tìm vé'}
          </button>
        </div>

        {showScanner && (
          <div
            className="stf-ci__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Quét mã QR vé"
          >
            <div className="stf-ci__modal-inner">
              <button
                type="button"
                className="stf-ci__modal-close"
                onClick={closeScanner}
                aria-label="Đóng"
              >
                <FaTimes aria-hidden />
              </button>
              <h2 className="stf-ci__modal-title">Quét mã QR vé</h2>
              <div className="stf-ci__scanner">
                <Scanner
                  onScan={handleQRScan}
                  onError={handleQRError}
                  containerStyle={{ width: '100%' }}
                  videoStyle={{ width: '100%', borderRadius: '12px' }}
                />
                <p className="stf-ci__scanner-hint">
                  Đưa mã QR vào khung hình để quét
                </p>
              </div>
            </div>
          </div>
        )}

        {ticketInfo && (
          <article className="stf-ci__card">
            <div className="stf-ci__card-head">
              <h2 className="stf-ci__card-title">Thông tin vé</h2>
              <span
                className={`stf-ci__status stf-ci__status--${ticketInfo.status}`}
              >
                {ticketInfo.status === 'valid'
                  ? 'Hợp lệ'
                  : getStatusText(ticketInfo.originalStatus)}
              </span>
            </div>

            <dl className="stf-ci__details">
              <div className="stf-ci__detail">
                <dt>Mã đặt vé</dt>
                <dd>{ticketInfo.bookingCode}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Họ và tên</dt>
                <dd>{ticketInfo.customerName}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Phim</dt>
                <dd>{ticketInfo.movieTitle}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Rạp</dt>
                <dd className="stf-ci__detail--accent">{ticketInfo.cinemaName}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Ngày chiếu</dt>
                <dd>{ticketInfo.date}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Suất chiếu</dt>
                <dd>{ticketInfo.showtime}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Phòng</dt>
                <dd>{ticketInfo.hall}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Ghế</dt>
                <dd>{ticketInfo.seats.join(', ')}</dd>
              </div>
              <div className="stf-ci__detail">
                <dt>Tổng vé</dt>
                <dd>{ticketInfo.totalTickets} vé</dd>
              </div>
              <div className="stf-ci__detail stf-ci__detail--total">
                <dt>Tổng tiền</dt>
                <dd>
                  {ticketInfo.totalAmount.toLocaleString('vi-VN')} ₫
                </dd>
              </div>
            </dl>

            <div className="stf-ci__actions">
              <button
                type="button"
                className="stf-ci__btn stf-ci__btn--confirm"
                onClick={handleCheckIn}
                disabled={isLoading || ticketInfo.status !== 'valid'}
              >
                Xác nhận check-in
              </button>
              <button
                type="button"
                className="stf-ci__btn stf-ci__btn--ghost"
                onClick={handleReset}
                disabled={isLoading}
              >
                Hủy
              </button>
            </div>
          </article>
        )}
      </section>
    </div>
  );
};

export default TicketCheckIn;

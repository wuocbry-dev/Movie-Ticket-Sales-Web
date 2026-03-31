import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { FaCouch, FaTv, FaArrowLeft, FaClock } from 'react-icons/fa';
import seatService from '../../services/seatService';
import showtimeService from '../../services/showtimeService';
import cinemaHallService from '../../services/cinemaHallService';
import './SeatSelection.css';

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  
  const [showtime, setShowtime] = useState(null);
  const [hallInfo, setHallInfo] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sessionId] = useState(() => `UUID-${Date.now()}-HOLD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút
  const [holdTimer, setHoldTimer] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const seatmapViewportRef = useRef(null);
  const seatmapInnerRef = useRef(null);

  useEffect(() => {
    // Lấy email user nếu đã đăng nhập
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const user = JSON.parse(userStr);
        setUserEmail(user.email || null);
      }
    } catch (e) {
      console.error('Error getting user email:', e);
    }

    fetchShowtimeAndSeats();
    
    return () => {
      // Cleanup: release seats khi rời trang
      if (selectedSeats.length > 0) {
        releaseAllSeats();
      }
      if (holdTimer) {
        clearInterval(holdTimer);
      }
    };
  }, [showtimeId]);

  // Countdown timer
  useEffect(() => {
    if (selectedSeats.length > 0 && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      // Gia hạn khi còn 60 giây
      if (timeLeft === 60) {
        extendSeatHold();
      }

      // Hết thời gian
      if (timeLeft === 0) {
        toast.error('Hết thời gian giữ ghế. Vui lòng chọn lại!');
        releaseAllSeats();
        setSelectedSeats([]);
      }

      return () => clearTimeout(timer);
    }
  }, [timeLeft, selectedSeats]);

  const fetchShowtimeAndSeats = async () => {
    try {
      setLoading(true);
      
      // Lấy thông tin suất chiếu
      const showtimeResponse = await showtimeService.getShowtimeById(showtimeId);
      if (showtimeResponse.success) {
        setShowtime(showtimeResponse.data);
        
        // Lấy thông tin phòng chiếu
        const hallResponse = await cinemaHallService.getHallById(showtimeResponse.data.hallId);
        if (hallResponse.success) {
          setHallInfo(hallResponse.data);
          console.log('Hall info:', hallResponse.data);
        }
      }

      // Lấy sơ đồ ghế
      const seatsResponse = await seatService.getSeatAvailability(showtimeId, sessionId);
      console.log('Seats response:', seatsResponse);
      if (seatsResponse && seatsResponse.seats) {
        setSeats(seatsResponse.seats);
        console.log('Loaded seats:', seatsResponse.seats.length);
      } else {
        toast.warning('Không có ghế nào trong phòng chiếu này');
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Không thể tải sơ đồ ghế');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = async (seat) => {
    console.log('=== Seat Clicked ===');
    console.log('Seat Object:', seat);
    console.log('Seat ID:', seat.seatId);
    console.log('Seat Position:', `${seat.seatRow}${seat.seatNumber}`);
    console.log('Seat Type:', seat.seatType);
    console.log('Seat Status:', seat.status);
    
    // Không cho chọn ghế đã bán hoặc đang giữ bởi người khác
    if (seat.status === 'SOLD' || seat.status === 'BOOKED') {
      toast.warning('Ghế này đã được đặt');
      return;
    }

    if (seat.status === 'HELD' && seat.sessionId !== sessionId) {
      toast.warning('Ghế này đang được giữ bởi người khác');
      return;
    }

    // Tối đa 10 ghế
    if (selectedSeats.length >= 10 && !selectedSeats.find(s => s.seatId === seat.seatId)) {
      toast.warning('Bạn chỉ có thể chọn tối đa 10 ghế');
      return;
    }

    const isSelected = selectedSeats.find(s => s.seatId === seat.seatId);

    if (isSelected) {
      // Bỏ chọn ghế
      try {
        console.log('🔓 Releasing seat:', seat.seatId);
        await seatService.releaseSeats(sessionId, parseInt(showtimeId), [seat.seatId]);
        setSelectedSeats(selectedSeats.filter(s => s.seatId !== seat.seatId));
        
        // Cập nhật trạng thái ghế
        setSeats(seats.map(s => 
          s.seatId === seat.seatId ? { ...s, status: 'AVAILABLE' } : s
        ));
        
        toast.success(`Đã bỏ chọn ghế ${seat.seatRow}${seat.seatNumber}`);
      } catch (error) {
        console.error('❌ Error releasing seat:', error);
        toast.error('Không thể bỏ chọn ghế');
      }
    } else {
      // Chọn ghế - Hold TẤT CẢ ghế (đã chọn + ghế mới)
      try {
        const newSelectedSeats = [...selectedSeats, seat];
        const allSeatIds = newSelectedSeats.map(s => s.seatId);
        
        const holdRequest = {
          showtimeId: parseInt(showtimeId),
          seatIds: allSeatIds, // Hold ALL seats at once
          sessionId: sessionId,
          customerEmail: userEmail
        };
        
        console.log('🔒 === HOLD ALL SEATS REQUEST ===');
        console.log('Request Body:', JSON.stringify(holdRequest, null, 2));
        console.log(`Holding ${allSeatIds.length} seat(s) including new: ${seat.seatRow}${seat.seatNumber}`);
        
        const holdResponse = await seatService.holdSeats(holdRequest);
        
        console.log('✅ Hold Response:', holdResponse);
        toast.success(`Đã chọn ghế ${seat.seatRow}${seat.seatNumber}`);

        setSelectedSeats(newSelectedSeats);
        
        // Cập nhật trạng thái tất cả ghế
        setSeats(seats.map(s => 
          allSeatIds.includes(s.seatId) ? { ...s, status: 'HELD', sessionId } : s
        ));

        // Reset timer
        if (selectedSeats.length === 0) {
          setTimeLeft(300);
        }
      } catch (error) {
        console.error('❌ Error holding seats:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.error(`Không thể giữ ghế ${seat.seatRow}${seat.seatNumber}: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const extendSeatHold = async () => {
    if (selectedSeats.length > 0) {
      try {
        const seatIds = selectedSeats.map(s => s.seatId);
        await seatService.extendHold(sessionId, parseInt(showtimeId), seatIds, 5);
        setTimeLeft(300); // Reset về 5 phút
      } catch (error) {
        console.error('Error extending hold:', error);
      }
    }
  };

  const releaseAllSeats = async () => {
    if (selectedSeats.length > 0) {
      try {
        const seatIds = selectedSeats.map(s => s.seatId);
        await seatService.releaseSeats(sessionId, parseInt(showtimeId), seatIds);
      } catch (error) {
        console.error('Error releasing seats:', error);
      }
    }
  };

  const getSeatTypeFromLayout = (row, number) => {
    if (!hallInfo || !hallInfo.seatLayout) return 'STANDARD';
    
    const seatKey = `${row}${number}`;
    const layout = hallInfo.seatLayout;
    
    // Kiểm tra ghế cụ thể
    if (layout[seatKey]) {
      return layout[seatKey];
    }
    
    // Kiểm tra theo hàng
    if (layout.VIP_Rows && layout.VIP_Rows.includes(row)) {
      return 'VIP';
    }
    if (layout.COUPLE_Rows && layout.COUPLE_Rows.includes(row)) {
      return 'COUPLE';
    }
    if (layout.WHEELCHAIR_Rows && layout.WHEELCHAIR_Rows.includes(row)) {
      return 'WHEELCHAIR';
    }
    
    return 'STANDARD';
  };

  const getSeatClass = (seat) => {
    const isSelected = selectedSeats.find(s => s.seatId === seat.seatId);
    
    if (isSelected) return 'seat selected';
    if (seat.status === 'SOLD' || seat.status === 'BOOKED') return 'seat sold';
    if (seat.status === 'HELD' && seat.sessionId !== sessionId) return 'seat held';
    
    // Lấy loại ghế từ layout hoặc từ database
    const seatType = hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType;
    
    // Màu theo loại ghế
    switch (seatType) {
      case 'VIP':
        return 'seat vip';
      case 'COUPLE':
        return 'seat couple';
      case 'WHEELCHAIR':
        return 'seat wheelchair';
      case 'STANDARD':
      default:
        return 'seat available';
    }
  };

  const getSeatPrice = (seat) => {
    if (!showtime) return 0;
    
    const basePrice = showtime.basePrice || 0;
    const seatType = hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType;
    
    switch (seatType) {
      case 'VIP':
        return basePrice * 1.5;
      case 'COUPLE':
        return basePrice * 2;
      case 'WHEELCHAIR':
        return basePrice * 0.8; // Giảm giá cho người khuyết tật
      case 'STANDARD':
      default:
        return basePrice;
    }
  };

  const getTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatPrice(seat), 0);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDateVi = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isAisleAfterRow = (row) => {
    if (!hallInfo || !hallInfo.seatLayout || !hallInfo.seatLayout.aisles) return false;
    
    // Kiểm tra xem có lối đi sau hàng này không (ví dụ: "B-C" nghĩa là lối đi giữa B và C)
    return hallInfo.seatLayout.aisles.some(aisle => {
      const [beforeRow] = aisle.split('-');
      return beforeRow === row;
    });
  };

  const groupSeatsByRow = () => {
    const grouped = {};
    seats.forEach(seat => {
      if (!grouped[seat.seatRow]) {
        grouped[seat.seatRow] = [];
      }
      grouped[seat.seatRow].push(seat);
    });
    
    // Sắp xếp theo số ghế
    Object.keys(grouped).forEach(row => {
      grouped[row].sort((a, b) => a.seatNumber - b.seatNumber);
    });
    
    return grouped;
  };

  const copyRequestToClipboard = () => {
    const requestBody = {
      showtimeId: parseInt(showtimeId),
      seatIds: selectedSeats.map(s => s.seatId),
      sessionId: sessionId,
      customerEmail: userEmail
    };
    
    navigator.clipboard.writeText(JSON.stringify(requestBody, null, 2));
    toast.success('Đã copy request body vào clipboard!');
    console.log('📋 Request Body Copied:', requestBody);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một ghế');
      return;
    }

    console.log('🎬 Navigating to booking confirmation with data:', {
      selectedSeats: selectedSeats.map(s => ({ seatId: s.seatId, row: s.seatRow, number: s.seatNumber })),
      totalPrice: getTotalPrice(),
      sessionId,
      showtime
    });

    // Chuyển sang trang xác nhận booking
    navigate(`/booking-confirmation`, {
      state: {
        selectedSeats,
        totalPrice: getTotalPrice(),
        sessionId,
        showtime
      }
    });
  };

  const groupedSeats = groupSeatsByRow();
  const fallbackRows = Object.keys(groupedSeats).sort();
  const rowsCount = hallInfo?.rowsCount ? parseInt(hallInfo.rowsCount) : null;
  const seatsPerRow = hallInfo?.seatsPerRow ? parseInt(hallInfo.seatsPerRow) : null;

  const rows = Number.isFinite(rowsCount) && rowsCount > 0
    ? Array.from({ length: rowsCount }, (_, i) => String.fromCharCode(65 + i))
    : fallbackRows;

  const derivedSeatsPerRow = Number.isFinite(seatsPerRow) && seatsPerRow > 0
    ? seatsPerRow
    : seats.reduce((max, s) => Math.max(max, s?.seatNumber || 0), 0);

  const seatLookup = new Map();
  seats.forEach((s) => {
    if (s?.seatRow && typeof s?.seatNumber === 'number') {
      seatLookup.set(`${s.seatRow}${s.seatNumber}`, s);
    }
  });

  const verticalAisleAfter = new Set();
  const verticalAisles = hallInfo?.seatLayout?.verticalAisles;
  if (Array.isArray(verticalAisles)) {
    verticalAisles.forEach((a) => {
      const [beforeCol] = String(a).split('-').map(x => parseInt(x, 10));
      if (Number.isFinite(beforeCol)) verticalAisleAfter.add(beforeCol);
    });
  }

  const seatmapLayoutKey = `${showtimeId}|${hallInfo?.hallId ?? hallInfo?.id ?? ''}|r:${rows.join('')}` +
    `|c:${derivedSeatsPerRow}|va:${Array.from(verticalAisleAfter).sort((a, b) => a - b).join(',')}`;

  useEffect(() => {
    const viewport = seatmapViewportRef.current;
    const inner = seatmapInnerRef.current;
    if (!viewport || !inner) return;

    let rafId = 0;
    const updateScale = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const vw = viewport.clientWidth;
        const iw = inner.scrollWidth;
        if (!vw || !iw) return;

        // Fit-to-width on small screens; keep 1:1 on desktop
        const target = Math.max(0, vw - 2); // small buffer to avoid subpixel overflow
        let scale = Math.min(1, target / iw);
        scale = Math.max(0.72, scale); // don't get too tiny; fallback to vertical scroll if needed

        viewport.style.setProperty('--ssx-map-scale', String(Number(scale.toFixed(3))));
      });
    };

    updateScale();

    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateScale);
      ro.observe(viewport);
      ro.observe(inner);
    } else {
      window.addEventListener('resize', updateScale);
    }

    const vv = window.visualViewport;
    if (vv?.addEventListener) vv.addEventListener('resize', updateScale);

    return () => {
      cancelAnimationFrame(rafId);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', updateScale);
      if (vv?.removeEventListener) vv.removeEventListener('resize', updateScale);
    };
  }, [seatmapLayoutKey]);

  if (loading) {
    return (
      <div className="ssx ssx--state">
        <div className="ssx__state-card" role="status" aria-live="polite">
          <div className="ssx__spinner" aria-hidden="true" />
          <div className="ssx__state-title">Đang tải sơ đồ ghế…</div>
          <div className="ssx__state-sub">Vui lòng chờ trong giây lát</div>
        </div>
      </div>
    );
  }

  if (!showtime) {
    return (
      <div className="ssx ssx--state">
        <div className="ssx__state-card" role="alert">
          <div className="ssx__state-title">Không tìm thấy suất chiếu</div>
          <div className="ssx__state-sub">Vui lòng quay lại và chọn suất chiếu khác.</div>
          <button className="ssx__btn ssx__btn--ghost" onClick={() => navigate(-1)} type="button">
            <FaArrowLeft aria-hidden="true" /> Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ssx" aria-label="Chọn ghế">
      <header className="ssx__topbar">
        <div className="ssx__topbar-left">
          <button className="ssx__btn ssx__btn--ghost" onClick={() => navigate(-1)} type="button">
            <FaArrowLeft aria-hidden="true" /> Quay lại
          </button>
          <div className="ssx__where">
            <div className="ssx__where-title">{showtime.cinemaName} · {showtime.hallName}</div>
            <div className="ssx__where-sub">{formatDateVi(showtime.showDate)} · {showtime.startTime?.substring(0, 5)}</div>
          </div>
        </div>

        <div className="ssx__topbar-center" title={showtime.movieTitle}>
          {showtime.movieTitle}
        </div>

        <div className="ssx__topbar-right">
          <div className={`ssx__hold ${timeLeft <= 60 ? 'ssx__hold--warn' : ''}`} aria-label="Thời gian giữ ghế">
            <FaClock aria-hidden="true" />
            <span>{formatTime(timeLeft)}</span>
          </div>
          {userEmail ? <div className="ssx__pill" title={userEmail}>{userEmail}</div> : null}
          {hallInfo?.screenType ? <div className="ssx__pill">{hallInfo.screenType}</div> : null}
        </div>
      </header>

      <main className="ssx__layout">
        <section className="ssx__stage" aria-label="Sơ đồ ghế">
          <div className="ssx__stage-head">
            <div className="ssx__legend" aria-label="Chú thích">
              <div className="ssx__legend-item"><span className="ssx__swatch ssx__swatch--std" /> Thường</div>
              <div className="ssx__legend-item"><span className="ssx__swatch ssx__swatch--vip" /> VIP</div>
              <div className="ssx__legend-item"><span className="ssx__swatch ssx__swatch--couple" /> Couple</div>
              <div className="ssx__legend-item"><span className="ssx__swatch ssx__swatch--wheel" /> Wheelchair</div>
              <div className="ssx__legend-item"><span className="ssx__swatch ssx__swatch--sel" /> Đang chọn</div>
              <div className="ssx__legend-item"><span className="ssx__swatch ssx__swatch--sold" /> Đã bán/giữ</div>
            </div>
          </div>

          <div
            className="ssx__seatmap"
            role="grid"
            aria-label="Sơ đồ ghế"
            ref={seatmapViewportRef}
          >
            <div className="ssx__seatmap-inner" ref={seatmapInnerRef}>
              <div className="ssx__screen-wrap" aria-hidden="true">
                <div className="ssx__screen-tv">
                  <FaTv aria-hidden="true" />
                  <span className="ssx__screen-tv-text">MÀN HÌNH</span>
                </div>
              </div>
              {rows.map((row) => (
                <React.Fragment key={row}>
                  <div className="ssx__row" role="row" aria-label={`Hàng ${row}`}>
                    <div className="ssx__row-label" aria-hidden="true">{row}</div>
                    <div className="ssx__row-seats">
                      {Array.from({ length: derivedSeatsPerRow }, (_, idx) => {
                        const seatNumber = idx + 1;
                        const key = `${row}${seatNumber}`;
                        const seat = seatLookup.get(key);

                        const seatType = seat
                          ? (hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType)
                          : (hallInfo ? getSeatTypeFromLayout(row, seatNumber) : 'STANDARD');

                        const disabled = !seat || seat.status === 'SOLD' || seat.status === 'BOOKED' ||
                          (seat.status === 'HELD' && seat.sessionId !== sessionId);

                        const cls = seat
                          ? getSeatClass(seat)
                              .replace(/\bseat\b/g, 'ssx__seat')
                              .replace(/\bavailable\b/g, 'ssx__seat--std')
                              .replace(/\bvip\b/g, 'ssx__seat--vip')
                              .replace(/\bcouple\b/g, 'ssx__seat--couple')
                              .replace(/\bwheelchair\b/g, 'ssx__seat--wheel')
                              .replace(/\bselected\b/g, 'ssx__seat--sel')
                              .replace(/\bsold\b/g, 'ssx__seat--sold')
                              .replace(/\bheld\b/g, 'ssx__seat--sold')
                          : 'ssx__seat ssx__seat--gap';

                        return (
                          <React.Fragment key={key}>
                            {seat ? (
                              <button
                                type="button"
                                className={cls}
                                onClick={() => handleSeatClick(seat)}
                                disabled={disabled}
                                aria-label={`${row}${seatNumber} · ${seatType} · ${formatPrice(getSeatPrice(seat))}${disabled ? ' · Không khả dụng' : ''}`}
                                title={`${row}${seatNumber} - ${seatType} - ${formatPrice(getSeatPrice(seat))}`}
                              >
                                <FaCouch aria-hidden="true" className="ssx__seat-ico" />
                                <span className="ssx__seat-no">{seatNumber}</span>
                              </button>
                            ) : (
                              <span className={cls} aria-hidden="true" />
                            )}
                            {verticalAisleAfter.has(seatNumber) ? <span className="ssx__v-aisle" aria-hidden="true" /> : null}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    <div className="ssx__row-label" aria-hidden="true">{row}</div>
                  </div>
                  {isAisleAfterRow(row) ? <div className="ssx__aisle" aria-hidden="true">LỐI ĐI</div> : null}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        <aside className="ssx__summary" aria-label="Tóm tắt">
          <div className="ssx__summary-head">
            <div className="ssx__summary-title">Thông tin đặt vé</div>
            <div className="ssx__summary-sub">Ghế đã chọn: <strong>{selectedSeats.length}</strong></div>
          </div>

          <div className="ssx__picked">
            {selectedSeats.length === 0 ? (
              <div className="ssx__empty">Chọn ghế bên trái để bắt đầu.</div>
            ) : (
              selectedSeats.map(seat => {
                const seatType = hallInfo ? getSeatTypeFromLayout(seat.seatRow, seat.seatNumber) : seat.seatType;
                return (
                  <div key={seat.seatId} className="ssx__picked-item">
                    <div className="ssx__picked-left">
                      <div className="ssx__picked-code">{seat.seatRow}{seat.seatNumber}</div>
                      <div className={`ssx__picked-type ssx__picked-type--${String(seatType || '').toLowerCase()}`}>
                        {seatType}
                      </div>
                    </div>
                    <div className="ssx__picked-price">{formatPrice(getSeatPrice(seat))}</div>
                  </div>
                );
              })
            )}
          </div>

          <div className="ssx__total">
            <span>Tổng cộng</span>
            <strong>{formatPrice(getTotalPrice())}</strong>
          </div>

          <button
            type="button"
            className="ssx__btn ssx__btn--primary"
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
          >
            Tiếp tục
          </button>

          <div className="ssx__hint">
            - Giữ ghế tối đa 5 phút (tự gia hạn khi còn 60s)<br />
            - Tối đa 10 ghế / lần đặt
          </div>
        </aside>
      </main>

      <div className="ssx__bottom" aria-label="Thanh tóm tắt (mobile)">
        <div className="ssx__bottom-left">
          <div className="ssx__bottom-line">Ghế: <strong>{selectedSeats.map(s => `${s.seatRow}${s.seatNumber}`).join(', ') || '—'}</strong></div>
          <div className="ssx__bottom-line">Tổng: <strong>{formatPrice(getTotalPrice())}</strong></div>
        </div>
        <button
          type="button"
          className="ssx__btn ssx__btn--primary ssx__bottom-cta"
          onClick={handleContinue}
          disabled={selectedSeats.length === 0}
        >
          Tiếp tục
        </button>
      </div>
    </div>
  );
};

export default SeatSelection;

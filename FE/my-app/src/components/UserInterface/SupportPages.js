import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/api';
import './SupportPages.css';

/* ─── Shared Section Wrapper ─── */
const SupportLayout = ({ title, children }) => (
  <div className="support-page">
    <div className="support-hero">
      <h1 className="support-hero-title">{title}</h1>
    </div>
    <div className="support-container">{children}</div>
  </div>
);

/* ═══════════════════════════════════════
   1. HƯỚNG DẪN ĐẶT VÉ
═══════════════════════════════════════ */
export const BookingGuidePage = () => {
  const [cinemas, setCinemas] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cinemaRes, movieRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/cinemas`),
          axios.get(`${API_BASE_URL}/movies?status=NOW_SHOWING&limit=6`),
        ]);
        setCinemas(cinemaRes.data?.data?.slice(0, 6) || []);
        const moviesData = movieRes.data?.data;
        setMovies(Array.isArray(moviesData) ? moviesData.slice(0, 6) : (moviesData?.content || []).slice(0, 6));
      } catch (_) {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const steps = [
    { icon: '🎬', title: 'Chọn phim', desc: 'Duyệt danh sách phim đang chiếu hoặc sắp chiếu và chọn phim bạn muốn xem.' },
    { icon: '🏟️', title: 'Chọn rạp & suất chiếu', desc: 'Chọn rạp gần bạn, sau đó chọn ngày và giờ chiếu phù hợp.' },
    { icon: '💺', title: 'Chọn ghế', desc: 'Chọn vị trí ghế ngồi yêu thích trên sơ đồ rạp theo thời gian thực.' },
    { icon: '🍿', title: 'Thêm bắp nước (tuỳ chọn)', desc: 'Thêm combo bắp nước, đồ ăn nhẹ để có trải nghiệm hoàn hảo hơn.' },
    { icon: '💳', title: 'Thanh toán', desc: 'Thanh toán nhanh chóng qua VNPay, thẻ ngân hàng hoặc ví điện tử.' },
    { icon: '🎟️', title: 'Nhận vé', desc: 'Vé điện tử gửi về email. Xuất trình mã QR tại rạp để check-in.' },
  ];

  return (
    <SupportLayout title="Hướng Dẫn Đặt Vé">
      {/* Steps */}
      <section className="support-section">
        <h2 className="support-section-title">Các bước đặt vé</h2>
        <div className="guide-steps">
          {steps.map((s, i) => (
            <div className="guide-step" key={i}>
              <div className="guide-step-num">{i + 1}</div>
              <div className="guide-step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live cinemas from API */}
      {!loading && cinemas.length > 0 && (
        <section className="support-section">
          <h2 className="support-section-title">Hệ thống rạp đang hoạt động</h2>
          <div className="support-grid-3">
            {cinemas.map(c => (
              <Link to="/cinemas" key={c.cinemaId || c.id} className="support-card">
                <span className="support-card-icon">🏟️</span>
                <strong>{c.cinemaName || c.name}</strong>
                <span>{c.address}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Live movies from API */}
      {!loading && movies.length > 0 && (
        <section className="support-section">
          <h2 className="support-section-title">Phim đang chiếu</h2>
          <div className="support-grid-3">
            {movies.map(m => (
              <Link to={`/movie/${m.movieId || m.id}`} key={m.movieId || m.id} className="support-card support-movie-card">
                {m.posterUrl && <img src={m.posterUrl} alt={m.title} className="support-movie-poster" />}
                <strong>{m.title}</strong>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="support-cta">
        <Link to="/" className="support-cta-btn">Đặt vé ngay →</Link>
      </div>
    </SupportLayout>
  );
};

/* ═══════════════════════════════════════
   2. CÂU HỎI THƯỜNG GẶP
═══════════════════════════════════════ */
export const FAQPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [openIdx, setOpenIdx] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/promotions`).then(res => {
      const data = res.data?.data;
      setPromotions(Array.isArray(data) ? data.slice(0, 4) : (data?.content || []).slice(0, 4));
    }).catch(() => {});
  }, []);

  const faqs = [
    { q: 'Làm thế nào để đặt vé?', a: 'Vào trang chủ, chọn phim → chọn rạp và suất chiếu → chọn ghế → thanh toán → nhận vé qua email.' },
    { q: 'Tôi có thể huỷ vé sau khi đặt không?', a: 'Vé đã thanh toán không thể huỷ. Trong trường hợp sự cố kỹ thuật, vui lòng liên hệ hotline trong vòng 24 giờ.' },
    { q: 'Phương thức thanh toán nào được chấp nhận?', a: 'Chúng tôi chấp nhận VNPay, thẻ ATM nội địa, thẻ Visa/MasterCard và các ví điện tử phổ biến.' },
    { q: 'Làm sao nhận được vé sau khi thanh toán?', a: 'Vé điện tử sẽ được gửi về email và hiển thị trong mục "Lịch sử đặt vé" của tài khoản. Bạn chỉ cần xuất trình mã QR tại rạp.' },
    { q: 'Tôi quên mật khẩu phải làm sao?', a: 'Nhấn "Quên mật khẩu" ở trang đăng nhập, nhập email và làm theo hướng dẫn gửi về email.' },
    { q: 'Điểm thành viên tích luỹ như thế nào?', a: 'Mỗi lần đặt vé thành công bạn sẽ được cộng điểm. Điểm có thể dùng để giảm giá vé các lần sau.' },
    { q: 'Các mã giảm giá có hạn sử dụng không?', a: 'Có, mỗi mã giảm giá có ngày hết hạn riêng. Kiểm tra ngày hết hạn trước khi sử dụng tại trang Khuyến Mãi.' },
    { q: 'Tôi cần hỗ trợ ngay, liên hệ đâu?', a: 'Gọi hotline 0877 999 484 hoặc email nguyenvanquoc11112004@gmail.com (8:00–22:00 hàng ngày).' },
  ];

  return (
    <SupportLayout title="Câu Hỏi Thường Gặp">
      <section className="support-section">
        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className={`faq-item ${openIdx === i ? 'open' : ''}`} key={i} onClick={() => setOpenIdx(openIdx === i ? null : i)}>
              <div className="faq-question">
                <span>{f.q}</span>
                <span className="faq-arrow">{openIdx === i ? '▲' : '▼'}</span>
              </div>
              {openIdx === i && <div className="faq-answer">{f.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="support-section">
          <h2 className="support-section-title">Khuyến mãi đang áp dụng</h2>
          <div className="support-grid-2">
            {promotions.map(p => (
              <Link to="/promotions" key={p.promotionId || p.id} className="support-card support-promo-card">
                <span className="support-card-icon">🎁</span>
                <strong>{p.promotionName || p.name}</strong>
                <span className="support-promo-code">Mã: {p.promotionCode || p.code}</span>
                <span>Giảm: {Number(p.discountValue).toLocaleString('vi-VN')}đ</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </SupportLayout>
  );
};

/* ═══════════════════════════════════════
   3. ĐIỀU KHOẢN SỬ DỤNG
═══════════════════════════════════════ */
export const TermsPage = () => (
  <SupportLayout title="Điều Khoản Sử Dụng">
    {[
      { title: '1. Chấp nhận điều khoản', content: 'Khi sử dụng dịch vụ Q2K Cinema, bạn đồng ý tuân thủ các điều khoản sử dụng này. Nếu không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.' },
      { title: '2. Tài khoản người dùng', content: 'Bạn chịu trách nhiệm bảo mật thông tin đăng nhập. Không chia sẻ tài khoản với người khác. Q2K Cinema không chịu trách nhiệm về thiệt hại do mất tài khoản.' },
      { title: '3. Đặt vé và thanh toán', content: 'Giao dịch đặt vé được xác nhận sau khi thanh toán thành công. Giá vé có thể thay đổi tuỳ theo suất chiếu, ngày, loại ghế và chương trình khuyến mãi.' },
      { title: '4. Chính sách hoàn vé', content: 'Vé đã thanh toán không được hoàn tiền. Trong trường hợp rạp huỷ suất chiếu, chúng tôi sẽ hoàn tiền hoặc đổi vé theo chính sách hiện hành.' },
      { title: '5. Sở hữu trí tuệ', content: 'Toàn bộ nội dung trên website (logo, hình ảnh, văn bản) là tài sản của Q2K Cinema hoặc được sử dụng có bản quyền. Không sao chép khi chưa được phép.' },
      { title: '6. Giới hạn trách nhiệm', content: 'Q2K Cinema không chịu trách nhiệm về các thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ, bao gồm mất dữ liệu hoặc gián đoạn dịch vụ.' },
      { title: '7. Thay đổi điều khoản', content: 'Chúng tôi có quyền cập nhật điều khoản bất kỳ lúc nào. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa bạn chấp nhận điều khoản mới.' },
    ].map((section, i) => (
      <section className="support-section support-terms-section" key={i}>
        <h2 className="support-section-title">{section.title}</h2>
        <p className="support-text">{section.content}</p>
      </section>
    ))}
    <p className="support-last-updated">Cập nhật lần cuối: 12/05/2025</p>
  </SupportLayout>
);

/* ═══════════════════════════════════════
   4. CHÍNH SÁCH BẢO MẬT
═══════════════════════════════════════ */
export const PrivacyPage = () => (
  <SupportLayout title="Chính Sách Bảo Mật">
    {[
      { title: '1. Thông tin chúng tôi thu thập', content: 'Chúng tôi thu thập họ tên, email, số điện thoại, ngày sinh khi bạn đăng ký tài khoản. Ngoài ra, thông tin thanh toán và lịch sử đặt vé cũng được lưu trữ để phục vụ dịch vụ.' },
      { title: '2. Mục đích sử dụng thông tin', content: 'Thông tin được dùng để xử lý đặt vé, gửi vé điện tử, thông báo khuyến mãi (nếu bạn đồng ý), hỗ trợ khách hàng và cải thiện dịch vụ.' },
      { title: '3. Bảo mật thông tin', content: 'Chúng tôi áp dụng mã hóa SSL, lưu trữ mật khẩu bằng BCrypt và giới hạn quyền truy cập dữ liệu. Không ai ngoài hệ thống được phép xem mật khẩu của bạn.' },
      { title: '4. Chia sẻ thông tin', content: 'Chúng tôi không bán hoặc cho thuê thông tin cá nhân. Chỉ chia sẻ với đối tác thanh toán (VNPay) theo yêu cầu giao dịch, có ràng buộc bảo mật.' },
      { title: '5. Cookie', content: 'Website sử dụng cookie để lưu phiên đăng nhập và cải thiện trải nghiệm. Bạn có thể tắt cookie trong trình duyệt, nhưng một số chức năng có thể bị ảnh hưởng.' },
      { title: '6. Quyền của bạn', content: 'Bạn có quyền yêu cầu xem, chỉnh sửa hoặc xoá dữ liệu cá nhân bất kỳ lúc nào bằng cách liên hệ với chúng tôi qua email hỗ trợ.' },
      { title: '7. Liên hệ', content: 'Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ: nguyenvanquoc11112004@gmail.com hoặc hotline 0877 999 484.' },
    ].map((section, i) => (
      <section className="support-section support-terms-section" key={i}>
        <h2 className="support-section-title">{section.title}</h2>
        <p className="support-text">{section.content}</p>
      </section>
    ))}
    <p className="support-last-updated">Cập nhật lần cuối: 12/05/2025</p>
  </SupportLayout>
);

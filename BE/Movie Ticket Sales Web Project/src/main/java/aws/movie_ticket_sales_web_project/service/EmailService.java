package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.repository.BookingRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

import java.io.UnsupportedEncodingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Email Service – tương tác trực tiếp với Java Mail (Jakarta Mail / Spring Mail).
 * Gửi email qua SMTP đã cấu hình trong application.properties (spring.mail.*).
 */
@Service
@Slf4j
public class EmailService {

    private static final String CHARSET_UTF8 = "UTF-8";

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@movieticket.com}")
    private String fromEmail;

    @Value("${spring.mail.from-name:CineTicket}")
    private String fromName;

    @Value("${email.service.enabled:true}")
    private boolean emailServiceEnabled;

    private final BookingRepository bookingRepository;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender,
                       BookingRepository bookingRepository) {
        this.mailSender = mailSender;
        this.bookingRepository = bookingRepository;
        if (mailSender == null) {
            log.warn("JavaMailSender not available (missing spring.mail.* config). Email sending will be disabled.");
        }
    }

    /**
     * Kiểm tra Java Mail có sẵn sàng gửi hay không (bật dịch vụ và có cấu hình).
     */
    public boolean isMailAvailable() {
        return emailServiceEnabled && mailSender != null && fromEmail != null && !fromEmail.isBlank();
    }

    /**
     * Gửi email HTML qua Java Mail (lõi – dùng MimeMessage + MimeMessageHelper).
     */
    public void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        if (to == null || to.isBlank()) {
            log.warn("Cannot send email: recipient is empty");
            return;
        }
        if (!emailServiceEnabled) {
            log.debug("Email service disabled, skip send to: {}", to);
            return;
        }
        if (mailSender == null) {
            log.warn("JavaMailSender is null. Cannot send email to: {}. Check spring.mail.* configuration.", to);
            return;
        }
        if (fromEmail == null || fromEmail.isBlank()) {
            log.warn("spring.mail.username is empty. Cannot send email to: {}", to);
            return;
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, CHARSET_UTF8);

        try {
            InternetAddress from = new InternetAddress(fromEmail, fromName, CHARSET_UTF8);
            helper.setFrom(from);
        } catch (UnsupportedEncodingException e) {
            helper.setFrom(fromEmail);
        }
        helper.setTo(to.trim());
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
        log.info("Email sent to: {} subject: {}", to, subject);
    }

    /**
     * Gửi email xác nhận đặt vé (bất đồng bộ). Truyền qrCodeUrl từ nơi gọi để đảm bảo mã QR có trong mail.
     * @param bookingId id booking
     * @param qrCodeUrl URL ảnh QR (S3). Nếu null sẽ lấy từ booking đã load (có thể null nếu chưa commit).
     */
    @Async
    public void sendBookingConfirmation(Integer bookingId, String qrCodeUrl) {
        if (!isMailAvailable()) {
            log.warn("Email service is disabled. Skipping booking confirmation for bookingId: {}", bookingId);
            return;
        }
        if (bookingId == null) return;

        try {
            Booking booking = bookingRepository.findByIdWithShowtimeAndCinema(bookingId)
                    .orElse(null);
            if (booking == null) {
                log.warn("Booking not found for email, id: {}", bookingId);
                return;
            }
            if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) {
                log.warn("Booking {} has no customer email, skip confirmation.", booking.getBookingCode());
                return;
            }
            if (booking.getShowtime() == null || booking.getShowtime().getMovie() == null
                    || booking.getShowtime().getHall() == null || booking.getShowtime().getHall().getCinema() == null) {
                log.warn("Booking {} missing showtime/cinema data, skip confirmation.", booking.getBookingCode());
                return;
            }

            String qrUrl = qrCodeUrl != null && !qrCodeUrl.isBlank() ? qrCodeUrl : booking.getQrCode();

            Map<String, Object> templateData = new HashMap<>();
            templateData.put("customerName", booking.getCustomerName());
            templateData.put("customerEmail", booking.getCustomerEmail());
            templateData.put("bookingCode", booking.getBookingCode());
            templateData.put("movieTitle", booking.getShowtime().getMovie().getTitle());
            templateData.put("cinemaName", booking.getShowtime().getHall().getCinema().getCinemaName());
            templateData.put("hallName", booking.getShowtime().getHall().getHallName());
            templateData.put("showDate", booking.getShowtime().getShowDate().toString());
            templateData.put("startTime", booking.getShowtime().getStartTime().toString());
            templateData.put("totalSeats", booking.getTotalSeats());
            templateData.put("totalAmount", booking.getTotalAmount() != null ? booking.getTotalAmount().longValue() : 0L);
            templateData.put("qrCodeUrl", qrUrl);

            String subject = "🎬 Xác nhận đặt vé - " + booking.getBookingCode();
            String html = buildBookingConfirmationHtml(templateData);
            sendHtmlEmail(booking.getCustomerEmail(), subject, html);
            log.info("Booking confirmation email sent via Java Mail for: {} (QR: {})", booking.getCustomerEmail(), qrUrl != null ? "yes" : "no");
        } catch (Exception e) {
            log.error("Error sending booking confirmation for bookingId: {} - {}", bookingId, e.getMessage(), e);
        }
    }

    /** Gọi từ nơi không có sẵn qrCodeUrl (dùng URL từ DB). */
    @Async
    public void sendBookingConfirmation(Integer bookingId) {
        sendBookingConfirmation(bookingId, null);
    }

    /**
     * Gửi email xác nhận hoàn tiền (bất đồng bộ). Load booking trong async để tránh LazyInitializationException.
     */
    @Async
    public void sendRefundConfirmation(Integer bookingId) {
        if (!isMailAvailable()) {
            log.warn("Email service is disabled. Skipping refund confirmation for bookingId: {}", bookingId);
            return;
        }
        if (bookingId == null) return;

        try {
            Booking booking = bookingRepository.findByIdWithShowtimeAndCinema(bookingId).orElse(null);
            if (booking == null) {
                log.warn("Booking not found for refund email, id: {}", bookingId);
                return;
            }
            if (booking.getCustomerEmail() == null || booking.getCustomerEmail().isBlank()) {
                log.warn("Booking {} has no customer email, skip refund confirmation.", booking.getBookingCode());
                return;
            }

            Map<String, Object> templateData = new HashMap<>();
            templateData.put("customerName", booking.getCustomerName());
            templateData.put("customerEmail", booking.getCustomerEmail());
            templateData.put("bookingCode", booking.getBookingCode());
            templateData.put("refundAmount", booking.getTotalAmount() != null ? booking.getTotalAmount().longValue() : 0L);

            String subject = "Xác nhận hoàn tiền - " + booking.getBookingCode();
            String html = buildRefundConfirmationHtml(templateData);
            sendHtmlEmail(booking.getCustomerEmail(), subject, html);
            log.info("Refund confirmation email sent via Java Mail for: {}", booking.getCustomerEmail());
        } catch (Exception e) {
            log.error("Error sending refund email for bookingId: {} - {}", bookingId, e.getMessage(), e);
        }
    }

    /**
     * Gửi email reset mật khẩu (mã xác nhận) qua Java Mail
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetCode, String fullName) {
        if (!emailServiceEnabled) {
            log.warn("Email service is disabled. Skipping password reset email for: {}", toEmail);
            throw new RuntimeException("Email service is currently unavailable. Please try again later.");
        }
        if (!isMailAvailable()) {
            log.warn("Mail not available (JavaMailSender or spring.mail.username missing). Cannot send to: {}", toEmail);
            throw new RuntimeException("Hệ thống email chưa được cấu hình. Vui lòng liên hệ quản trị viên.");
        }

        try {
            Map<String, Object> templateData = new HashMap<>();
            templateData.put("fullName", fullName != null && !fullName.isBlank() ? fullName : "Quý khách");
            templateData.put("resetCode", resetCode);
            templateData.put("email", toEmail);

            String subject = "🎬 CineTicket - Mã Xác Nhận Đặt Lại Mật Khẩu";
            String html = buildPasswordResetHtml(templateData);
            sendHtmlEmail(toEmail, subject, html);
            log.info("Password reset email sent via Java Mail for: {}", toEmail);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            log.error("Failed to send password reset email to: {} - {} (check spring.mail.* / Gmail App Password)", toEmail, msg, e);
            throw new RuntimeException("Không thể gửi email. Kiểm tra cấu hình SMTP (Gmail: dùng App Password, bật 2FA). Vui lòng thử lại sau.");
        }
    }

    private static String escape(Object o) {
        return o != null ? o.toString().replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;") : "";
    }

    private static String buildBookingConfirmationHtml(Map<String, Object> data) {
        String name = escape(data.get("customerName"));
        String code = escape(data.get("bookingCode"));
        String movie = escape(data.get("movieTitle"));
        String cinema = escape(data.get("cinemaName"));
        String hall = escape(data.get("hallName"));
        String showDate = escape(data.get("showDate"));
        String startTime = escape(data.get("startTime"));
        Object seats = data.get("totalSeats");
        Object amount = data.get("totalAmount");
        Object qrCodeUrlObj = data.get("qrCodeUrl");
        String qrUrl = (qrCodeUrlObj != null && qrCodeUrlObj.toString() != null && !qrCodeUrlObj.toString().isBlank())
                ? qrCodeUrlObj.toString().replace("&", "&amp;") : "";
        return "<!DOCTYPE html><html><head><meta charset=\"" + CHARSET_UTF8 + "\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"></head><body style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;\">"
                + "<h2 style=\"color:#333;\">🎬 Xác nhận đặt vé</h2>"
                + "<p>Xin chào <strong>" + name + "</strong>,</p>"
                + "<p>Bạn đã đặt vé thành công. Mã đặt vé: <strong>" + code + "</strong></p>"
                + "<table style=\"border-collapse:collapse;width:100%;margin:16px 0;\">"
                + "<tr><td style=\"padding:8px;border:1px solid #ddd;\">Phim</td><td style=\"padding:8px;border:1px solid #ddd;\">" + movie + "</td></tr>"
                + "<tr><td style=\"padding:8px;border:1px solid #ddd;\">Rạp</td><td style=\"padding:8px;border:1px solid #ddd;\">" + cinema + " - " + hall + "</td></tr>"
                + "<tr><td style=\"padding:8px;border:1px solid #ddd;\">Ngày chiếu</td><td style=\"padding:8px;border:1px solid #ddd;\">" + showDate + " " + startTime + "</td></tr>"
                + "<tr><td style=\"padding:8px;border:1px solid #ddd;\">Số ghế</td><td style=\"padding:8px;border:1px solid #ddd;\">" + (seats != null ? seats : "") + "</td></tr>"
                + "<tr><td style=\"padding:8px;border:1px solid #ddd;\">Tổng tiền</td><td style=\"padding:8px;border:1px solid #ddd;\">" + (amount != null ? amount + " VNĐ" : "") + "</td></tr>"
                + "</table>"
                + (qrUrl != null && !qrUrl.isEmpty()
                ? "<div style=\"margin:20px 0;padding:16px;background:#f8f9fa;border-radius:8px;text-align:center;\">"
                + "<p style=\"margin:0 0 8px 0;font-weight:bold;color:#333;\">Mã QR vé của bạn</p>"
                + "<img src=\"" + qrUrl + "\" alt=\"Mã QR đặt vé " + code + "\" width=\"180\" height=\"180\" style=\"display:block;margin:0 auto;max-width:180px;height:auto;\"/>"
                + "<p style=\"margin:8px 0 0 0;font-size:12px;color:#666;\">Trình chiếu mã QR tại quầy để đổi vé</p></div>"
                : "<p style=\"color:#666;\">Mã QR sẽ được gửi qua ứng dụng hoặc tại quầy.</p>")
                + "<p>Cảm ơn bạn đã sử dụng dịch vụ.</p></body></html>";
    }

    private static String buildRefundConfirmationHtml(Map<String, Object> data) {
        String name = escape(data.get("customerName"));
        String code = escape(data.get("bookingCode"));
        Object amount = data.get("refundAmount");
        return "<!DOCTYPE html><html><head><meta charset=\"" + CHARSET_UTF8 + "\"></head><body style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;\">"
                + "<h2 style=\"color:#333;\">Xác nhận hoàn tiền</h2>"
                + "<p>Xin chào <strong>" + name + "</strong>,</p>"
                + "<p>Yêu cầu hoàn tiền cho đặt vé <strong>" + code + "</strong> đã được xử lý.</p>"
                + "<p>Số tiền hoàn: <strong>" + (amount != null ? amount + " VNĐ" : "") + "</strong></p>"
                + "<p>Cảm ơn bạn.</p></body></html>";
    }

    private static String buildPasswordResetHtml(Map<String, Object> data) {
        String name = escape(data.get("fullName"));
        String code = escape(data.get("resetCode"));
        return "<!DOCTYPE html><html><head><meta charset=\"" + CHARSET_UTF8 + "\"></head><body style=\"font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;\">"
                + "<h2 style=\"color:#333;\">🎬 CineTicket - Đặt lại mật khẩu</h2>"
                + "<p>Xin chào <strong>" + name + "</strong>,</p>"
                + "<p>Mã xác nhận của bạn: <strong style=\"font-size:1.2em;letter-spacing:2px;\">" + code + "</strong></p>"
                + "<p>Mã có hiệu lực trong thời gian giới hạn. Không chia sẻ mã này với bất kỳ ai.</p>"
                + "<p>Cảm ơn bạn.</p></body></html>";
    }
}

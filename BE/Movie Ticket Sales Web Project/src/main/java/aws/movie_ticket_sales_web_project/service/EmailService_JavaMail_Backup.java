package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.entity.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

// @Service  // Commented out - this is a backup, use EmailService (SNS version) instead
@RequiredArgsConstructor
@Slf4j
public class EmailService_JavaMail_Backup {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username:noreply@movieticket.com}")
    private String fromEmail;
    
    /**
     * Send booking confirmation email (async)
     * QR Code is displayed directly in HTML from S3 URL (no attachment needed)
     */
    @Async
    public void sendBookingConfirmation(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8"); // false = no attachments
            
            helper.setFrom(fromEmail);
            helper.setTo(booking.getCustomerEmail());
            helper.setSubject("🎬 Xác nhận đặt vé - " + booking.getBookingCode());
            
            // Generate email content with QR code embedded from S3 URL
            String emailContent = buildConfirmationEmailHtml(booking);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Confirmation email sent successfully to: {}", booking.getCustomerEmail());
            
        } catch (Exception e) {
            log.error("Error sending confirmation email for booking: {}", booking.getBookingCode(), e);
        }
    }
    
    /**
     * Build HTML email content with modern design
     */
    private String buildConfirmationEmailHtml(Booking booking) {
        String qrCodeUrl = booking.getQrCode();
        
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        background: #f4f4f4;
                    }
                    .email-container { 
                        max-width: 600px; 
                        margin: 20px auto; 
                        background: white;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .header { 
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        color: white; 
                        padding: 30px 20px; 
                        text-align: center; 
                    }
                    .header h1 { 
                        font-size: 28px; 
                        margin-bottom: 10px;
                        font-weight: 600;
                    }
                    .header p { 
                        font-size: 14px; 
                        opacity: 0.9;
                    }
                    .content { 
                        padding: 30px 20px; 
                    }
                    .greeting { 
                        font-size: 18px; 
                        margin-bottom: 20px;
                        color: #2c3e50;
                    }
                    .movie-section {
                        background: linear-gradient(to right, #f8f9fa, #ffffff);
                        border-radius: 8px;
                        padding: 20px;
                        margin: 20px 0;
                        border-left: 4px solid #667eea;
                    }
                    .movie-section h2 {
                        color: #667eea;
                        font-size: 24px;
                        margin-bottom: 15px;
                    }
                    .info-row {
                        display: table;
                        width: 100%%;
                        padding: 8px 0;
                        border-bottom: 1px solid #eee;
                    }
                    .info-row:last-child {
                        border-bottom: none;
                    }
                    .info-label {
                        display: table-cell;
                        font-weight: 600;
                        color: #555;
                        width: 40%%;
                    }
                    .info-value {
                        display: table-cell;
                        color: #2c3e50;
                    }
                    .total-section {
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        color: white;
                        padding: 20px;
                        border-radius: 8px;
                        text-align: center;
                        margin: 20px 0;
                    }
                    .total-section .amount {
                        font-size: 36px;
                        font-weight: bold;
                        margin: 10px 0;
                    }
                    .qr-section {
                        text-align: center;
                        padding: 30px 20px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .qr-section h3 {
                        color: #667eea;
                        margin-bottom: 15px;
                        font-size: 20px;
                    }
                    .qr-section img {
                        max-width: 250px;
                        height: auto;
                        border: 4px solid white;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                        border-radius: 8px;
                    }
                    .qr-code-text {
                        font-size: 24px;
                        font-weight: bold;
                        color: #667eea;
                        margin: 15px 0;
                        letter-spacing: 2px;
                    }
                    .important-notes {
                        background: #fff3cd;
                        border-left: 4px solid #ffc107;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .important-notes h3 {
                        color: #856404;
                        margin-bottom: 15px;
                    }
                    .important-notes ul {
                        list-style-position: inside;
                        color: #856404;
                    }
                    .important-notes li {
                        padding: 5px 0;
                    }
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%);
                        color: white;
                        padding: 15px 40px;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: 600;
                        margin: 20px 0;
                        box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);
                    }
                    .footer {
                        background: #2c3e50;
                        color: white;
                        text-align: center;
                        padding: 30px 20px;
                    }
                    .footer p {
                        margin: 5px 0;
                        font-size: 14px;
                    }
                    .social-links {
                        margin: 15px 0;
                    }
                    .social-links a {
                        color: white;
                        text-decoration: none;
                        margin: 0 10px;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="header">
                        <h1>🎬 VÉ ĐIỆN TỬ</h1>
                        <p>Đặt vé thành công - Chúc bạn có trải nghiệm tuyệt vời!</p>
                    </div>
                    
                    <div class="content">
                        <p class="greeting">Xin chào <strong>%s</strong>,</p>
                        <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi. Vé xem phim của bạn đã được xác nhận thành công!</p>
                        
                        <div class="movie-section">
                            <h2>🎥 %s</h2>
                            <div class="info-row">
                                <span class="info-label">📍 Rạp chiếu:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">🏛️ Phòng:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">📅 Ngày chiếu:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">🕐 Giờ chiếu:</span>
                                <span class="info-value">%s</span>
                            </div>
                            <div class="info-row">
                                <span class="info-label">🎫 Số vé:</span>
                                <span class="info-value">%d vé</span>
                            </div>
                        </div>
                        
                        <div class="total-section">
                            <p>Tổng thanh toán</p>
                            <div class="amount">%,d ₫</div>
                            <p>Đã thanh toán thành công</p>
                        </div>
                        
                        <div class="qr-section">
                            <h3>📱 MÃ QR CHECK-IN</h3>
                            <p>Xuất trình mã QR này tại quầy để nhận vé</p>
                            %s
                            <div class="qr-code-text">%s</div>
                            <p style="color: #666; font-size: 14px;">Mã đặt vé của bạn</p>
                        </div>
                        
                        <div class="important-notes">
                            <h3>⚠️ LƯU Ý QUAN TRỌNG</h3>
                            <ul>
                                <li>Vui lòng có mặt tại rạp <strong>trước 15 phút</strong> so với giờ chiếu</li>
                                <li>Mang theo <strong>mã QR</strong> hoặc <strong>mã đặt vé</strong> để check-in</li>
                                <li>Vé không được hoàn tiền sau khi đã check-in</li>
                                <li>Vui lòng giữ gìn vé và không chia sẻ mã QR với người khác</li>
                            </ul>
                        </div>
                        
                        <div style="text-align: center;">
                            <p>Cần hỗ trợ?</p>
                            <a href="mailto:support@movieticket.com" class="cta-button">Liên hệ hỗ trợ</a>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>MOVIE TICKET SYSTEM</strong></p>
                        <div class="social-links">
                            <a href="#">Facebook</a> | 
                            <a href="#">Instagram</a> | 
                            <a href="#">Twitter</a>
                        </div>
                        <p>Hotline: 1900-xxxx</p>
                        <p>Email: support@movieticket.com</p>
                        <p style="margin-top: 15px; opacity: 0.7;">© 2025 Movie Ticket System. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            booking.getCustomerName(),
            booking.getShowtime().getMovie().getTitle(),
            booking.getShowtime().getHall().getCinema().getCinemaName(),
            booking.getShowtime().getHall().getHallName(),
            booking.getShowtime().getShowDate().toString(),
            booking.getShowtime().getStartTime().toString(),
            booking.getTotalSeats(),
            booking.getTotalAmount().longValue(),
            qrCodeUrl != null ? String.format("<img src='%s' alt='QR Code' />", qrCodeUrl) : "<p>QR Code sẽ được tạo sau</p>",
            booking.getBookingCode()
        );
    }
    
    /**
     * Send refund confirmation email
     */
    @Async
    public void sendRefundConfirmation(Booking booking) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(booking.getCustomerEmail());
            helper.setSubject("Xác nhận hoàn tiền - " + booking.getBookingCode());
            
            String emailContent = String.format("""
                <h2>Xác nhận hoàn tiền</h2>
                <p>Xin chào %s,</p>
                <p>Đặt vé <strong>%s</strong> của bạn đã được hoàn tiền.</p>
                <p>Số tiền hoàn: <strong>%,d VNĐ</strong></p>
                <p>Số tiền sẽ được chuyển về tài khoản của bạn trong vòng 5-7 ngày làm việc.</p>
                <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
                """,
                booking.getCustomerName(),
                booking.getBookingCode(),
                booking.getTotalAmount().longValue()
            );
            
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            log.info("Refund confirmation email sent to: {}", booking.getCustomerEmail());
            
        } catch (Exception e) {
            log.error("Error sending refund email for booking: {}", booking.getBookingCode(), e);
        }
    }
    
    /**
     * Gửi email reset password với mã xác nhận
     */
    @Async
    public void sendPasswordResetEmail(String toEmail, String resetCode, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("🎬 CineTicket - Mã Xác Nhận Đặt Lại Mật Khẩu");
            
            String htmlContent = buildPasswordResetEmailTemplate(resetCode, fullName);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email. Vui lòng thử lại sau.");
        }
    }
    
    /**
     * Template HTML cho email reset password
     */
    private String buildPasswordResetEmailTemplate(String resetCode, String fullName) {
        String name = (fullName != null && !fullName.isBlank()) ? fullName : "Quý khách";
        
        return String.format("""
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Đặt Lại Mật Khẩu</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 20px 20px 0 0; padding: 40px 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">🎬 CineTicket</h1>
                        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Hệ Thống Đặt Vé Xem Phim Trực Tuyến</p>
                    </div>
                    
                    <div style="background: white; padding: 40px 30px; border-radius: 0 0 20px 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 22px;">Xin chào %s,</h2>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
                            Vui lòng sử dụng mã xác nhận bên dưới để hoàn tất quá trình:
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); border-radius: 15px; padding: 30px; text-align: center; margin: 30px 0;">
                            <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Mã Xác Nhận</p>
                            <p style="color: white; font-size: 36px; font-weight: bold; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">%s</p>
                        </div>
                        
                        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; border-radius: 8px; margin: 25px 0;">
                            <p style="color: #856404; margin: 0; font-size: 14px;">
                                ⏰ <strong>Lưu ý:</strong> Mã xác nhận này có hiệu lực trong <strong>15 phút</strong>.
                            </p>
                        </div>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
                            Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                            Tài khoản của bạn vẫn an toàn.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                        
                        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                            Email này được gửi tự động từ hệ thống CineTicket.<br>
                            Vui lòng không trả lời email này.
                        </p>
                    </div>
                    
                    <div style="text-align: center; padding: 20px;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            © 2024 CineTicket. All rights reserved.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, name, resetCode);
    }
}

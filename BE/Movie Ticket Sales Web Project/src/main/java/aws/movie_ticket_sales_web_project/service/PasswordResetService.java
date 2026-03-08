package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ForgotPasswordRequest;
import aws.movie_ticket_sales_web_project.dto.ResetPasswordRequest;
import aws.movie_ticket_sales_web_project.dto.VerifyResetCodeRequest;
import aws.movie_ticket_sales_web_project.entity.PasswordResetToken;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.repository.PasswordResetTokenRepository;
import aws.movie_ticket_sales_web_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {
    
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    
    // Thời gian hết hạn mã reset (15 phút)
    private static final int CODE_EXPIRY_MINUTES = 15;
    
    /**
     * Bước 1: Gửi mã xác nhận đến email
     */
    @Transactional
    public void sendResetCode(ForgotPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        log.info("Processing forgot password request for email: {}", email);
        
        // Kiểm tra email có tồn tại không
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Không tiết lộ email có tồn tại hay không vì lý do bảo mật
            // Vẫn trả về thành công để tránh user enumeration attack
            log.warn("Password reset requested for non-existent email: {}", email);
            return;
        }
        
        User user = userOpt.get();
        
        // Vô hiệu hóa các mã cũ
        tokenRepository.invalidateAllTokensByEmail(email);
        
        // Tạo mã mới (6 chữ số)
        String resetCode = generateResetCode();
        
        // Lưu token vào database
        PasswordResetToken token = PasswordResetToken.builder()
                .email(email)
                .code(resetCode)
                .expiresAt(Instant.now().plus(CODE_EXPIRY_MINUTES, ChronoUnit.MINUTES))
                .isUsed(false)
                .createdAt(Instant.now())
                .build();
        
        tokenRepository.save(token);
        log.info("Password reset token created for email: {}", email);
        
        // Gửi email
        emailService.sendPasswordResetEmail(email, resetCode, user.getFullName());
    }
    
    /**
     * Bước 2: Xác minh mã reset
     */
    @Transactional(readOnly = true)
    public boolean verifyResetCode(VerifyResetCodeRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();
        
        log.info("Verifying reset code for email: {}", email);
        
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findValidToken(
                email, code, Instant.now());
        
        if (tokenOpt.isEmpty()) {
            log.warn("Invalid or expired reset code for email: {}", email);
            return false;
        }
        
        log.info("Reset code verified successfully for email: {}", email);
        return true;
    }
    
    /**
     * Bước 3: Đặt lại mật khẩu mới
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String code = request.getCode().trim();
        
        log.info("Processing password reset for email: {}", email);
        
        // Kiểm tra mật khẩu mới và xác nhận khớp nhau
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }
        
        // Kiểm tra mã reset hợp lệ
        PasswordResetToken token = tokenRepository.findValidToken(email, code, Instant.now())
                .orElseThrow(() -> new RuntimeException("Mã xác nhận không hợp lệ hoặc đã hết hạn"));
        
        // Tìm user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này"));
        
        // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }
        
        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        
        // Đánh dấu token đã sử dụng
        token.setIsUsed(true);
        tokenRepository.save(token);
        
        log.info("Password reset successful for email: {}", email);
    }
    
    /**
     * Gửi lại mã reset (resend)
     */
    @Transactional
    public void resendResetCode(ForgotPasswordRequest request) {
        sendResetCode(request);
    }
    
    /**
     * Tạo mã reset ngẫu nhiên 6 chữ số
     */
    private String generateResetCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // Số từ 100000 đến 999999
        return String.valueOf(code);
    }
    
    /**
     * Cleanup job - xóa các token hết hạn
     */
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(Instant.now());
        log.info("Expired password reset tokens cleaned up");
    }
}

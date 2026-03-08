package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ForgotPasswordRequest;
import aws.movie_ticket_sales_web_project.dto.ResetPasswordRequest;
import aws.movie_ticket_sales_web_project.dto.VerifyResetCodeRequest;
import aws.movie_ticket_sales_web_project.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API xử lý quên mật khẩu
 */
@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {
    
    private final PasswordResetService passwordResetService;
    
    /**
     * Bước 1: Gửi mã xác nhận đến email
     * POST /api/auth/password/forgot
     */
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Forgot password request for email: {}", request.getEmail());
        
        try {
            passwordResetService.sendResetCode(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Nếu email tồn tại trong hệ thống, mã xác nhận sẽ được gửi đến email của bạn."
            ));
        } catch (Exception e) {
            log.error("Error processing forgot password request", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Bước 2: Xác minh mã reset
     * POST /api/auth/password/verify-code
     */
    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyResetCode(@Valid @RequestBody VerifyResetCodeRequest request) {
        log.info("Verify reset code request for email: {}", request.getEmail());
        
        try {
            boolean isValid = passwordResetService.verifyResetCode(request);
            
            if (isValid) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Mã xác nhận hợp lệ"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Mã xác nhận không hợp lệ hoặc đã hết hạn"
                ));
            }
        } catch (Exception e) {
            log.error("Error verifying reset code", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Bước 3: Đặt lại mật khẩu mới
     * POST /api/auth/password/reset
     */
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("Reset password request for email: {}", request.getEmail());
        
        try {
            passwordResetService.resetPassword(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới."
            ));
        } catch (Exception e) {
            log.error("Error resetting password", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Gửi lại mã xác nhận
     * POST /api/auth/password/resend
     */
    @PostMapping("/resend")
    public ResponseEntity<?> resendCode(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("Resend reset code request for email: {}", request.getEmail());
        
        try {
            passwordResetService.resendResetCode(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Mã xác nhận mới đã được gửi đến email của bạn."
            ));
        } catch (Exception e) {
            log.error("Error resending reset code", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}

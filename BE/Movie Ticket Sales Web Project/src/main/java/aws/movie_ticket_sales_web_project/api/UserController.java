package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ChangePasswordRequest;
import aws.movie_ticket_sales_web_project.dto.UpdateProfileRequest;
import aws.movie_ticket_sales_web_project.dto.UserProfileDto;
import aws.movie_ticket_sales_web_project.service.UserProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * API quản lý thông tin người dùng
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserProfileService userProfileService;

    /**
     * Lấy thông tin profile của user
     * GET /api/users/{userId}/profile
     */
    @GetMapping("/{userId}/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getUserProfile(@PathVariable Integer userId) {
        log.info("Getting profile for user: {}", userId);
        
        try {
            UserProfileDto profile = userProfileService.getUserProfile(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", profile
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Cập nhật thông tin cá nhân
     * PUT /api/users/{userId}/profile
     */
    @PutMapping("/{userId}/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer userId,
            @RequestBody UpdateProfileRequest request) {
        
        log.info("Updating profile for user: {}", userId);
        
        try {
            UserProfileDto updatedProfile = userProfileService.updateProfile(userId, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cập nhật thông tin thành công",
                    "data", updatedProfile
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Thay đổi mật khẩu
     * PUT /api/users/{userId}/password
     */
    @PutMapping("/{userId}/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @PathVariable Integer userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        log.info("Changing password for user: {}", userId);
        
        try {
            userProfileService.changePassword(userId, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đổi mật khẩu thành công"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Cập nhật avatar
     * PUT /api/users/{userId}/avatar
     */
    @PutMapping("/{userId}/avatar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateAvatar(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> request) {
        
        log.info("Updating avatar for user: {}", userId);
        
        try {
            String avatarUrl = request.get("avatarUrl");
            UserProfileDto updatedProfile = userProfileService.updateAvatar(userId, avatarUrl);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cập nhật ảnh đại diện thành công",
                    "data", updatedProfile
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Lấy thông tin profile của user hiện tại (từ token)
     * GET /api/users/me
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getCurrentUserProfile(@RequestParam Integer userId) {
        log.info("Getting current user profile for userId: {}", userId);
        
        try {
            UserProfileDto profile = userProfileService.getUserProfile(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", profile
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}

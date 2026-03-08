package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.Role;
import aws.movie_ticket_sales_web_project.service.RoleManagementService;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    private final RoleManagementService roleManagementService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Get all users with their roles (Admin only)
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserInfo>>> getAllUsers(
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<List<UserInfo>> response = roleManagementService.getAllUsersWithRoles(userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting users", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<UserInfo>>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Update user role (Admin only)
     * PUT /api/admin/users/role
     */
    @PutMapping("/users/role")
    public ResponseEntity<ApiResponse<UserInfo>> updateUserRole(
            @RequestBody UpdateUserRoleRequest request,
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<UserInfo> response = roleManagementService.updateUserRole(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error updating user role", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<UserInfo>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Extract user ID from JWT token
     */
    private Integer getUserIdFromToken(String token) {
        String actualToken = token.replace("Bearer ", "");
        return jwtTokenProvider.getUserIdFromToken(actualToken);
    }

    /**
     * Get all roles (Admin only)
     * GET /api/admin/roles
     */
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<Role>>> getAllRoles(
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<List<Role>> response = roleManagementService.getAllRoles(userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting roles", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<Role>>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Add new role (Admin only)
     * POST /api/admin/roles
     */
    @PostMapping("/roles")
    public ResponseEntity<ApiResponse<Role>> addRole(
            @RequestBody AddRoleRequest request,
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<Role> response = roleManagementService.addRole(
                    request.getRoleName(), 
                    request.getDescription(), 
                    userId
            );

            if (response.getSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error adding role", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Role>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Get users by role name
     * GET /api/admin/roles/{roleName}/users
     */
    @GetMapping("/roles/{roleName}/users")
    public ResponseEntity<ApiResponse<List<UserInfo>>> getUsersByRole(
            @PathVariable String roleName,
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            log.info("Getting users with role: {}", roleName);
            
            ApiResponse<List<UserInfo>> response = roleManagementService.getUsersByRole(roleName, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting users by role", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<List<UserInfo>>builder()
                            .success(false)
                            .message("Error: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Delete user account (Admin only)
     * DELETE /api/admin/users/{userId}
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Integer userId,
            @RequestHeader(value = "Authorization", required = false) String token) {
        
        log.info("🗑️ DELETE request for user: {}", userId);
        log.info("📋 Authorization header: {}", token != null ? "Present (length: " + token.length() + ")" : "MISSING");
        
        try {
            if (token == null || token.isEmpty()) {
                log.error("❌ No authorization token provided");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<String>builder()
                                .success(false)
                                .message("No authorization token provided")
                                .build());
            }
            
            Integer requestingUserId = getUserIdFromToken(token);
            log.info("👤 Requesting user ID: {}", requestingUserId);
            log.info("🎯 Target user ID: {}", userId);
            
            ApiResponse<String> response = roleManagementService.deleteUser(userId, requestingUserId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("❌ Error deleting user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message("Error: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Activate user account (Admin only)
     * PUT /api/admin/users/{userId}/activate
     */
    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<ApiResponse<String>> activateUser(
            @PathVariable Integer userId,
            @RequestHeader("Authorization") String token) {
        
        log.info("✅ ACTIVATE request for user: {}", userId);
        
        try {
            Integer requestingUserId = getUserIdFromToken(token);
            log.info("👤 Requesting user ID: {}", requestingUserId);
            log.info("🎯 Target user ID: {}", userId);
            
            ApiResponse<String> response = roleManagementService.activateUser(userId, requestingUserId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("❌ Error activating user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<String>builder()
                            .success(false)
                            .message("Error: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get all membership tiers (Admin only)
     * GET /api/admin/membership-tiers
     */
    @GetMapping("/membership-tiers")
    public ResponseEntity<ApiResponse<List<MembershipTierDto>>> getAllMembershipTiers(
            @RequestHeader("Authorization") String token) {
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<List<MembershipTierDto>> response = roleManagementService.getAllMembershipTiers(userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting membership tiers", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<List<MembershipTierDto>>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Update user's membership tier manually (Admin only)
     * PUT /api/admin/users/membership-tier
     */
    @PutMapping("/users/membership-tier")
    public ResponseEntity<ApiResponse<UserInfo>> updateMembershipTier(
            @RequestBody UpdateMembershipTierRequest request,
            @RequestHeader("Authorization") String token) {
        
        log.info("🔄 Updating membership tier for user: {} to tier: {}", request.getUserId(), request.getTierName());
        
        try {
            Integer userId = getUserIdFromToken(token);
            ApiResponse<UserInfo> response = roleManagementService.updateMembershipTier(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error updating membership tier", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<UserInfo>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }
}
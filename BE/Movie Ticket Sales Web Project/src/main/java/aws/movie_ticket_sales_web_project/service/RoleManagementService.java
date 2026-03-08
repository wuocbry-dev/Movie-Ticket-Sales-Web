package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class RoleManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipTierRepository membershipTierRepository;

    /**
     * Check if user has admin role
     */
    public boolean isUserAdmin(Integer userId) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(userId);
        return userRoles.stream()
                .anyMatch(userRole -> {
                    String roleName = userRole.getRole().getRoleName();
                    return "SYSTEM_ADMIN".equals(roleName) || "ADMIN".equals(roleName);
                });
    }

    /**
     * Get all users with their roles (Admin only)
     */
    public ApiResponse<List<UserInfo>> getAllUsersWithRoles(Integer requestingUserId) {
        log.info("Getting all users with roles, requested by user: {}", requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<List<UserInfo>>builder()
                    .success(false)
                    .message("Access denied. Only administrators can view all users.")
                    .build();
        }

        try {
            List<User> users = userRepository.findAll();
            List<UserInfo> userInfoList = users.stream()
                    .map(this::convertToUserInfo)
                    .collect(Collectors.toList());

            return ApiResponse.<List<UserInfo>>builder()
                    .success(true)
                    .message("Users retrieved successfully")
                    .data(userInfoList)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving users", e);
            return ApiResponse.<List<UserInfo>>builder()
                    .success(false)
                    .message("Failed to retrieve users: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update user role (Admin only)
     */
    @Transactional
    public ApiResponse<UserInfo> updateUserRole(UpdateUserRoleRequest request, Integer requestingUserId) {
        log.info("Updating role for user: {} to role: {}, requested by: {}", 
                request.getUserId(), request.getRoleName(), requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<UserInfo>builder()
                    .success(false)
                    .message("Access denied. Only administrators can update user roles.")
                    .build();
        }

        try {
            // Validate role exists in database
            Role role = roleRepository.findByRoleName(request.getRoleName())
                    .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRoleName()));

            // Find user
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Remove existing roles
            List<UserRole> existingRoles = userRoleRepository.findByUserId(request.getUserId());
            userRoleRepository.deleteAll(existingRoles);

            // Assign new role
            UserRole userRole = new UserRole();
            userRole.setUser(user);
            userRole.setRole(role);
            userRole.setAssignedAt(Instant.now());

            User assignedByUser = userRepository.findById(requestingUserId)
                    .orElse(null);
            userRole.setAssignedBy(assignedByUser);

            userRoleRepository.save(userRole);

            UserInfo userInfo = convertToUserInfo(user);

            log.info("Role updated successfully for user: {} to role: {}", 
                    request.getUserId(), request.getRoleName());

            return ApiResponse.<UserInfo>builder()
                    .success(true)
                    .message("User role updated successfully")
                    .data(userInfo)
                    .build();

        } catch (Exception e) {
            log.error("Error updating user role", e);
            return ApiResponse.<UserInfo>builder()
                    .success(false)
                    .message("Failed to update user role: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert User entity to UserInfo DTO
     */
    private UserInfo convertToUserInfo(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
        List<String> roleNames = userRoles.stream()
                .map(userRole -> userRole.getRole().getRoleName())
                .collect(Collectors.toList());

        UserInfo userInfo = new UserInfo();
        userInfo.setUserId(user.getId());
        userInfo.setEmail(user.getEmail());
        userInfo.setFullName(user.getFullName());
        userInfo.setRoles(roleNames);
        userInfo.setIsActive(user.getIsActive() != null ? user.getIsActive() : true);
        
        // Fetch and populate membership information
        membershipRepository.findByUserId(user.getId()).ifPresentOrElse(
            membership -> {
                userInfo.setMembershipTier(membership.getTier() != null ? membership.getTier().getTierName() : null);
                userInfo.setAvailablePoints(membership.getAvailablePoints() != null ? membership.getAvailablePoints() : 0);
            },
            () -> {
                userInfo.setMembershipTier(null);
                userInfo.setAvailablePoints(0);
            }
        );

        return userInfo;
    }

    /**
     * Get all available roles (Admin only)
     */
    public ApiResponse<List<Role>> getAllRoles(Integer requestingUserId) {
        log.info("Getting all roles, requested by user: {}", requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<List<Role>>builder()
                    .success(false)
                    .message("Access denied. Only administrators can view all roles.")
                    .build();
        }

        try {
            List<Role> roles = roleRepository.findAll();

            return ApiResponse.<List<Role>>builder()
                    .success(true)
                    .message("Roles retrieved successfully")
                    .data(roles)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving roles", e);
            return ApiResponse.<List<Role>>builder()
                    .success(false)
                    .message("Failed to retrieve roles: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Add new role (Admin only)
     */
    @Transactional
    public ApiResponse<Role> addRole(String roleName, String description, Integer requestingUserId) {
        log.info("Adding new role: {} by user: {}", roleName, requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<Role>builder()
                    .success(false)
                    .message("Access denied. Only administrators can add new roles.")
                    .build();
        }

        try {
            // Check if role already exists
            if (roleRepository.findByRoleName(roleName).isPresent()) {
                return ApiResponse.<Role>builder()
                        .success(false)
                        .message("Role already exists: " + roleName)
                        .build();
            }

            Role newRole = new Role();
            newRole.setRoleName(roleName.toUpperCase());
            newRole.setDescription(description);
            newRole.setCreatedAt(Instant.now());

            Role savedRole = roleRepository.save(newRole);

            log.info("Role added successfully: {}", roleName);

            return ApiResponse.<Role>builder()
                    .success(true)
                    .message("Role added successfully")
                    .data(savedRole)
                    .build();

        } catch (Exception e) {
            log.error("Error adding role", e);
            return ApiResponse.<Role>builder()
                    .success(false)
                    .message("Failed to add role: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get users by role name (Public - for dropdown selections)
     */
    public ApiResponse<List<UserInfo>> getUsersByRole(String roleName, Integer requestingUserId) {
        log.info("Getting users with role: {}, requested by user: {}", roleName, requestingUserId);

        // Allow public access to view users by role (used for manager selection dropdown)
        // Only specific roles like CINEMA_MANAGER should be queryable for security
        if (!roleName.equals("CINEMA_MANAGER")) {
            if (!isUserAdmin(requestingUserId)) {
                return ApiResponse.<List<UserInfo>>builder()
                        .success(false)
                        .message("Access denied. Only administrators can view users by this role.")
                        .build();
            }
        }

        try {
            // Find role by name
            var role = roleRepository.findByRoleName(roleName);
            if (role.isEmpty()) {
                return ApiResponse.<List<UserInfo>>builder()
                        .success(false)
                        .message("Role not found: " + roleName)
                        .build();
            }

            // Find all users with this role
            List<UserRole> userRoles = userRoleRepository.findByRoleId(role.get().getId());
            
            List<UserInfo> users = userRoles.stream()
                    .map(userRole -> {
                        User user = userRole.getUser();
                        return UserInfo.builder()
                                .userId(user.getId())
                                .email(user.getEmail())
                                .fullName(user.getFullName())
                                .phone(user.getPhoneNumber())
                                .roles(List.of(roleName))
                                .isActive(user.getIsActive())
                                .createdAt(user.getCreatedAt())
                                .build();
                    })
                    .collect(Collectors.toList());

            log.info("Found {} users with role {}", users.size(), roleName);
            return ApiResponse.<List<UserInfo>>builder()
                    .success(true)
                    .message("Users found")
                    .data(users)
                    .build();

        } catch (Exception e) {
            log.error("Error getting users by role", e);
            return ApiResponse.<List<UserInfo>>builder()
                    .success(false)
                    .message("Failed to get users: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Soft delete user account (Admin only)
     */
    @Transactional
    public ApiResponse<String> deleteUser(Integer userIdToDelete, Integer requestingUserId) {
        log.info("🗑️ Soft deleting user: {}, requested by: {}", userIdToDelete, requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Chỉ admin mới có quyền xóa user")
                    .build();
        }

        try {
            // Không cho phép xóa chính mình
            if (userIdToDelete.equals(requestingUserId)) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Không thể xóa chính tài khoản của bạn")
                        .build();
            }

            // Kiểm tra user có tồn tại không
            User user = userRepository.findById(userIdToDelete)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Soft delete - chỉ set isActive = false
            user.setIsActive(false);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);

            log.info("✅ Successfully soft deleted user: {}", userIdToDelete);
            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Vô hiệu hóa tài khoản thành công")
                    .data("User ID: " + userIdToDelete)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error soft deleting user {}", userIdToDelete, e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Activate user account (Admin only)
     */
    @Transactional
    public ApiResponse<String> activateUser(Integer userIdToActivate, Integer requestingUserId) {
        log.info("✅ Activating user: {}, requested by: {}", userIdToActivate, requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Chỉ admin mới có quyền kích hoạt user")
                    .build();
        }

        try {
            // Kiểm tra user có tồn tại không
            User user = userRepository.findById(userIdToActivate)
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Activate - set isActive = true
            user.setIsActive(true);
            user.setUpdatedAt(Instant.now());
            userRepository.save(user);

            log.info("✅ Successfully activated user: {}", userIdToActivate);
            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Kích hoạt tài khoản thành công")
                    .data("User ID: " + userIdToActivate)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error activating user {}", userIdToActivate, e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Lỗi: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all membership tiers (Admin only)
     */
    public ApiResponse<List<MembershipTierDto>> getAllMembershipTiers(Integer requestingUserId) {
        log.info("Getting all membership tiers, requested by user: {}", requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<List<MembershipTierDto>>builder()
                    .success(false)
                    .message("Chỉ admin mới có quyền xem danh sách hạng thành viên")
                    .build();
        }

        try {
            List<MembershipTier> tiers = membershipTierRepository.findAll();
            List<MembershipTierDto> tierDtos = tiers.stream()
                    .map(tier -> MembershipTierDto.builder()
                            .tierId(tier.getId())
                            .tierName(tier.getTierName())
                            .tierNameDisplay(tier.getTierNameDisplay())
                            .tierLevel(tier.getTierLevel())
                            .minAnnualSpending(tier.getMinAnnualSpending())
                            .pointsEarnRate(tier.getPointsEarnRate())
                            .freeTicketsPerYear(tier.getFreeTicketsPerYear())
                            .birthdayGiftDescription(tier.getBirthdayGiftDescription())
                            .build())
                    .sorted((a, b) -> a.getTierLevel().compareTo(b.getTierLevel()))
                    .collect(Collectors.toList());

            return ApiResponse.<List<MembershipTierDto>>builder()
                    .success(true)
                    .message("Lấy danh sách hạng thành viên thành công")
                    .data(tierDtos)
                    .build();

        } catch (Exception e) {
            log.error("Error getting membership tiers", e);
            return ApiResponse.<List<MembershipTierDto>>builder()
                    .success(false)
                    .message("Lỗi: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update user's membership tier manually (Admin only)
     */
    @Transactional
    public ApiResponse<UserInfo> updateMembershipTier(UpdateMembershipTierRequest request, Integer requestingUserId) {
        log.info("🔄 Updating membership tier for user: {} to tier: {}, requested by: {}", 
                request.getUserId(), request.getTierName(), requestingUserId);

        if (!isUserAdmin(requestingUserId)) {
            return ApiResponse.<UserInfo>builder()
                    .success(false)
                    .message("Chỉ admin mới có quyền nâng hạng thành viên")
                    .build();
        }

        try {
            // Find user
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User không tồn tại"));

            // Find tier
            MembershipTier newTier = membershipTierRepository.findByTierName(request.getTierName())
                    .orElseThrow(() -> new RuntimeException("Hạng thành viên không tồn tại: " + request.getTierName()));

            // Find or create membership
            Membership membership = membershipRepository.findByUserId(request.getUserId())
                    .orElse(null);

            if (membership == null) {
                // Create new membership
                membership = new Membership();
                membership.setUser(user);
                membership.setMembershipNumber("MEM" + String.format("%08d", user.getId()));
                membership.setTotalPoints(0);
                membership.setAvailablePoints(0);
                membership.setLifetimeSpending(java.math.BigDecimal.ZERO);
                membership.setAnnualSpending(java.math.BigDecimal.ZERO);
                membership.setTotalVisits(0);
                membership.setCreatedAt(Instant.now());
            }

            // Update tier
            MembershipTier oldTier = membership.getTier();
            membership.setTier(newTier);
            membership.setTierStartDate(LocalDate.now());
            membership.setNextTierReviewDate(LocalDate.now().plusYears(1));
            membership.setUpdatedAt(Instant.now());

            membershipRepository.save(membership);

            log.info("✅ Successfully updated membership tier for user: {} from {} to {}", 
                    request.getUserId(), 
                    oldTier != null ? oldTier.getTierName() : "none", 
                    newTier.getTierName());

            UserInfo userInfo = convertToUserInfo(user);

            return ApiResponse.<UserInfo>builder()
                    .success(true)
                    .message("Nâng hạng thành viên thành công từ " + 
                            (oldTier != null ? oldTier.getTierNameDisplay() : "chưa có") + 
                            " lên " + newTier.getTierNameDisplay())
                    .data(userInfo)
                    .build();

        } catch (Exception e) {
            log.error("❌ Error updating membership tier for user: {}", request.getUserId(), e);
            return ApiResponse.<UserInfo>builder()
                    .success(false)
                    .message("Lỗi: " + e.getMessage())
                    .build();
        }
    }
}
package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ChangePasswordRequest;
import aws.movie_ticket_sales_web_project.dto.UpdateProfileRequest;
import aws.movie_ticket_sales_web_project.dto.UserProfileDto;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.entity.UserRole;
import aws.movie_ticket_sales_web_project.entity.Membership;
import aws.movie_ticket_sales_web_project.entity.MembershipTier;
import aws.movie_ticket_sales_web_project.repository.UserRepository;
import aws.movie_ticket_sales_web_project.repository.UserRoleRepository;
import aws.movie_ticket_sales_web_project.repository.MembershipRepository;
import aws.movie_ticket_sales_web_project.repository.MembershipTierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Lấy thông tin profile của user
     */
    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Integer userId) {
        log.info("Getting profile for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        return convertToDto(user);
    }

    /**
     * Cập nhật thông tin cá nhân
     */
    @Transactional
    public UserProfileDto updateProfile(Integer userId, UpdateProfileRequest request) {
        log.info("Updating profile for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        // Cập nhật các field nếu được gửi lên
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName().trim());
        }
        
        if (request.getPhoneNumber() != null) {
            // Kiểm tra số điện thoại đã tồn tại chưa (trừ user hiện tại)
            if (!request.getPhoneNumber().isBlank() && 
                userRepository.existsByPhoneNumber(request.getPhoneNumber()) &&
                !request.getPhoneNumber().equals(user.getPhoneNumber())) {
                throw new RuntimeException("Số điện thoại này đã được sử dụng bởi tài khoản khác");
            }
            user.setPhoneNumber(request.getPhoneNumber().isBlank() ? null : request.getPhoneNumber().trim());
        }
        
        if (request.getDateOfBirth() != null) {
            user.setDateOfBirth(request.getDateOfBirth());
        }
        
        if (request.getGender() != null) {
            user.setGender(request.getGender());
        }
        
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl().isBlank() ? null : request.getAvatarUrl().trim());
        }
        
        if (request.getMarketingEmailConsent() != null) {
            user.setMarketingEmailConsent(request.getMarketingEmailConsent());
        }
        
        if (request.getMarketingSmsConsent() != null) {
            user.setMarketingSmsConsent(request.getMarketingSmsConsent());
        }
        
        user.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(user);
        
        log.info("Profile updated successfully for user: {}", userId);
        return convertToDto(updatedUser);
    }

    /**
     * Thay đổi mật khẩu
     */
    @Transactional
    public void changePassword(Integer userId, ChangePasswordRequest request) {
        log.info("Changing password for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }
        
        // Kiểm tra mật khẩu mới và xác nhận khớp nhau
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Mật khẩu mới và xác nhận mật khẩu không khớp");
        }
        
        // Kiểm tra mật khẩu mới không trùng với mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }
        
        // Cập nhật mật khẩu mới
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        
        log.info("Password changed successfully for user: {}", userId);
    }

    /**
     * Cập nhật avatar
     */
    @Transactional
    public UserProfileDto updateAvatar(Integer userId, String avatarUrl) {
        log.info("Updating avatar for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
        
        user.setAvatarUrl(avatarUrl);
        user.setUpdatedAt(Instant.now());
        User updatedUser = userRepository.save(user);
        
        log.info("Avatar updated successfully for user: {}", userId);
        return convertToDto(updatedUser);
    }

    /**
     * Convert User entity to DTO
     */
    private UserProfileDto convertToDto(User user) {
        List<UserRole> userRoles = userRoleRepository.findByUserId(user.getId());
        List<String> roles = userRoles.stream()
                .map(ur -> ur.getRole().getRoleName())
                .collect(Collectors.toList());
        
        return UserProfileDto.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .fullName(user.getFullName())
                .dateOfBirth(user.getDateOfBirth())
                .gender(user.getGender())
                .avatarUrl(user.getAvatarUrl())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .marketingEmailConsent(user.getMarketingEmailConsent())
                .marketingSmsConsent(user.getMarketingSmsConsent())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roles)
                .membership(getMembershipInfo(user.getId()))
                .build();
    }

    /**
     * Fetch membership info from database
     */
    private UserProfileDto.MembershipInfo getMembershipInfo(Integer userId) {
        try {
            return membershipRepository.findByUserId(userId)
                    .map(membership -> {
                        MembershipTier tier = membership.getTier();
                        
                        // Tính availablePoints dựa trên totalPoints (nếu availablePoints = 0)
                        Integer availablePoints = membership.getAvailablePoints();
                        if (availablePoints == null || availablePoints == 0) {
                            // Nếu availablePoints = 0, sử dụng totalPoints làm available
                            availablePoints = membership.getTotalPoints() != null ? membership.getTotalPoints() : 0;
                        }
                        
                        // Tính chi tiêu tối thiểu để lên hạng tiếp
                        BigDecimal minSpendingForNextTier = null;
                        String nextTierName = null;
                        
                        if (tier != null) {
                            // Tìm tier tiếp theo (tier level cao hơn, cùng loại)
                            List<MembershipTier> allTiers = membershipTierRepository.findAll();
                            MembershipTier nextTier = allTiers.stream()
                                    .filter(t -> t.getTierLevel() > tier.getTierLevel())
                                    .min((t1, t2) -> t1.getTierLevel().compareTo(t2.getTierLevel()))
                                    .orElse(null);
                            
                            if (nextTier != null) {
                                minSpendingForNextTier = nextTier.getMinAnnualSpending();
                                nextTierName = nextTier.getTierNameDisplay();
                            }
                        }
                        
                        return UserProfileDto.MembershipInfo.builder()
                                .membershipNumber(membership.getMembershipNumber())
                                .tierName(tier != null ? tier.getTierName() : "BRONZE")
                                .tierNameDisplay(tier != null ? tier.getTierNameDisplay() : "Thành viên Đồng")
                                .tierLevel(tier != null ? tier.getTierLevel() : 1)
                                .totalPoints(membership.getTotalPoints())
                                .availablePoints(availablePoints)
                                .lifetimeSpending(membership.getLifetimeSpending())
                                .annualSpending(membership.getAnnualSpending())
                                .pointsEarnRate(tier != null ? tier.getPointsEarnRate() : BigDecimal.ONE)
                                .freeTicketsPerYear(tier != null ? tier.getFreeTicketsPerYear() : 0)
                                .birthdayGift(tier != null ? tier.getBirthdayGiftDescription() : null)
                                .minSpendingForNextTier(minSpendingForNextTier)
                                .nextTierName(nextTierName)
                                .status(membership.getStatus() != null ? membership.getStatus().toString() : "ACTIVE")
                                .build();
                    })
                    .orElse(null);
        } catch (Exception e) {
            log.warn("Error fetching membership info for user {}: {}", userId, e.getMessage());
            return null;
        }
    }
}

package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for user profile response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    
    private Integer userId;
    
    private String email;
    
    private String phoneNumber;
    
    private String fullName;
    
    private LocalDate dateOfBirth;
    
    private Gender gender;
    
    private String avatarUrl;
    
    private Boolean isActive;
    
    private Boolean isEmailVerified;
    
    private Boolean isPhoneVerified;
    
    private Boolean marketingEmailConsent;
    
    private Boolean marketingSmsConsent;
    
    private Instant lastLoginAt;
    
    private Instant createdAt;
    
    private Instant updatedAt;
    
    // Roles
    private List<String> roles;
    
    // Membership info
    private MembershipInfo membership;
    
    /**
     * DTO cho thông tin hạng thành viên
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MembershipInfo {
        private String membershipNumber;        // Mã thành viên
        private String tierName;                // Tên hạng (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND)
        private String tierNameDisplay;         // Tên hiển thị (Thành viên Đồng, Bạc, Vàng...)
        private Integer tierLevel;              // Cấp độ (1-5)
        private Integer totalPoints;            // Tổng điểm tích lũy
        private Integer availablePoints;        // Điểm khả dụng
        private BigDecimal lifetimeSpending;    // Tổng chi tiêu
        private BigDecimal annualSpending;      // Chi tiêu trong năm
        private BigDecimal pointsEarnRate;      // Tỷ lệ tích điểm
        private Integer freeTicketsPerYear;     // Số vé miễn phí/năm
        private String birthdayGift;            // Quà sinh nhật
        private BigDecimal minSpendingForNextTier;  // Chi tiêu tối thiểu để lên hạng tiếp
        private String nextTierName;            // Hạng tiếp theo
        private String status;                  // Trạng thái membership (ACTIVE, SUSPENDED, CANCELLED)
    }
    private Integer availablePoints;
    
    private String membershipTier;
    
    private String membershipNumber;
}

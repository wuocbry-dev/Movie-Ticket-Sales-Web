package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Membership;
import aws.movie_ticket_sales_web_project.entity.MembershipTier;
import aws.movie_ticket_sales_web_project.entity.PointsTransaction;
import aws.movie_ticket_sales_web_project.enums.TransactionType;
import aws.movie_ticket_sales_web_project.enums.SourceType;
import aws.movie_ticket_sales_web_project.repository.MembershipRepository;
import aws.movie_ticket_sales_web_project.repository.MembershipTierRepository;
import aws.movie_ticket_sales_web_project.repository.PointsTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoyaltyPointsService {
    
    private final MembershipRepository membershipRepository;
    private final MembershipTierRepository membershipTierRepository;
    private final PointsTransactionRepository pointsTransactionRepository;
    
    // Tỷ lệ quy đổi: 1000 VND = 1 điểm
    private static final BigDecimal POINTS_CONVERSION_RATE = new BigDecimal("1000");
    
    /**
     * Tích điểm cho booking khi thanh toán thành công
     * @param booking Booking đã thanh toán
     * @return Số điểm được tích
     */
    @Transactional
    public Integer earnPointsFromBooking(Booking booking) {
        if (booking == null || booking.getUser() == null) {
            log.warn("Cannot earn points: booking or user is null");
            return 0;
        }
        
        try {
            // Tìm membership của user
            Membership membership = membershipRepository.findByUserId(booking.getUser().getId())
                    .orElseGet(() -> createDefaultMembership(booking.getUser().getId()));
            
            // Tính số điểm cơ bản (totalAmount / 1000)
            BigDecimal totalAmount = booking.getTotalAmount();
            Integer basePoints = totalAmount.divide(POINTS_CONVERSION_RATE, 0, RoundingMode.DOWN).intValue();
            
            // Áp dụng hệ số nhân điểm từ tier (nếu có)
            BigDecimal pointsEarnRate = membership.getTier() != null 
                    ? membership.getTier().getPointsEarnRate() 
                    : BigDecimal.ONE;
            
            Integer earnedPoints = new BigDecimal(basePoints)
                    .multiply(pointsEarnRate)
                    .setScale(0, RoundingMode.DOWN)
                    .intValue();
            
            if (earnedPoints <= 0) {
                log.info("No points earned for booking {} (amount too small)", booking.getBookingCode());
                return 0;
            }
            
            // Cập nhật membership
            Integer currentTotal = membership.getTotalPoints() != null ? membership.getTotalPoints() : 0;
            Integer currentAvailable = membership.getAvailablePoints() != null ? membership.getAvailablePoints() : 0;
            
            membership.setTotalPoints(currentTotal + earnedPoints);
            membership.setAvailablePoints(currentAvailable + earnedPoints);
            membership.setUpdatedAt(Instant.now());
            
            // Cập nhật lifetime spending
            BigDecimal currentLifetimeSpending = membership.getLifetimeSpending() != null 
                    ? membership.getLifetimeSpending() 
                    : BigDecimal.ZERO;
            membership.setLifetimeSpending(currentLifetimeSpending.add(totalAmount));
            
            // Cập nhật annual spending
            BigDecimal currentAnnualSpending = membership.getAnnualSpending() != null 
                    ? membership.getAnnualSpending() 
                    : BigDecimal.ZERO;
            membership.setAnnualSpending(currentAnnualSpending.add(totalAmount));
            
            // Tăng số lượt visit
            Integer currentVisits = membership.getTotalVisits() != null ? membership.getTotalVisits() : 0;
            membership.setTotalVisits(currentVisits + 1);
            
            membershipRepository.save(membership);
            
            // Tạo transaction log
            PointsTransaction transaction = new PointsTransaction();
            transaction.setUser(booking.getUser());
            transaction.setTransactionType(TransactionType.EARN);
            transaction.setPointsAmount(earnedPoints);
            transaction.setSourceType(SourceType.BOOKING);
            transaction.setSourceId(booking.getId());
            transaction.setDescription("Tích điểm từ booking " + booking.getBookingCode());
            transaction.setBalanceBefore(currentAvailable);
            transaction.setBalanceAfter(membership.getAvailablePoints());
            transaction.setExpiresAt(LocalDate.now().plusYears(1)); // Điểm có hiệu lực 1 năm
            transaction.setCreatedAt(Instant.now());
            
            pointsTransactionRepository.save(transaction);
            
            log.info("✅ User {} earned {} points from booking {} (Base: {}, Rate: {}x)", 
                    booking.getUser().getId(), earnedPoints, booking.getBookingCode(), 
                    basePoints, pointsEarnRate);
            
            // Kiểm tra và nâng hạng membership nếu đủ điều kiện
            checkAndUpgradeTier(membership);
            
            return earnedPoints;
            
        } catch (Exception e) {
            log.error("Error earning points for booking {}: {}", booking.getBookingCode(), e.getMessage(), e);
            return 0;
        }
    }
    
    /**
     * Tạo membership mặc định cho user mới
     */
    private Membership createDefaultMembership(Integer userId) {
        log.info("Creating default membership for user {}", userId);
        
        Membership membership = new Membership();
        membership.setUser(new aws.movie_ticket_sales_web_project.entity.User());
        membership.getUser().setId(userId);
        
        // Tìm Bronze tier (tier level 1)
        MembershipTier bronzeTier = membershipTierRepository.findByTierLevel(1)
                .orElseThrow(() -> new RuntimeException("Bronze tier not found"));
        
        membership.setTier(bronzeTier);
        membership.setMembershipNumber("MEM" + System.currentTimeMillis());
        membership.setTotalPoints(0);
        membership.setAvailablePoints(0);
        membership.setLifetimeSpending(BigDecimal.ZERO);
        membership.setAnnualSpending(BigDecimal.ZERO);
        membership.setTotalVisits(0);
        membership.setTierStartDate(java.time.LocalDate.now());
        membership.setCreatedAt(Instant.now());
        membership.setUpdatedAt(Instant.now());
        
        return membershipRepository.save(membership);
    }
    
    /**
     * Kiểm tra và nâng hạng membership
     */
    private void checkAndUpgradeTier(Membership membership) {
        try {
            MembershipTier currentTier = membership.getTier();
            if (currentTier == null) {
                return;
            }
            
            BigDecimal annualSpending = membership.getAnnualSpending() != null 
                    ? membership.getAnnualSpending() 
                    : BigDecimal.ZERO;
            Integer totalVisits = membership.getTotalVisits() != null ? membership.getTotalVisits() : 0;
            
            log.info("Checking tier upgrade for user {}: annualSpending={}, totalVisits={}, currentTier={}", 
                    membership.getUser().getId(), annualSpending, totalVisits, currentTier.getTierName());
            
            // Tìm tier CAO NHẤT mà user đủ điều kiện (sorted descending by tier level)
            membershipTierRepository.findAll().stream()
                    .filter(tier -> tier.getTierLevel() != null && currentTier.getTierLevel() != null)
                    .filter(tier -> tier.getTierLevel() > currentTier.getTierLevel())
                    .filter(tier -> {
                        BigDecimal minSpending = tier.getMinAnnualSpending() != null 
                                ? tier.getMinAnnualSpending() 
                                : BigDecimal.ZERO;
                        Integer minVisits = tier.getMinVisitsPerYear() != null 
                                ? tier.getMinVisitsPerYear() 
                                : 0;
                        
                        boolean spendingQualified = annualSpending.compareTo(minSpending) >= 0;
                        boolean visitsQualified = minVisits == 0 || totalVisits >= minVisits;
                        
                        log.debug("Tier {}: minSpending={}, minVisits={}, spendingQualified={}, visitsQualified={}", 
                                tier.getTierName(), minSpending, minVisits, spendingQualified, visitsQualified);
                        
                        // Đủ điều kiện chi tiêu (điều kiện chính)
                        return spendingQualified;
                    })
                    .max((t1, t2) -> t1.getTierLevel().compareTo(t2.getTierLevel())) // Lấy tier cao nhất
                    .ifPresent(newTier -> {
                        log.info("🎉 Upgrading user {} from {} to {}", 
                                membership.getUser().getId(), 
                                currentTier.getTierName(), 
                                newTier.getTierName());
                        membership.setTier(newTier);
                        membership.setTierStartDate(java.time.LocalDate.now());
                        membership.setUpdatedAt(Instant.now());
                        membershipRepository.save(membership);
                    });
                    
        } catch (Exception e) {
            log.error("Error checking tier upgrade: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Trừ điểm khi user sử dụng điểm để đổi quà/giảm giá
     */
    @Transactional
    public boolean redeemPoints(Integer userId, Integer points, String description) {
        try {
            Membership membership = membershipRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Membership not found"));
            
            Integer availablePoints = membership.getAvailablePoints() != null 
                    ? membership.getAvailablePoints() 
                    : 0;
            
            if (availablePoints < points) {
                log.warn("User {} has insufficient points. Available: {}, Required: {}", 
                        userId, availablePoints, points);
                return false;
            }
            
            // Trừ điểm
            membership.setAvailablePoints(availablePoints - points);
            membership.setUpdatedAt(Instant.now());
            membershipRepository.save(membership);
            
            // Tạo transaction log
            PointsTransaction transaction = new PointsTransaction();
            transaction.setUser(new aws.movie_ticket_sales_web_project.entity.User());
            transaction.getUser().setId(userId);
            transaction.setTransactionType(TransactionType.REDEEM);
            transaction.setPointsAmount(-points); // Số âm để biểu thị trừ điểm
            transaction.setSourceType(SourceType.MANUAL);
            transaction.setDescription(description);
            transaction.setBalanceBefore(availablePoints);
            transaction.setBalanceAfter(membership.getAvailablePoints());
            transaction.setCreatedAt(Instant.now());
            
            pointsTransactionRepository.save(transaction);
            
            log.info("✅ User {} redeemed {} points. New balance: {}", 
                    userId, points, membership.getAvailablePoints());
            
            return true;
            
        } catch (Exception e) {
            log.error("Error redeeming points for user {}: {}", userId, e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Hoàn trả điểm khi booking bị huỷ
     * @param userId ID của user
     * @param points Số điểm cần hoàn trả
     * @param description Mô tả giao dịch
     * @return true nếu hoàn trả thành công
     */
    @Transactional
    public boolean refundPoints(Integer userId, Integer points, String description) {
        if (points == null || points <= 0) {
            log.info("No points to refund for user {}", userId);
            return true; // Nothing to refund
        }
        
        try {
            Membership membership = membershipRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("Membership not found"));
            
            Integer availablePoints = membership.getAvailablePoints() != null 
                    ? membership.getAvailablePoints() 
                    : 0;
            
            // Hoàn trả điểm
            membership.setAvailablePoints(availablePoints + points);
            membership.setUpdatedAt(Instant.now());
            membershipRepository.save(membership);
            
            // Tạo transaction log
            PointsTransaction transaction = new PointsTransaction();
            transaction.setUser(new aws.movie_ticket_sales_web_project.entity.User());
            transaction.getUser().setId(userId);
            transaction.setTransactionType(TransactionType.REFUND);
            transaction.setPointsAmount(points); // Số dương vì hoàn trả
            transaction.setSourceType(SourceType.BOOKING);
            transaction.setDescription(description);
            transaction.setBalanceBefore(availablePoints);
            transaction.setBalanceAfter(membership.getAvailablePoints());
            transaction.setCreatedAt(Instant.now());
            
            pointsTransactionRepository.save(transaction);
            
            log.info("✅ User {} refunded {} points. New balance: {}", 
                    userId, points, membership.getAvailablePoints());
            
            return true;
            
        } catch (Exception e) {
            log.error("Error refunding points for user {}: {}", userId, e.getMessage(), e);
            return false;
        }
    }
}

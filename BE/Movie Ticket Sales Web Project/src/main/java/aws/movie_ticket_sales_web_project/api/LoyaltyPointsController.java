package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.PointsTransactionDTO;
import aws.movie_ticket_sales_web_project.entity.Membership;
import aws.movie_ticket_sales_web_project.entity.PointsTransaction;
import aws.movie_ticket_sales_web_project.repository.MembershipRepository;
import aws.movie_ticket_sales_web_project.repository.PointsTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/loyalty")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class LoyaltyPointsController {

    private final PointsTransactionRepository pointsTransactionRepository;
    private final MembershipRepository membershipRepository;

    /**
     * Lấy lịch sử tích điểm của user
     * GET /api/loyalty/points/history/{userId}
     */
    @GetMapping("/points/history/{userId}")
    public ResponseEntity<ApiResponse<List<PointsTransactionDTO>>> getPointsHistory(
            @PathVariable Integer userId) {
        
        try {
            List<PointsTransaction> transactions = pointsTransactionRepository
                    .findByUserIdOrderByCreatedAtDesc(userId);
            
            List<PointsTransactionDTO> dtoList = transactions.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.<List<PointsTransactionDTO>>builder()
                    .success(true)
                    .message("Lịch sử điểm thưởng")
                    .data(dtoList)
                    .build());
                    
        } catch (Exception e) {
            log.error("Error fetching points history for user {}", userId, e);
            return ResponseEntity.ok(ApiResponse.<List<PointsTransactionDTO>>builder()
                    .success(false)
                    .message("Không thể lấy lịch sử điểm: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * Lấy tổng số điểm của user
     * GET /api/loyalty/points/balance/{userId}
     */
    @GetMapping("/points/balance/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPointsBalance(
            @PathVariable Integer userId) {
        
        try {
            // Lấy từ Membership table (source of truth)
            Membership membership = membershipRepository.findByUserId(userId)
                    .orElse(null);
            
            if (membership == null) {
                log.warn("No membership found for user {}, returning 0 points", userId);
                return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                        .success(true)
                        .message("Số dư điểm")
                        .data(Map.of(
                            "userId", userId,
                            "availablePoints", 0,
                            "totalEarned", 0,
                            "totalRedeemed", 0
                        ))
                        .build());
            }
            
            // Lấy điểm từ membership
            Integer availablePoints = membership.getAvailablePoints() != null 
                    ? membership.getAvailablePoints() 
                    : 0;
            
            // Calculate totals from transactions
            List<PointsTransaction> transactions = pointsTransactionRepository
                    .findByUserIdOrderByCreatedAtDesc(userId);
            
            Integer totalEarned = transactions.stream()
                    .filter(t -> t.getPointsAmount() > 0)
                    .mapToInt(PointsTransaction::getPointsAmount)
                    .sum();
            
            Integer totalRedeemed = Math.abs(transactions.stream()
                    .filter(t -> t.getPointsAmount() < 0)
                    .mapToInt(PointsTransaction::getPointsAmount)
                    .sum());
            
            log.info("User {} has {} available points", userId, availablePoints);
            
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("Số dư điểm")
                    .data(Map.of(
                        "userId", userId,
                        "availablePoints", availablePoints,
                        "totalEarned", totalEarned,
                        "totalRedeemed", totalRedeemed,
                        "pointsToVndRate", 1000 // 1 point = 1000 VND
                    ))
                    .build());
                    
        } catch (Exception e) {
            log.error("Error fetching points balance for user {}", userId, e);
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Không thể lấy số dư điểm: " + e.getMessage())
                    .build());
        }
    }
    
    /**
     * Preview points discount calculation
     * GET /api/loyalty/points/preview?userId={userId}&pointsToUse={points}&totalAmount={amount}
     */
    @GetMapping("/points/preview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> previewPointsDiscount(
            @RequestParam Integer userId,
            @RequestParam Integer pointsToUse,
            @RequestParam java.math.BigDecimal totalAmount) {
        
        try {
            Membership membership = membershipRepository.findByUserId(userId).orElse(null);
            
            if (membership == null) {
                return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                        .success(false)
                        .message("Không tìm thấy thông tin thành viên")
                        .build());
            }
            
            Integer availablePoints = membership.getAvailablePoints() != null 
                    ? membership.getAvailablePoints() 
                    : 0;
            
            // Calculate discount
            java.math.BigDecimal pointsToVndRate = new java.math.BigDecimal("1000");
            java.math.BigDecimal maxDiscountFromPoints = new java.math.BigDecimal(pointsToUse).multiply(pointsToVndRate);
            
            // Limit to 50% of total
            java.math.BigDecimal maxAllowedDiscount = totalAmount.multiply(new java.math.BigDecimal("0.5"));
            
            java.math.BigDecimal actualDiscount = maxDiscountFromPoints.min(maxAllowedDiscount);
            Integer actualPointsUsed = actualDiscount.divide(pointsToVndRate, 0, java.math.RoundingMode.DOWN).intValue();
            
            // Check if user has enough points
            if (actualPointsUsed > availablePoints) {
                actualPointsUsed = availablePoints;
                actualDiscount = new java.math.BigDecimal(actualPointsUsed).multiply(pointsToVndRate);
            }
            
            java.math.BigDecimal finalAmount = totalAmount.subtract(actualDiscount);
            
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(true)
                    .message("Preview giảm giá điểm")
                    .data(Map.of(
                        "availablePoints", availablePoints,
                        "requestedPoints", pointsToUse,
                        "actualPointsUsed", actualPointsUsed,
                        "discountAmount", actualDiscount,
                        "originalAmount", totalAmount,
                        "finalAmount", finalAmount,
                        "maxDiscountPercentage", 50
                    ))
                    .build());
                    
        } catch (Exception e) {
            log.error("Error previewing points discount", e);
            return ResponseEntity.ok(ApiResponse.<Map<String, Object>>builder()
                    .success(false)
                    .message("Lỗi: " + e.getMessage())
                    .build());
        }
    }
    
    private PointsTransactionDTO convertToDTO(PointsTransaction transaction) {
        return PointsTransactionDTO.builder()
                .transactionId(transaction.getId())
                .transactionType(transaction.getTransactionType())
                .pointsAmount(transaction.getPointsAmount())
                .sourceType(transaction.getSourceType())
                .sourceId(transaction.getSourceId())
                .description(transaction.getDescription())
                .balanceBefore(transaction.getBalanceBefore())
                .balanceAfter(transaction.getBalanceAfter())
                .expiresAt(transaction.getExpiresAt())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}

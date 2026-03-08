package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * DTO cho đơn hàng bắp nước
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConcessionOrderDTO {
    private Integer orderId;
    private Integer userId;
    private String userName;
    private String userEmail;
    private Integer cinemaId;
    private String cinemaName;
    private Integer showtimeId;
    private String movieTitle;
    private Instant showtimeDate;
    private BigDecimal totalAmount;
    private ConcessionOrderStatus status;
    private String pickupCode;
    private Instant pickupTime;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
    
    // Chi tiết items
    private List<ConcessionOrderItemDTO> items;
    
    // Payment info
    private Integer paymentId;
    private String paymentStatus;
}

package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingDto {
    private Integer bookingId;
    private String bookingCode;
    
    // User info
    private Integer userId;
    private String username;
    
    // Customer info
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    // Showtime info
    private Integer showtimeId;
    private String movieTitle;
    private Integer cinemaId;
    private String cinemaName;
    private String hallName;
    private String showDate;
    private String startTime;
    private String formatType;
    
    // Booking details
    private Instant bookingDate;
    private Integer totalSeats;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal serviceFee;
    private BigDecimal totalAmount;
    private Integer pointsUsed;
    private BigDecimal pointsDiscount; // Calculated: pointsUsed * 1000
    
    // Status
    private StatusBooking status;
    private PaymentStatus paymentStatus;
    private String paymentMethod;
    private String paymentReference;
    private Instant paidAt;
    private Instant holdExpiresAt;
    
    // Additional info
    private String qrCode;
    private String invoiceNumber;
    private Instant invoiceIssuedAt;
    
    // Tickets
    private List<TicketDto> tickets;
    
    // Concession Order
    private ConcessionOrderSummary concessionOrder;
    
    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConcessionOrderSummary {
        private Integer orderId;
        private BigDecimal totalAmount;
        private String status;
        private List<ConcessionItemSummary> items;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConcessionItemSummary {
        private Integer itemId;
        private String itemName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}


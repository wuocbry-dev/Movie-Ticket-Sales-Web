package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueReportDto {
    
    private LocalDate date;
    private Long totalBookings;
    private Long totalTickets;
    private BigDecimal totalRevenue;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal serviceFee;
    private BigDecimal discountAmount;
    
    // By payment method
    private BigDecimal creditCardRevenue;
    private BigDecimal bankTransferRevenue;
    private BigDecimal eWalletRevenue;
    private BigDecimal cashRevenue;
    
    // Booking status breakdown
    private Long completedBookings;
    private Long cancelledBookings;
    private Long pendingBookings;
}

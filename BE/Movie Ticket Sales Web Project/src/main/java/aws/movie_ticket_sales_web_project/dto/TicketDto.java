package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketDto {
    private Integer ticketId;
    private String ticketCode;
    
    // Seat info
    private Integer seatId;
    private String seatNumber;
    private String seatRow;
    private String seatType;
    
    // Pricing
    private BigDecimal basePrice;
    private BigDecimal surchargeAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalPrice;
    
    // Status
    private TicketStatus status;
    private Instant checkedInAt;
    private String checkedInByUsername;
}

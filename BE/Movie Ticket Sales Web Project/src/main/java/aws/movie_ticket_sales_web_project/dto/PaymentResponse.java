package aws.movie_ticket_sales_web_project.dto;

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
public class PaymentResponse {
    
    private String transactionId;
    private String bookingCode;
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentGatewayUrl; // URL to redirect for payment
    private String qrCodeUrl; // For QR payment
    private Instant paidAt;
    private String message;
    private String errorCode;
}

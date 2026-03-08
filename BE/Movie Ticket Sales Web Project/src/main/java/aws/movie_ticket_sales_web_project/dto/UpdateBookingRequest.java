package aws.movie_ticket_sales_web_project.dto;

import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateBookingRequest {
    
    private StatusBooking status;
    
    private PaymentStatus paymentStatus;
    
    private String paymentReference;
    
    private String customerName;
    
    private String customerEmail;
    
    private String customerPhone;
}

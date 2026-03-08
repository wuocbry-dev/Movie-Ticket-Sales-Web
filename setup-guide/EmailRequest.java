package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {
    
    public enum EmailType {
        BOOKING_CONFIRMATION,
        REFUND_CONFIRMATION,
        PASSWORD_RESET
    }
    
    private EmailType emailType;
    private String toEmail;
    private String subject;
    private String htmlContent; // Optional - nếu không có sẽ dùng template
    private Map<String, Object> templateData;
}
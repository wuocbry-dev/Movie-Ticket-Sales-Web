package aws.movie_ticket_sales_web_project.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for email requests published to SNS Topic
 * Lambda will process this and send via SES
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EmailRequest {
    
    /**
     * Email type for Lambda to determine template
     */
    private EmailType emailType;
    
    /**
     * Recipient email address
     */
    private String toEmail;
    
    /**
     * Email subject
     */
    private String subject;
    
    /**
     * Pre-built HTML content (optional - Lambda can build from template)
     */
    private String htmlContent;
    
    /**
     * Template data for Lambda to build email content
     */
    private Map<String, Object> templateData;
    
    /**
     * Email types supported by the system
     */
    public enum EmailType {
        BOOKING_CONFIRMATION,
        REFUND_CONFIRMATION,
        PASSWORD_RESET
    }
}

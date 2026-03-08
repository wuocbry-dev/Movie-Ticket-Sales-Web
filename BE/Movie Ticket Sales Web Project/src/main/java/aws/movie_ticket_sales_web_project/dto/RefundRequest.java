package aws.movie_ticket_sales_web_project.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequest {
    
    @NotBlank(message = "Reason is required")
    private String reason;
    
    private String bankAccountNumber; // For refund transfer
    private String bankAccountName;
    private String bankCode;
    
    // Admin use
    private String adminNotes;
}

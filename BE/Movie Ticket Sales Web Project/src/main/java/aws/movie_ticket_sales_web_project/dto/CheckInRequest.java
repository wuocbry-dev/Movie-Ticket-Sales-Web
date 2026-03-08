package aws.movie_ticket_sales_web_project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckInRequest {
    
    @NotBlank(message = "Booking code is required")
    private String bookingCode;
    
    @NotNull(message = "Staff ID is required")
    private Integer staffId;
    
    // Optional: specific ticket codes if checking in individual tickets
    private String ticketCode;
}

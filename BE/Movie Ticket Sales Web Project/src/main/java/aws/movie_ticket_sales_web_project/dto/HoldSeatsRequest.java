package aws.movie_ticket_sales_web_project.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoldSeatsRequest {
    
    @NotNull(message = "Showtime ID is required")
    private Integer showtimeId;
    
    @NotEmpty(message = "At least one seat must be selected")
    private List<Integer> seatIds;
    
    @NotNull(message = "Session ID is required")
    private String sessionId; // Client-side generated UUID or session ID
    
    private String customerEmail; // Optional, for tracking
}

package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

/**
 * DTO for seat hold information stored in Redis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatHoldDto implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Integer showtimeId;
    private List<Integer> seatIds;
    private String sessionId; // Browser session ID or user identifier
    private String customerEmail;
    private Long holdExpiresAt; // Epoch milliseconds
    private Long createdAt; // Epoch milliseconds
}

package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

/**
 * DTO để gán nhân viên vào rạp
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignStaffRequest {
    
    @NotNull(message = "User ID is required")
    private Integer userId;
    
    @NotNull(message = "Cinema ID is required")
    private Integer cinemaId;
    
    private String position;  // TICKET_CHECKER, CASHIER, CONCESSION, etc.
    
    private String notes;
}

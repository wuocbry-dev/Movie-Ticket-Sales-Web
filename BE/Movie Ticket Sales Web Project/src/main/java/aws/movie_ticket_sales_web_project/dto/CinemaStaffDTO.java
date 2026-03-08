package aws.movie_ticket_sales_web_project.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO cho thông tin nhân viên rạp
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaStaffDTO {
    
    private Integer id;
    private Integer userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    
    private Integer cinemaId;
    private String cinemaName;
    private String cinemaAddress;
    
    private String position;
    private Boolean isActive;
    private Instant startDate;
    private Instant endDate;
    
    private Integer assignedById;
    private String assignedByName;
    
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}

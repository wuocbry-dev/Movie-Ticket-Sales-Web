package aws.movie_ticket_sales_web_project.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentBookingDTO {
    private String id;
    private String user;
    private String movie;
    private BigDecimal amount;
    private String status;
    private String time;
}

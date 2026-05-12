package aws.movie_ticket_sales_web_project.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class RevenuePointDTO {
    private String name;
    private BigDecimal value;
}

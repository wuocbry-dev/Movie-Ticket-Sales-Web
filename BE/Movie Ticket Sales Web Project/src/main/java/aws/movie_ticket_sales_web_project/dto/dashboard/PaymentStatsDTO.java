package aws.movie_ticket_sales_web_project.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentStatsDTO {
    private String name;
    private Long value;
    private String color;
}

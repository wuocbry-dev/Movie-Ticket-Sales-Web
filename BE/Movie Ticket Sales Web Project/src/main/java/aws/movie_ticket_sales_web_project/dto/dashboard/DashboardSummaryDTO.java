package aws.movie_ticket_sales_web_project.dto.dashboard;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DashboardSummaryDTO {
    private BigDecimal revenue;
    private Double revTrend;
    private Integer tickets;
    private Double tktTrend;
    private Long bookings;
    private Double bkgTrend;
    private Double occupancy;
    private Double occTrend;
    private Long activeMovies;
    private Long todayShowtimes;
    private Long newUsers;
    private Long successfulPayments;
    private Long failedPayments;
    private Long pendingPayments;
}

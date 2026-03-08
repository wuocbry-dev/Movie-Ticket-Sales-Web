package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.RevenueReportDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final JdbcTemplate jdbcTemplate;

    public List<RevenueReportDto> getRevenueReport(LocalDate startDate, LocalDate endDate) {
        String sql = """
            SELECT 
                DATE(b.paid_at) as date,
                COUNT(b.id) as total_bookings,
                SUM(b.total_seats) as total_tickets,
                SUM(b.total_amount) as total_revenue,
                SUM(b.subtotal) as subtotal,
                SUM(b.tax_amount) as tax_amount,
                SUM(b.service_fee) as service_fee,
                SUM(b.discount_amount) as discount_amount
            FROM bookings b
            WHERE b.status = 'PAID' 
              AND DATE(b.paid_at) BETWEEN ? AND ?
            GROUP BY DATE(b.paid_at)
            ORDER BY date DESC
            """;

        return jdbcTemplate.query(sql,
                (rs, rowNum) -> RevenueReportDto.builder()
                        .date(rs.getDate("date").toLocalDate())
                        .totalBookings(rs.getLong("total_bookings"))
                        .totalTickets(rs.getLong("total_tickets"))
                        .totalRevenue(rs.getBigDecimal("total_revenue"))
                        .subtotal(rs.getBigDecimal("subtotal"))
                        .taxAmount(rs.getBigDecimal("tax_amount"))
                        .serviceFee(rs.getBigDecimal("service_fee"))
                        .discountAmount(rs.getBigDecimal("discount_amount"))
                        .build(),
                startDate, endDate);
    }
}
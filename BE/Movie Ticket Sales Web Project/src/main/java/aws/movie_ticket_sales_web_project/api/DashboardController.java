package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.dashboard.*;
import aws.movie_ticket_sales_web_project.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@CrossOrigin("*") // Or configure in WebConfig
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<DashboardSummaryDTO> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/revenue")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<RevenuePointDTO>> getRevenueTrend(
            @RequestParam(defaultValue = "RECENT") String mode,
            @RequestParam(defaultValue = "7") int days,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String month) {
        return ResponseEntity.ok(dashboardService.getRevenueTrend(mode, days, year, month));
    }

    @GetMapping("/top-movies")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<TopMovieDTO>> getTopMovies() {
        return ResponseEntity.ok(dashboardService.getTopMovies());
    }

    @GetMapping("/recent-bookings")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<RecentBookingDTO>> getRecentBookings() {
        return ResponseEntity.ok(dashboardService.getRecentBookings());
    }
    
    @GetMapping("/payments")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<PaymentStatsDTO>> getPaymentStats() {
        return ResponseEntity.ok(dashboardService.getPaymentStats());
    }
}

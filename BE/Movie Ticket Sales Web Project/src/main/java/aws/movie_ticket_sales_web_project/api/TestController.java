package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
@RequiredArgsConstructor
public class TestController {

    private final DashboardService dashboardService;

    @Autowired
    private aws.movie_ticket_sales_web_project.repository.BookingRepository bookingRepository;

    @GetMapping("/api/health/test-dashboard")
    public ResponseEntity<String> testDashboard() {
        try {
            dashboardService.getSummary();
            dashboardService.getRevenueTrend("RECENT", 7, null, null);
            dashboardService.getTopMovies();
            dashboardService.getRecentBookings();
            dashboardService.getPaymentStats();
            return ResponseEntity.ok("All dashboard methods executed successfully without exception!");
        } catch (Exception e) {
            StringBuilder sb = new StringBuilder();
            sb.append("Exception caught: ").append(e.getClass().getName()).append("\n");
            sb.append("Message: ").append(e.getMessage()).append("\n");
            for (StackTraceElement element : e.getStackTrace()) {
                sb.append("  at ").append(element.toString()).append("\n");
            }
            return ResponseEntity.status(500).body(sb.toString());
        }
    }

    @GetMapping("/api/health/test-db")
    public ResponseEntity<String> testDb() {
        try {
            long count = bookingRepository.count();
            return ResponseEntity.ok("Total bookings in DB: " + count);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}

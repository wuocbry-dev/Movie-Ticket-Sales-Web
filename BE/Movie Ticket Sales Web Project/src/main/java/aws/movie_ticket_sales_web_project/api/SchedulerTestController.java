package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.scheduler.BookingScheduler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Test controller to manually trigger scheduled tasks
 * REMOVE THIS IN PRODUCTION!
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
public class SchedulerTestController {
    
    private final BookingScheduler bookingScheduler;
    
    /**
     * Manually trigger expired bookings cancellation
     * For testing purposes only
     */
    @PostMapping("/cancel-expired-bookings")
    public ResponseEntity<?> triggerCancelExpiredBookings() {
        bookingScheduler.cancelExpiredBookings();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Expired bookings cancellation triggered");
        return ResponseEntity.ok(response);
    }
}

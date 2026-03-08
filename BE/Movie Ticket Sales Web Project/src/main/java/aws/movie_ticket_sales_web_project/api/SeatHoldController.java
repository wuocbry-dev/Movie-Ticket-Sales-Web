package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.HoldSeatsRequest;
import aws.movie_ticket_sales_web_project.dto.SeatAvailabilityResponse;
import aws.movie_ticket_sales_web_project.dto.SeatHoldDto;
import aws.movie_ticket_sales_web_project.service.SeatHoldService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SeatHoldController {
    
    private final SeatHoldService seatHoldService;
    
    /**
     * Hold seats temporarily
     * POST /api/seats/hold
     */
    @PostMapping("/hold")
    public ResponseEntity<?> holdSeats(@Valid @RequestBody HoldSeatsRequest request) {
        try {
            SeatHoldDto holdInfo = seatHoldService.holdSeats(request);
            return ResponseEntity.ok(holdInfo);
        } catch (RuntimeException e) {
            log.error("Error holding seats", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error holding seats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to hold seats"));
        }
    }
    
    /**
     * Release held seats
     * POST /api/seats/release
     */
    @PostMapping("/release")
    public ResponseEntity<?> releaseSeats(
            @RequestParam String sessionId,
            @RequestParam Integer showtimeId,
            @RequestParam List<Integer> seatIds) {
        try {
            seatHoldService.releaseSeats(sessionId, showtimeId, seatIds);
            return ResponseEntity.ok(createSuccessResponse("Seats released successfully"));
        } catch (Exception e) {
            log.error("Error releasing seats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to release seats"));
        }
    }
    
    /**
     * Extend hold duration
     * POST /api/seats/extend-hold
     */
    @PostMapping("/extend-hold")
    public ResponseEntity<?> extendHold(
            @RequestParam String sessionId,
            @RequestParam Integer showtimeId,
            @RequestParam List<Integer> seatIds,
            @RequestParam(defaultValue = "5") long additionalMinutes) {
        try {
            seatHoldService.extendHold(sessionId, showtimeId, seatIds, additionalMinutes);
            return ResponseEntity.ok(createSuccessResponse("Hold extended successfully"));
        } catch (Exception e) {
            log.error("Error extending hold", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to extend hold"));
        }
    }
    
    /**
     * Get seat availability for a showtime
     * GET /api/seats/availability/{showtimeId}?sessionId=xxx
     */
    @GetMapping("/availability/{showtimeId}")
    public ResponseEntity<?> getSeatAvailability(
            @PathVariable Integer showtimeId,
            @RequestParam String sessionId) {
        try {
            SeatAvailabilityResponse response = seatHoldService.getSeatAvailability(showtimeId, sessionId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error getting seat availability", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting seat availability", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to get seat availability"));
        }
    }
    
    /**
     * Debug endpoint: Verify if seats are held by session
     * GET /api/seats/verify-hold?showtimeId=X&sessionId=xxx&seatIds=1,2,3
     */
    @GetMapping("/verify-hold")
    public ResponseEntity<?> verifyHold(
            @RequestParam Integer showtimeId,
            @RequestParam String sessionId,
            @RequestParam List<Integer> seatIds) {
        try {
            Map<String, Object> result = seatHoldService.verifySeatsHeldBySession(showtimeId, seatIds, sessionId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error verifying hold", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to verify hold"));
        }
    }
    
    /**
     * Helper methods
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
    
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }
}

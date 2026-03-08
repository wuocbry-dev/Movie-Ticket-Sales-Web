package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class BookingController {
    
    private final BookingService bookingService;
    
    /**
     * Get all bookings with pagination and optional status filter
     * GET /api/bookings?page=0&size=10&status=PENDING
     */
    @GetMapping
    public ResponseEntity<PagedBookingResponse> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) StatusBooking status) {
        try {
            PagedBookingResponse response;
            if (status != null) {
                log.info("Getting bookings with status: {}, page: {}, size: {}", status, page, size);
                response = bookingService.getBookingsByStatus(status, page, size);
            } else {
                response = bookingService.getAllBookings(page, size);
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting all bookings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Get booking by ID
     * GET /api/bookings/{bookingId}
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<?> getBookingById(@PathVariable Integer bookingId) {
        try {
            BookingDto booking = bookingService.getBookingById(bookingId);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            log.error("Error getting booking by ID: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting booking by ID: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Get booking by booking code
     * GET /api/bookings/code/{bookingCode}
     */
    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<?> getBookingByCode(@PathVariable String bookingCode) {
        try {
            BookingDto booking = bookingService.getBookingByCode(bookingCode);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            log.error("Error getting booking by code: {}", bookingCode, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting booking by code: {}", bookingCode, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Get bookings by user ID
     * GET /api/bookings/user/{userId}?page=0&size=10
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBookingsByUserId(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("📋 Getting bookings for userId: {}, page: {}, size: {}", userId, page, size);
            PagedBookingResponse response = bookingService.getBookingsByUserId(userId, page, size);
            log.info("✅ Found {} bookings for userId: {}", response.getTotalElements(), userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error getting bookings by user ID: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error: " + e.getMessage()));
        }
    }
    
    /**
     * Get bookings by status
     * GET /api/bookings/status/{status}?page=0&size=10
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getBookingsByStatus(
            @PathVariable StatusBooking status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PagedBookingResponse response = bookingService.getBookingsByStatus(status, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting bookings by status: {}", status, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Get bookings by showtime ID
     * GET /api/bookings/showtime/{showtimeId}?page=0&size=10
     */
    @GetMapping("/showtime/{showtimeId}")
    public ResponseEntity<?> getBookingsByShowtimeId(
            @PathVariable Integer showtimeId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            PagedBookingResponse response = bookingService.getBookingsByShowtimeId(showtimeId, page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting bookings by showtime ID: {}", showtimeId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Internal server error"));
        }
    }
    
    /**
     * Create a new booking
     * POST /api/bookings
     */
    @PostMapping
    public ResponseEntity<?> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        try {
            log.info("Creating booking - showtimeId={}, seatIds={}, sessionId={}, userId={}", 
                    request.getShowtimeId(), request.getSeatIds(), request.getSessionId(), request.getUserId());
            
            BookingDto booking = bookingService.createBooking(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            log.error("Error creating booking", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating booking", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to create booking"));
        }
    }
    
    /**
     * Update booking
     * PUT /api/bookings/{bookingId}
     */
    @PutMapping("/{bookingId}")
    public ResponseEntity<?> updateBooking(
            @PathVariable Integer bookingId,
            @Valid @RequestBody UpdateBookingRequest request) {
        try {
            BookingDto booking = bookingService.updateBooking(bookingId, request);
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            log.error("Error updating booking: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating booking: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to update booking"));
        }
    }
    
    /**
     * Cancel booking
     * POST /api/bookings/{bookingId}/cancel
     */
    @PostMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Integer bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(createSuccessResponse("Booking cancelled successfully"));
        } catch (RuntimeException e) {
            log.error("Error cancelling booking: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error cancelling booking: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to cancel booking"));
        }
    }
    
    /**
     * Delete booking (admin only)
     * DELETE /api/bookings/admin/{bookingId}
     */
    @DeleteMapping("/admin/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Integer bookingId) {
        try {
            bookingService.deleteBooking(bookingId);
            return ResponseEntity.ok(createSuccessResponse("Booking deleted successfully"));
        } catch (RuntimeException e) {
            log.error("Error deleting booking: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting booking: {}", bookingId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to delete booking"));
        }
    }
    
    /**
     * Helper method to create error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
    
    /**
     * Helper method to create success response
     */
    private Map<String, Object> createSuccessResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        return response;
    }
}

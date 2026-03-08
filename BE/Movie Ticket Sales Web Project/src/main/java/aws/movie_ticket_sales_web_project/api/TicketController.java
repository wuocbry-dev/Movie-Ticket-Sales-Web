package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.CheckInRequest;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.CinemaStaff;
import aws.movie_ticket_sales_web_project.repository.CinemaRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaStaffRepository;
import aws.movie_ticket_sales_web_project.service.TicketCheckInService;
import aws.movie_ticket_sales_web_project.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {
    
    private final TicketCheckInService ticketCheckInService;
    private final TicketService ticketService;
    private final CinemaStaffRepository cinemaStaffRepository;
    private final CinemaRepository cinemaRepository;
    
    /**
     * Check-in ticket at cinema
     * POST /api/tickets/check-in
     */
    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<String>> checkIn(@Valid @RequestBody CheckInRequest request) {
        log.info("Check-in request for booking: {}", request.getBookingCode());
        ApiResponse<String> response = ticketCheckInService.checkIn(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get booking details for staff check-in
     * GET /api/tickets/staff/{staffCinemaId}/booking-details?bookingCode=xxx
     * Kiểm tra vé có thuộc rạp của staff không
     */
    @GetMapping("/staff/{staffCinemaId}/booking-details")
    @PreAuthorize("hasAnyRole('CINEMA_STAFF', 'CINEMA_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> getBookingDetailsForStaff(
            @PathVariable Integer staffCinemaId,
            @RequestParam String bookingCode) {
        log.info("Staff from cinema {} requesting booking details for: {}", staffCinemaId, bookingCode);
        
        try {
            Map<String, Object> details = ticketService.getBookingDetailsForCheckIn(bookingCode);
            
            // Lấy cinemaId từ booking
            Integer bookingCinemaId = null;
            String bookingCinemaName = null;
            
            if (details.get("showtime") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> showtime = (Map<String, Object>) details.get("showtime");
                if (showtime.get("hall") != null) {
                    @SuppressWarnings("unchecked")
Map<String, Object> hall = (Map<String, Object>) showtime.get("hall");
                    if (hall.get("cinema") != null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> cinema = (Map<String, Object>) hall.get("cinema");
                        bookingCinemaId = (Integer) cinema.get("cinemaId");
                        bookingCinemaName = (String) cinema.get("cinemaName");
                    }
                }
            }
            
            // So sánh cinemaId của booking với cinemaId của staff
            if (bookingCinemaId != null && !bookingCinemaId.equals(staffCinemaId)) {
                log.warn("Staff cinema {} cố truy cập booking của rạp {}", staffCinemaId, bookingCinemaId);
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Vé này không được mua ở rạp của bạn. Vé thuộc rạp: " + bookingCinemaName
                ));
            }
            
            // Thêm thông tin để FE biết đây là vé hợp lệ của rạp
            details.put("cinemaValidated", true);
            details.put("staffCinemaId", staffCinemaId);
            
            return ResponseEntity.ok(details);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Process staff check-in by booking code
     * POST /api/tickets/staff/check-in-booking
     */
    @PostMapping("/staff/check-in-booking")
    public ResponseEntity<Map<String, Object>> staffCheckInBooking(
            @RequestParam String bookingCode,
            @RequestParam Integer staffId) {
        log.info("Staff {} checking in booking: {}", staffId, bookingCode);
        Map<String, Object> response = ticketService.checkInByBookingCode(bookingCode, staffId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Process staff cash payment
     * POST /api/tickets/staff/cash-payment
     */
    @PostMapping("/staff/cash-payment")
    public ResponseEntity<Map<String, Object>> staffCashPayment(
            @RequestParam String bookingCode,
            @RequestParam Integer staffId) {
        log.info("Staff {} processing cash payment for booking: {}", staffId, bookingCode);
        Map<String, Object> response = ticketService.processStaffCashPayment(bookingCode, staffId);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Lấy thông tin rạp của staff/manager hiện tại
     * GET /api/tickets/staff/my-cinema?staffId=123
     */
    @GetMapping("/staff/my-cinema")
    @PreAuthorize("hasAnyRole('CINEMA_STAFF', 'CINEMA_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> getStaffCinema(@RequestParam Integer staffId) {
        log.info("Getting cinema info for user: {}", staffId);
// Check 1: Staff in cinema_staffs table
        Optional<CinemaStaff> cinemaStaffOpt = cinemaStaffRepository.findByUserId(staffId);
        
        if (cinemaStaffOpt.isPresent()) {
            CinemaStaff cinemaStaff = cinemaStaffOpt.get();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cinemaId", cinemaStaff.getCinema().getId());
            response.put("cinemaName", cinemaStaff.getCinema().getCinemaName());
            response.put("cinemaAddress", cinemaStaff.getCinema().getAddress());
            response.put("position", cinemaStaff.getPosition());
            response.put("startDate", cinemaStaff.getStartDate());
            response.put("isActive", cinemaStaff.getIsActive());
            
            return ResponseEntity.ok(response);
        }
        
        // Check 2: Manager of a cinema (manager_id in cinemas table)
        List<Cinema> managedCinemas = cinemaRepository.findByManagerId(staffId);
        if (!managedCinemas.isEmpty()) {
            Cinema cinema = managedCinemas.get(0); // Lấy rạp đầu tiên nếu manager nhiều rạp
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("cinemaId", cinema.getId());
            response.put("cinemaName", cinema.getCinemaName());
            response.put("cinemaAddress", cinema.getAddress());
            response.put("position", "MANAGER");
            response.put("startDate", null);
            response.put("isActive", true);
            
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý."
        ));
    }
}
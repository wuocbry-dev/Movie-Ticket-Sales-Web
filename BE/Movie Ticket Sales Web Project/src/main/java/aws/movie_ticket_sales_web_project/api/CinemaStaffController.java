package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.AssignStaffRequest;
import aws.movie_ticket_sales_web_project.dto.CinemaStaffDTO;
import aws.movie_ticket_sales_web_project.service.CinemaStaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * API quản lý nhân viên rạp
 */
@RestController
@RequestMapping("/api/cinema-staffs")
@RequiredArgsConstructor
@Slf4j
public class CinemaStaffController {

    private final CinemaStaffService cinemaStaffService;

    /**
     * Gán nhân viên vào rạp
     * POST /api/cinema-staffs/assign
     */
    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<CinemaStaffDTO> assignStaff(
            @Valid @RequestBody AssignStaffRequest request,
            @RequestParam Integer assignedById) {
        
        log.info("Assigning staff to cinema - request: {}", request);
        CinemaStaffDTO result = cinemaStaffService.assignStaffToCinema(request, assignedById);
        return ResponseEntity.ok(result);
    }

    /**
     * Lấy danh sách nhân viên của rạp
     * GET /api/cinema-staffs/cinema/1
     */
    @GetMapping("/cinema/{cinemaId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<List<CinemaStaffDTO>> getStaffByCinema(@PathVariable Integer cinemaId) {
        log.info("Getting staff list for cinema: {}", cinemaId);
        List<CinemaStaffDTO> staffList = cinemaStaffService.getStaffByCinema(cinemaId);
        return ResponseEntity.ok(staffList);
    }

    /**
     * Lấy thông tin rạp của staff hiện tại
     * GET /api/cinema-staffs/my-cinema?userId=123
     */
    @GetMapping("/my-cinema")
    @PreAuthorize("hasAnyRole('CINEMA_STAFF', 'CINEMA_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> getMycinema(@RequestParam Integer userId) {
        log.info("Getting cinema info for staff: {}", userId);
        
        try {
            CinemaStaffDTO result = cinemaStaffService.getStaffCinema(userId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Cho nhân viên nghỉ việc tại rạp
     * DELETE /api/cinema-staffs/remove?userId=123&cinemaId=1
     */
    @DeleteMapping("/remove")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER')")
    public ResponseEntity<?> removeStaff(
            @RequestParam Integer userId,
            @RequestParam Integer cinemaId) {
        
        log.info("Removing staff {} from cinema {}", userId, cinemaId);
        
        try {
            CinemaStaffDTO result = cinemaStaffService.removeStaffFromCinema(userId, cinemaId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đã cho nhân viên nghỉ việc tại rạp",
                    "data", result
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Kiểm tra xem staff có thuộc cinema không
     * GET /api/cinema-staffs/check?userId=123&cinemaId=1
     */
    @GetMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> checkStaffCinema(
            @RequestParam Integer userId,
            @RequestParam Integer cinemaId) {
        
        boolean isStaffOfCinema = cinemaStaffService.isStaffOfCinema(userId, cinemaId);
        
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "cinemaId", cinemaId,
                "isStaffOfCinema", isStaffOfCinema
        ));
    }
}

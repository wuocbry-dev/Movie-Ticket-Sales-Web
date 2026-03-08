package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.ConcessionOrderDTO;
import aws.movie_ticket_sales_web_project.dto.CreateConcessionOrderRequest;
import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import aws.movie_ticket_sales_web_project.repository.CinemaRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaStaffRepository;
import aws.movie_ticket_sales_web_project.service.ConcessionOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * API quản lý đơn hàng bắp nước
 */
@RestController
@RequestMapping("/api/concessions/orders")
@RequiredArgsConstructor
@Slf4j
public class ConcessionOrderController {

    private final ConcessionOrderService orderService;
    private final CinemaStaffRepository cinemaStaffRepository;
    private final CinemaRepository cinemaRepository;

    /**
     * Tạo đơn hàng mới
     * POST /api/concessions/orders
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> createOrder(
            @RequestBody CreateConcessionOrderRequest request) {
        
        log.info("Creating new concession order");
        ConcessionOrderDTO order = orderService.createOrder(request);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy chi tiết đơn hàng
     * GET /api/concessions/orders/123
     */
    @GetMapping("/{orderId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> getOrder(@PathVariable Integer orderId) {
        log.info("Fetching order: {}", orderId);
        ConcessionOrderDTO order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy đơn hàng theo order number
     * GET /api/concessions/orders/number/CO1234567890
     */
    @GetMapping("/number/{orderNumber}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> getOrderByNumber(
            @PathVariable String orderNumber) {
        
        log.info("Fetching order by number: {}", orderNumber);
        ConcessionOrderDTO order = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy danh sách đơn hàng của user
     * GET /api/concessions/orders/user/5
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConcessionOrderDTO>> getUserOrders(
            @PathVariable Integer userId) {
        
        log.info("Fetching orders for user: {}", userId);
        List<ConcessionOrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy concession order theo booking ID
     * GET /api/concessions/orders/booking/123
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> getOrderByBookingId(
            @PathVariable Integer bookingId) {
        
        log.info("Fetching concession order for booking: {}", bookingId);
        ConcessionOrderDTO order = orderService.getOrderByBookingId(bookingId);
        
        if (order == null) {
            return ResponseEntity.noContent().build(); // 204 No Content - no concession order for this booking
        }
        
        return ResponseEntity.ok(order);
    }

    /**
     * Lấy danh sách đơn hàng của rạp
     * GET /api/concessions/orders/cinema/1?status=PENDING
     */
    @GetMapping("/cinema/{cinemaId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'CINEMA_STAFF')")
    public ResponseEntity<List<ConcessionOrderDTO>> getCinemaOrders(
            @PathVariable Integer cinemaId,
            @RequestParam(required = false) ConcessionOrderStatus status) {
        
        log.info("Fetching orders for cinema {} with status {}", cinemaId, status);
        List<ConcessionOrderDTO> orders = orderService.getCinemaOrders(cinemaId, status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Lấy danh sách đơn hàng của rạp mình (cho CINEMA_STAFF)
     * Staff chỉ xem được đơn từ CONFIRMED trở đi (không xem được PENDING)
     * GET /api/concessions/orders/staff/my-cinema?status=CONFIRMED&staffId=123
     */
    @GetMapping("/staff/my-cinema")
    @PreAuthorize("hasAnyRole('CINEMA_STAFF', 'CINEMA_MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<?> getStaffCinemaOrders(
            @RequestParam Integer staffId,
            @RequestParam(required = false) ConcessionOrderStatus status) {
        
        log.info("Staff {} fetching concession orders for their cinema with status {}", staffId, status);
        
        // Lấy cinema ID của staff hoặc manager
        // Check 1: Staff in cinema_staffs table
        Optional<Integer> cinemaIdOpt = cinemaStaffRepository.getCinemaIdByStaffUserId(staffId);
        
        // Check 2: Manager of a cinema (manager_id in cinemas table)
        if (cinemaIdOpt.isEmpty()) {
            // Tìm cinema mà user này là manager
            List<aws.movie_ticket_sales_web_project.entity.Cinema> managedCinemas = cinemaRepository.findByManagerId(staffId);
            if (!managedCinemas.isEmpty()) {
                // Nếu user là manager của nhiều rạp, lấy rạp đầu tiên
                cinemaIdOpt = Optional.of(managedCinemas.get(0).getId());
            }
        }
        
        if (cinemaIdOpt.isEmpty()) {
            log.warn("User {} không được gán vào rạp nào", staffId);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý."
            ));
        }
        
        Integer cinemaId = cinemaIdOpt.get();
        log.info("User {} đang xem đơn bắp nước của rạp {}", staffId, cinemaId);
        
        try {
            // Sử dụng method mới cho staff (không xem được PENDING)
            List<ConcessionOrderDTO> orders = orderService.getCinemaOrdersForStaff(cinemaId, status);
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Cập nhật trạng thái đơn hàng (Manager/Staff only)
     * PUT /api/concessions/orders/123/status
     * Staff chỉ được cập nhật đơn hàng của rạp mình
     */
    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'CINEMA_STAFF')")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request,
            @RequestParam(required = false) Integer staffId) {
        
        ConcessionOrderStatus newStatus = ConcessionOrderStatus.valueOf(
                request.get("status"));
        
        log.info("Updating order {} status to {} by staffId {}", orderId, newStatus, staffId);
        
        try {
            ConcessionOrderDTO order;
            // Nếu có staffId, validate staff thuộc rạp
            if (staffId != null) {
                order = orderService.updateOrderStatusByStaff(orderId, newStatus, staffId);
            } else {
                order = orderService.updateOrderStatus(orderId, newStatus);
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Xác nhận đơn hàng (Manager/Staff)
     * PUT /api/concessions/orders/123/confirm
     * Staff chỉ được xác nhận đơn hàng của rạp mình
     */
    @PutMapping("/{orderId}/confirm")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'CINEMA_STAFF')")
    public ResponseEntity<?> confirmOrder(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer staffId) {
        log.info("Confirming order: {} by staffId {}", orderId, staffId);
        try {
            ConcessionOrderDTO order;
            if (staffId != null) {
                order = orderService.updateOrderStatusByStaff(orderId, ConcessionOrderStatus.CONFIRMED, staffId);
            } else {
                order = orderService.updateOrderStatus(orderId, ConcessionOrderStatus.CONFIRMED);
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Bắt đầu chuẩn bị đơn hàng (Manager/Staff)
     * PUT /api/concessions/orders/123/prepare
     * Staff chỉ được chuẩn bị đơn hàng của rạp mình
     */
    @PutMapping("/{orderId}/prepare")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'CINEMA_STAFF')")
    public ResponseEntity<?> prepareOrder(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer staffId) {
        log.info("Preparing order: {} by staffId {}", orderId, staffId);
        try {
            ConcessionOrderDTO order;
            if (staffId != null) {
                order = orderService.updateOrderStatusByStaff(orderId, ConcessionOrderStatus.PREPARING, staffId);
            } else {
                order = orderService.updateOrderStatus(orderId, ConcessionOrderStatus.PREPARING);
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Đánh dấu đơn hàng sẵn sàng lấy (Manager/Staff)
     * PUT /api/concessions/orders/123/ready
     * Staff chỉ được cập nhật đơn hàng của rạp mình
     */
    @PutMapping("/{orderId}/ready")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'CINEMA_STAFF')")
    public ResponseEntity<?> markOrderReady(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer staffId) {
        log.info("Marking order ready: {} by staffId {}", orderId, staffId);
        try {
            ConcessionOrderDTO order;
            if (staffId != null) {
                order = orderService.updateOrderStatusByStaff(orderId, ConcessionOrderStatus.READY, staffId);
            } else {
                order = orderService.updateOrderStatus(orderId, ConcessionOrderStatus.READY);
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Hoàn thành đơn hàng (Manager/Staff)
     * PUT /api/concessions/orders/123/complete
     * Staff chỉ được hoàn thành đơn hàng của rạp mình
     */
    @PutMapping("/{orderId}/complete")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'CINEMA_STAFF')")
    public ResponseEntity<?> completeOrder(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer staffId) {
        log.info("Completing order: {} by staffId {}", orderId, staffId);
        try {
            ConcessionOrderDTO order;
            if (staffId != null) {
                order = orderService.updateOrderStatusByStaff(orderId, ConcessionOrderStatus.COMPLETED, staffId);
            } else {
                order = orderService.updateOrderStatus(orderId, ConcessionOrderStatus.COMPLETED);
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Hủy đơn hàng
     * PUT /api/concessions/orders/123/cancel
     */
    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ConcessionOrderDTO> cancelOrder(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request) {
        
        String reason = request.getOrDefault("reason", "Không có lý do");
        log.info("Cancelling order {}: {}", orderId, reason);
        
        ConcessionOrderDTO order = orderService.cancelOrder(orderId, reason);
        return ResponseEntity.ok(order);
    }

    /**
     * Cập nhật ghi chú đơn hàng (Manager/Staff)
     * PUT /api/concessions/orders/123/notes
     * Staff chỉ được cập nhật đơn hàng của rạp mình
     */
    @PutMapping("/{orderId}/notes")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'CHAIN_ADMIN', 'CINEMA_MANAGER', 'CINEMA_STAFF')")
    public ResponseEntity<?> updateOrderNotes(
            @PathVariable Integer orderId,
            @RequestBody Map<String, String> request,
            @RequestParam(required = false) Integer staffId) {
        
        String notes = request.getOrDefault("notes", "");
        log.info("Updating notes for order {} by staffId {}", orderId, staffId);
        
        try {
            ConcessionOrderDTO order;
            if (staffId != null) {
                order = orderService.updateOrderNotesByStaff(orderId, notes, staffId);
            } else {
                order = orderService.updateOrderNotes(orderId, notes);
            }
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}

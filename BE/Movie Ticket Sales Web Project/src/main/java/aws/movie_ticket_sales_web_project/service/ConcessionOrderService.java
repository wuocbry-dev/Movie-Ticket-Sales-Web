package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConcessionOrderService {

    private final ConcessionOrderRepository orderRepository;
    private final ConcessionOrderItemRepository orderItemRepository;
    private final CinemaConcessionItemRepository cinemaConcessionItemRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final CinemaStaffRepository cinemaStaffRepository;

    /**
     * Tạo đơn hàng bắp nước mới
     */
    @Transactional
    public ConcessionOrderDTO createOrder(CreateConcessionOrderRequest request) {
        log.info("Creating concession order for user {} at cinema {}", 
                request.getUserId(), request.getCinemaId());
        
        // Validate
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));
        
        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(() -> new RuntimeException("Rạp không tồn tại"));
        
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new RuntimeException("Đơn hàng phải có ít nhất 1 sản phẩm");
        }
        
        // Tạo order
        ConcessionOrder order = new ConcessionOrder();
        order.setUser(user);
        order.setCinema(cinema);
        order.setOrderNumber("CO" + System.currentTimeMillis());
        order.setStatus(ConcessionOrderStatus.PENDING);
        order.setNotes(request.getNotes());
        order.setCreatedAt(Instant.now());
        order.setUpdatedAt(Instant.now());
        
        // Tính tổng tiền
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (CreateConcessionOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            // Lấy giá từ cinema_concession_items
            CinemaConcessionItem cinemaItem = cinemaConcessionItemRepository
                    .findByCinemaIdAndItemId(request.getCinemaId(), itemReq.getItemId())
                    .orElseThrow(() -> new RuntimeException(
                            "Item không có bán tại rạp này: " + itemReq.getItemId()));
            
            if (!cinemaItem.getIsAvailable()) {
                throw new RuntimeException("Item không còn bán: " + cinemaItem.getItem().getItemName());
            }
            
            BigDecimal unitPrice = cinemaItem.getEffectivePrice();
            BigDecimal itemSubtotal = unitPrice.multiply(new BigDecimal(itemReq.getQuantity()));
            subtotal = subtotal.add(itemSubtotal);
        }
        
        order.setSubtotal(subtotal);
        order.setTaxAmount(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setTotalAmount(subtotal);
        
        // Lưu order
        ConcessionOrder savedOrder = orderRepository.save(order);
        
        // Tạo order items
        for (CreateConcessionOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            CinemaConcessionItem cinemaItem = cinemaConcessionItemRepository
                    .findByCinemaIdAndItemId(request.getCinemaId(), itemReq.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item không tồn tại"));
            
            ConcessionOrderItem orderItem = new ConcessionOrderItem();
            orderItem.setConcessionOrder(savedOrder);
            orderItem.setItem(cinemaItem.getItem());
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(cinemaItem.getEffectivePrice());
            orderItem.setTotalPrice(cinemaItem.getEffectivePrice()
                    .multiply(new BigDecimal(itemReq.getQuantity())));
            orderItem.setCustomizationNotes(itemReq.getNotes());
            orderItem.setCreatedAt(Instant.now());
            
            orderItemRepository.save(orderItem);
        }
        
        log.info("Created order {} with total amount {}", 
                savedOrder.getOrderNumber(), savedOrder.getTotalAmount());
        
        return convertToDTO(savedOrder);
    }

    /**
     * Lấy đơn hàng theo ID
     */
    @Transactional(readOnly = true)
    public ConcessionOrderDTO getOrderById(Integer orderId) {
        ConcessionOrder order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        return convertToDTO(order);
    }

    /**
     * Lấy đơn hàng theo order number
     */
    @Transactional(readOnly = true)
    public ConcessionOrderDTO getOrderByNumber(String orderNumber) {
        ConcessionOrder order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        return convertToDTO(order);
    }

    /**
     * Lấy danh sách orders của user
     */
    @Transactional(readOnly = true)
    public List<ConcessionOrderDTO> getUserOrders(Integer userId) {
        List<ConcessionOrder> orders = orderRepository.findByUserId(userId);
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy concession order theo booking ID
     */
    @Transactional(readOnly = true)
    public ConcessionOrderDTO getOrderByBookingId(Integer bookingId) {
        return orderRepository.findByBookingId(bookingId)
                .map(this::convertToDTO)
                .orElse(null); // Return null if no concession order for this booking
    }

    /**
     * Lấy danh sách orders của rạp
     */
    @Transactional(readOnly = true)
    public List<ConcessionOrderDTO> getCinemaOrders(Integer cinemaId, ConcessionOrderStatus status) {
        List<ConcessionOrder> orders;
        if (status != null) {
            orders = orderRepository.findByCinemaIdAndStatus(cinemaId, status);
        } else {
            orders = orderRepository.findByCinemaId(cinemaId);
        }
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lấy danh sách orders của rạp - dành cho STAFF
     * Staff chỉ xem được đơn có trạng thái từ CONFIRMED trở đi (không xem được PENDING)
     */
    @Transactional(readOnly = true)
    public List<ConcessionOrderDTO> getCinemaOrdersForStaff(Integer cinemaId, ConcessionOrderStatus status) {
        List<ConcessionOrder> orders;
        
        // Staff không được xem đơn PENDING
        if (status == ConcessionOrderStatus.PENDING) {
            throw new RuntimeException("Nhân viên không có quyền xem đơn hàng chờ xác nhận");
        }
        
        if (status != null) {
            orders = orderRepository.findByCinemaIdAndStatus(cinemaId, status);
        } else {
            // Lấy tất cả đơn trừ PENDING
            orders = orderRepository.findByCinemaIdExcludingStatus(cinemaId, ConcessionOrderStatus.PENDING);
        }
        return orders.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Cập nhật trạng thái đơn hàng
     * Yêu cầu: Nếu đơn hàng liên kết với booking, booking phải được thanh toán trước khi xác nhận
     */
    @Transactional
    public ConcessionOrderDTO updateOrderStatus(Integer orderId, ConcessionOrderStatus newStatus) {
        ConcessionOrder order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        // Kiểm tra nếu đơn hàng liên kết với booking, booking phải đã thanh toán
        if (order.getBooking() != null && newStatus != ConcessionOrderStatus.CANCELLED) {
            // Fetch booking mới từ database để có thông tin payment status mới nhất
            Booking booking = bookingRepository.findById(order.getBooking().getId())
                    .orElseThrow(() -> new RuntimeException("Booking không tồn tại"));
            
            log.info("📋 Checking booking {} - PaymentStatus: {}", 
                    booking.getBookingCode(), booking.getPaymentStatus());
            
            // Chấp nhận cả PAID và COMPLETED (PaymentService dùng COMPLETED)
            boolean isPaid = booking.getPaymentStatus() == PaymentStatus.PAID 
                          || booking.getPaymentStatus() == PaymentStatus.COMPLETED;
            
            if (!isPaid) {
                throw new RuntimeException(
                    "Không thể xác nhận đơn hàng bắp nước. Vui lòng thanh toán booking #" 
                    + booking.getBookingCode() + " trước! (Status hiện tại: " + booking.getPaymentStatus() + ")");
            }
            log.info("✅ Booking {} đã thanh toán, cho phép cập nhật trạng thái đơn hàng bắp nước", 
                    booking.getBookingCode());
        }
        
        order.setStatus(newStatus);
        order.setUpdatedAt(Instant.now());
        
        if (newStatus == ConcessionOrderStatus.READY) {
            order.setPickupTime(Instant.now());
        }
        
        ConcessionOrder updated = orderRepository.save(order);
        log.info("Updated order {} status to {}", order.getOrderNumber(), newStatus);
        
        return convertToDTO(updated);
    }

    /**
     * Cập nhật trạng thái đơn hàng - dành cho STAFF (có validate staff thuộc rạp)
     * Staff chỉ được cập nhật đơn hàng của rạp mình
     */
    @Transactional
    public ConcessionOrderDTO updateOrderStatusByStaff(Integer orderId, ConcessionOrderStatus newStatus, Integer staffId) {
        ConcessionOrder order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        // Validate staff/manager thuộc rạp của đơn hàng
        Integer orderCinemaId = order.getCinema().getId();
        
        // Check 1: Staff in cinema_staffs table
        java.util.Optional<Integer> staffCinemaId = cinemaStaffRepository.getCinemaIdByStaffUserId(staffId);
        boolean isStaffOfCinema = staffCinemaId.isPresent() && staffCinemaId.get().equals(orderCinemaId);
        
        // Check 2: Manager of this cinema (manager_id in cinemas table)
        boolean isManagerOfCinema = cinemaRepository.findById(orderCinemaId)
                .map(cinema -> cinema.getManager() != null && cinema.getManager().getId().equals(staffId))
                .orElse(false);
        
        // If user is neither staff nor manager of this cinema, deny access
        if (!isStaffOfCinema && !isManagerOfCinema) {
            if (staffCinemaId.isEmpty() && !isManagerOfCinema) {
                throw new RuntimeException("Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.");
            } else {
                throw new RuntimeException("Bạn không có quyền cập nhật đơn hàng của rạp " + order.getCinema().getCinemaName());
            }
        }
        
        // Staff chỉ được cập nhật từ PREPARING đến CANCELLED
        // Không được phép: PENDING -> CONFIRMED (chỉ manager/admin)
        ConcessionOrderStatus currentStatus = order.getStatus();
        
        // Staff không được xác nhận đơn (PENDING -> CONFIRMED)
        if (currentStatus == ConcessionOrderStatus.PENDING && newStatus == ConcessionOrderStatus.CONFIRMED) {
            throw new RuntimeException("Nhân viên không có quyền xác nhận đơn hàng. Vui lòng liên hệ quản lý.");
        }
        
        // Staff chỉ được thao tác với đơn đã CONFIRMED trở đi
        if (currentStatus == ConcessionOrderStatus.PENDING) {
            throw new RuntimeException("Nhân viên không có quyền thao tác với đơn hàng chờ xác nhận.");
        }
        
        // Validate các trạng thái staff được phép chuyển đổi
        // CONFIRMED -> PREPARING -> READY -> COMPLETED hoặc -> CANCELLED
        boolean isValidTransition = false;
        switch (currentStatus) {
            case CONFIRMED:
                isValidTransition = (newStatus == ConcessionOrderStatus.PREPARING || 
                                    newStatus == ConcessionOrderStatus.CANCELLED);
                break;
            case PREPARING:
                isValidTransition = (newStatus == ConcessionOrderStatus.READY || 
                                    newStatus == ConcessionOrderStatus.CANCELLED);
                break;
            case READY:
                isValidTransition = (newStatus == ConcessionOrderStatus.COMPLETED || 
                                    newStatus == ConcessionOrderStatus.CANCELLED);
                break;
            default:
                isValidTransition = false;
        }
        
        if (!isValidTransition) {
            throw new RuntimeException("Không thể chuyển trạng thái từ " + currentStatus + " sang " + newStatus);
        }
        
        // Reuse logic từ updateOrderStatus
        return updateOrderStatus(orderId, newStatus);
    }

    /**
     * Hủy đơn hàng
     */
    @Transactional
    public ConcessionOrderDTO cancelOrder(Integer orderId, String reason) {
        ConcessionOrder order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        if (order.getStatus() == ConcessionOrderStatus.COMPLETED) {
            throw new RuntimeException("Không thể hủy đơn hàng đã hoàn thành");
        }
        
        // Chỉ thêm note nếu chưa bị hủy trước đó
        if (order.getStatus() != ConcessionOrderStatus.CANCELLED) {
            order.setStatus(ConcessionOrderStatus.CANCELLED);
            
            // Tránh duplicate note
            String currentNotes = order.getNotes() != null ? order.getNotes() : "";
            String cancelNote = "Lý do hủy: " + reason;
            if (!currentNotes.contains(cancelNote)) {
                order.setNotes(currentNotes.isEmpty() ? cancelNote : currentNotes + "\n" + cancelNote);
            }
            
            order.setUpdatedAt(Instant.now());
            order = orderRepository.save(order);
            log.info("Cancelled order {}: {}", order.getOrderNumber(), reason);
        }
        
        return convertToDTO(order);
    }

    /**
     * Cập nhật ghi chú đơn hàng
     */
    @Transactional
    public ConcessionOrderDTO updateOrderNotes(Integer orderId, String notes) {
        ConcessionOrder order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        order.setNotes(notes);
        order.setUpdatedAt(Instant.now());
        
        ConcessionOrder updated = orderRepository.save(order);
        log.info("Updated notes for order {}", order.getOrderNumber());
        
        return convertToDTO(updated);
    }

    /**
     * Cập nhật ghi chú đơn hàng - dành cho STAFF (có validate staff thuộc rạp)
     */
    @Transactional
    public ConcessionOrderDTO updateOrderNotesByStaff(Integer orderId, String notes, Integer staffId) {
        ConcessionOrder order = orderRepository.findByIdWithUser(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));
        
        // Validate staff/manager thuộc rạp của đơn hàng
        Integer orderCinemaId = order.getCinema().getId();
        
        // Check 1: Staff in cinema_staffs table
        java.util.Optional<Integer> staffCinemaId = cinemaStaffRepository.getCinemaIdByStaffUserId(staffId);
        boolean isStaffOfCinema = staffCinemaId.isPresent() && staffCinemaId.get().equals(orderCinemaId);
        
        // Check 2: Manager of this cinema (manager_id in cinemas table)
        boolean isManagerOfCinema = cinemaRepository.findById(orderCinemaId)
                .map(cinema -> cinema.getManager() != null && cinema.getManager().getId().equals(staffId))
                .orElse(false);
        
        // If user is neither staff nor manager of this cinema, deny access
        if (!isStaffOfCinema && !isManagerOfCinema) {
            if (staffCinemaId.isEmpty() && !isManagerOfCinema) {
                throw new RuntimeException("Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.");
            } else {
                throw new RuntimeException("Bạn không có quyền chỉnh sửa đơn hàng của rạp " + order.getCinema().getCinemaName());
            }
        }
        
        order.setNotes(notes);
        order.setUpdatedAt(Instant.now());
        
        ConcessionOrder updated = orderRepository.save(order);
        log.info("Staff {} updated notes for order {}", staffId, order.getOrderNumber());
        
        return convertToDTO(updated);
    }

    /**
     * Convert entity to DTO
     */
    private ConcessionOrderDTO convertToDTO(ConcessionOrder order) {
        List<ConcessionOrderItem> orderItems = orderItemRepository.findByOrderId(order.getId());
        
        List<ConcessionOrderItemDTO> itemDTOs = orderItems.stream()
                .map(item -> ConcessionOrderItemDTO.builder()
                        .orderItemId(item.getId())
                        .itemId(item.getItem().getId())
                        .itemName(item.getItem().getItemName())
                        .imageUrl(item.getItem().getImageUrl())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .subtotal(item.getTotalPrice())
                        .notes(item.getCustomizationNotes())
                        .build())
                .collect(Collectors.toList());
        
        return ConcessionOrderDTO.builder()
                .orderId(order.getId())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .userName(order.getUser() != null ? order.getUser().getFullName() : null)
                .userEmail(order.getUser() != null ? order.getUser().getEmail() : null)
                .cinemaId(order.getCinema().getId())
                .cinemaName(order.getCinema().getCinemaName())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .pickupTime(order.getPickupTime())
                .notes(order.getNotes())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .items(itemDTOs)
                .build();
    }
}

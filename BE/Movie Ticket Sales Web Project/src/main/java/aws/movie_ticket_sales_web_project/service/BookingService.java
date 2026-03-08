package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final SeatHoldService seatHoldService;
    private final ConcessionOrderRepository concessionOrderRepository;
    private final ConcessionOrderItemRepository concessionOrderItemRepository;
    private final CinemaConcessionItemRepository cinemaConcessionItemRepository;
    private final LoyaltyPointsService loyaltyPointsService;
    private final MembershipRepository membershipRepository;
    
    private static final BigDecimal TAX_RATE = new BigDecimal("0.10"); // 10% tax
    private static final BigDecimal SERVICE_FEE = new BigDecimal("5000"); // 5000 VND service fee per ticket
    private static final BigDecimal POINTS_TO_VND_RATE = new BigDecimal("1000"); // 1 point = 1000 VND
    
    /**
     * Get all bookings with pagination (excluding CANCELLED)
     */
    public PagedBookingResponse getAllBookings(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByStatusNot(StatusBooking.CANCELLED, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Get booking by ID
     */
    public BookingDto getBookingById(Integer bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + bookingId));
        
        return convertToDto(booking, true);
    }
    
    /**
     * Get booking by booking code
     */
    public BookingDto getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Booking not found with code: " + bookingCode));
        
        return convertToDto(booking, true);
    }
    
    /**
     * Get bookings by user ID
     */
    public PagedBookingResponse getBookingsByUserId(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByUserId(userId, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Get bookings by status
     */
    public PagedBookingResponse getBookingsByStatus(StatusBooking status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByStatus(status, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Get bookings by showtime ID
     */
    public PagedBookingResponse getBookingsByShowtimeId(Integer showtimeId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("bookingDate").descending());
        Page<Booking> bookingPage = bookingRepository.findByShowtimeId(showtimeId, pageable);
        
        return buildPagedResponse(bookingPage);
    }
    
    /**
     * Create a new booking
     */
    @Transactional
    public BookingDto createBooking(CreateBookingRequest request) {
        try {
            // Validate showtime exists
            Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                    .orElseThrow(() -> new RuntimeException("Showtime not found"));
            
            // Verify seats are held by this session (Redis check)
            boolean seatsHeld = seatHoldService.areSeatsHeldBySession(request.getShowtimeId(), request.getSeatIds(), request.getSessionId());
            
            if (!seatsHeld) {
                log.warn("Booking failed - seats not held: showtimeId={}, seatIds={}, sessionId={}", 
                        request.getShowtimeId(), request.getSeatIds(), request.getSessionId());
                throw new RuntimeException("Seats are not held by your session. Please select seats again.");
            }
            
            // Extend hold by 2 more minutes to ensure booking completes
            try {
                seatHoldService.extendHold(request.getSessionId(), request.getShowtimeId(), request.getSeatIds(), 2);
                log.info("Extended seat hold during booking creation");
            } catch (Exception e) {
                log.warn("Failed to extend hold, but continuing with booking", e);
            }
            
            // Validate seats
            List<Seat> seats = new ArrayList<>();
            for (Integer seatId : request.getSeatIds()) {
                Seat seat = seatRepository.findById(seatId)
                        .orElseThrow(() -> new RuntimeException("Seat not found with ID: " + seatId));
                
                // Double-check if seat is already booked in database (active tickets only)
                if (ticketRepository.findActiveBySeatIdAndShowtimeId(seatId, request.getShowtimeId()).isPresent()) {
                    throw new RuntimeException("Seat " + seat.getSeatRow() + seat.getSeatNumber() + " is already booked");
                }
                
                seats.add(seat);
            }
            
            // Get user if provided and auto-fill customer info
            User user = null;
            String customerName = request.getCustomerName();
            String customerEmail = request.getCustomerEmail();
            String customerPhone = request.getCustomerPhone();
            
            if (request.getUserId() != null) {
                user = userRepository.findById(request.getUserId())
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + request.getUserId()));
                
                // Auto-fill customer info from user if not provided
                if (customerName == null || customerName.isBlank()) {
                    customerName = user.getFullName();
                }
                if (customerEmail == null || customerEmail.isBlank()) {
                    customerEmail = user.getEmail();
                }
                if (customerPhone == null || customerPhone.isBlank()) {
                    customerPhone = user.getPhoneNumber();
                }
            } else {
                // Guest booking - validate customer info is provided
                if (customerName == null || customerName.isBlank()) {
                    throw new RuntimeException("Customer name is required for guest bookings");
                }
                if (customerEmail == null || customerEmail.isBlank()) {
                    throw new RuntimeException("Customer email is required for guest bookings");
                }
                if (customerPhone == null || customerPhone.isBlank()) {
                    throw new RuntimeException("Customer phone is required for guest bookings");
                }
            }
            
            // Calculate ticket amounts
            BigDecimal subtotal = showtime.getBasePrice().multiply(new BigDecimal(seats.size()));
            BigDecimal serviceFeeTotal = SERVICE_FEE.multiply(new BigDecimal(seats.size()));
            BigDecimal taxAmount = subtotal.multiply(TAX_RATE);
            BigDecimal ticketTotal = subtotal.add(serviceFeeTotal).add(taxAmount);
            
            // Calculate concession total FIRST (to include in points discount calculation)
            BigDecimal concessionTotal = BigDecimal.ZERO;
            if (request.getConcessionItems() != null && !request.getConcessionItems().isEmpty()) {
                for (CreateBookingRequest.ConcessionItemRequest itemReq : request.getConcessionItems()) {
                    BigDecimal itemTotal = itemReq.getPrice().multiply(new BigDecimal(itemReq.getQuantity()));
                    concessionTotal = concessionTotal.add(itemTotal);
                }
                // Concession does NOT have additional tax (price already includes everything)
                log.info("📦 Concession subtotal (pre-calculation): {}", concessionTotal);
            }
            
            // Total before discount = ticket total + concession total
            BigDecimal totalBeforeDiscount = ticketTotal.add(concessionTotal);
            log.info("💵 Total before discount: {} (tickets: {} + concession: {})", totalBeforeDiscount, ticketTotal, concessionTotal);
            
            // Apply points discount if requested
            BigDecimal discountAmount = BigDecimal.ZERO;
            Integer pointsUsed = 0;
            
            if (request.getPointsToUse() != null && request.getPointsToUse() > 0 && user != null) {
                // Validate user has enough points
                Membership membership = membershipRepository.findByUserId(user.getId()).orElse(null);
                if (membership != null) {
                    Integer availablePoints = membership.getAvailablePoints() != null ? membership.getAvailablePoints() : 0;
                    
                    // Calculate max discount from requested points
                    BigDecimal maxDiscountFromPoints = new BigDecimal(request.getPointsToUse()).multiply(POINTS_TO_VND_RATE);
                    
                    // Limit discount to 50% of TOTAL amount (tickets + concession)
                    BigDecimal maxAllowedDiscount = totalBeforeDiscount.multiply(new BigDecimal("0.5"));
                    
                    if (maxDiscountFromPoints.compareTo(maxAllowedDiscount) > 0) {
                        maxDiscountFromPoints = maxAllowedDiscount;
                    }
                    
                    // Calculate actual points needed
                    pointsUsed = maxDiscountFromPoints.divide(POINTS_TO_VND_RATE, 0, java.math.RoundingMode.DOWN).intValue();
                    
                    if (pointsUsed > availablePoints) {
                        pointsUsed = availablePoints;
                    }
                    
                    if (pointsUsed > 0) {
                        discountAmount = new BigDecimal(pointsUsed).multiply(POINTS_TO_VND_RATE);
                        log.info("💰 Applying {} points = {} VND discount for user {} (max allowed: {})", 
                                pointsUsed, discountAmount, user.getId(), maxAllowedDiscount);
                    } else {
                        log.warn("User {} has insufficient points. Available: {}, Requested: {}", 
                                user.getId(), availablePoints, request.getPointsToUse());
                    }
                }
            }
            
            // Final total = total before discount - discount amount
            BigDecimal totalAmount = totalBeforeDiscount.subtract(discountAmount);
            log.info("💳 Final total amount: {} (before discount: {} - discount: {})", totalAmount, totalBeforeDiscount, discountAmount);
            
            // Create booking
            Booking booking = new Booking();
            booking.setBookingCode(generateBookingCode());
            booking.setUser(user);
            booking.setShowtime(showtime);
            booking.setCustomerName(customerName);
            booking.setCustomerEmail(customerEmail);
            booking.setCustomerPhone(customerPhone);
            booking.setBookingDate(Instant.now());
            booking.setTotalSeats(seats.size());
            booking.setSubtotal(subtotal);
            booking.setDiscountAmount(discountAmount);
            booking.setTaxAmount(taxAmount);
            booking.setServiceFee(serviceFeeTotal);
            booking.setTotalAmount(totalAmount);
            booking.setPointsUsed(pointsUsed);
            booking.setStatus(StatusBooking.PENDING);
            booking.setPaymentStatus(PaymentStatus.PENDING);
            booking.setPaymentMethod(request.getPaymentMethod());
            booking.setHoldExpiresAt(Instant.now().plusSeconds(300)); // 15 minutes hold
            booking.setCreatedAt(Instant.now());
            booking.setUpdatedAt(Instant.now());
            
            Booking savedBooking = bookingRepository.save(booking);
            
            // Create tickets for each seat
            List<Ticket> tickets = new ArrayList<>();
            for (Seat seat : seats) {
                Ticket ticket = new Ticket();
                ticket.setBooking(savedBooking);
                ticket.setSeat(seat);
                ticket.setTicketCode(generateTicketCode());
                ticket.setBasePrice(showtime.getBasePrice());
                ticket.setSurchargeAmount(BigDecimal.ZERO);
                ticket.setDiscountAmount(BigDecimal.ZERO);
                ticket.setFinalPrice(showtime.getBasePrice().add(SERVICE_FEE).add(showtime.getBasePrice().multiply(TAX_RATE)));
                ticket.setStatus(TicketStatus.BOOKED);
                
                tickets.add(ticket);
            }
            
            ticketRepository.saveAll(tickets);
            
            // Create concession order if items are provided
            if (request.getConcessionItems() != null && !request.getConcessionItems().isEmpty()) {
                log.info("Creating concession order with {} items", request.getConcessionItems().size());
                
                ConcessionOrder concessionOrder = new ConcessionOrder();
                concessionOrder.setBooking(savedBooking);
                concessionOrder.setUser(user);
                concessionOrder.setCinema(showtime.getHall().getCinema());
                concessionOrder.setCreatedAt(Instant.now());
                concessionOrder.setStatus(ConcessionOrderStatus.PENDING);
                
                // Initialize amount fields to avoid null constraint violations
                concessionOrder.setSubtotal(BigDecimal.ZERO);
                concessionOrder.setTaxAmount(BigDecimal.ZERO);
                concessionOrder.setTotalAmount(BigDecimal.ZERO);
                concessionOrder.setDiscountAmount(BigDecimal.ZERO);
                
                // Generate order number: CON + timestamp + random 4 digits
                String orderNumber = "CON" + System.currentTimeMillis() + String.format("%04d", (int)(Math.random() * 10000));
                concessionOrder.setOrderNumber(orderNumber);
                
                BigDecimal concessionSubtotal = BigDecimal.ZERO;
                
                ConcessionOrder savedOrder = concessionOrderRepository.save(concessionOrder);
                
                // Create order items
                for (CreateBookingRequest.ConcessionItemRequest itemReq : request.getConcessionItems()) {
                    CinemaConcessionItem cinemaConcessionItem = cinemaConcessionItemRepository
                            .findByCinemaIdAndItemId(showtime.getHall().getCinema().getId(), itemReq.getItemId())
                            .orElseThrow(() -> new RuntimeException("Concession item not found at this cinema: " + itemReq.getItemId()));
                    
                    // Check stock availability
                    if (cinemaConcessionItem.getStockQuantity() < itemReq.getQuantity()) {
                        throw new RuntimeException("Insufficient stock for item: " + cinemaConcessionItem.getItem().getItemName());
                    }
                    
                    ConcessionOrderItem orderItem = new ConcessionOrderItem();
                    orderItem.setConcessionOrder(savedOrder);
                    orderItem.setItem(cinemaConcessionItem.getItem());
                    orderItem.setQuantity(itemReq.getQuantity());
                    orderItem.setUnitPrice(itemReq.getPrice());
                    orderItem.setTotalPrice(itemReq.getPrice().multiply(new BigDecimal(itemReq.getQuantity())));
                    
                    concessionOrderItemRepository.save(orderItem);
                    
                    // Update stock
                    cinemaConcessionItem.setStockQuantity(cinemaConcessionItem.getStockQuantity() - itemReq.getQuantity());
                    cinemaConcessionItemRepository.save(cinemaConcessionItem);
                    
                    concessionSubtotal = concessionSubtotal.add(orderItem.getTotalPrice());
                }
                
                // Update order totals (no additional tax - price already includes everything)
                savedOrder.setSubtotal(concessionSubtotal);
                savedOrder.setTaxAmount(BigDecimal.ZERO);
                savedOrder.setTotalAmount(concessionSubtotal);
                savedOrder.setUpdatedAt(Instant.now());
                concessionOrderRepository.save(savedOrder);
                
                // NOTE: Do NOT update booking total here - concession is already included in totalAmount calculation above
                log.info("Concession order created with total: {} (already included in booking total)", concessionSubtotal);
            }
            
            // Deduct points from user's membership if points were used
            if (pointsUsed > 0 && user != null) {
                boolean pointsDeducted = loyaltyPointsService.redeemPoints(
                        user.getId(), 
                        pointsUsed, 
                        "Sử dụng điểm giảm giá booking " + savedBooking.getBookingCode()
                );
                if (pointsDeducted) {
                    log.info("✅ Successfully deducted {} points from user {} for booking {}", 
                            pointsUsed, user.getId(), savedBooking.getBookingCode());
                } else {
                    log.warn("⚠️ Failed to deduct points for booking {}. Points will not be applied.", 
                            savedBooking.getBookingCode());
                    // Rollback discount if points deduction failed
                    savedBooking.setDiscountAmount(BigDecimal.ZERO);
                    savedBooking.setPointsUsed(0);
                    savedBooking.setTotalAmount(totalBeforeDiscount);
                    bookingRepository.save(savedBooking);
                }
            }
            
            // Update available seats in showtime
            int newAvailableSeats = showtime.getAvailableSeats() - seats.size();
            showtime.setAvailableSeats(newAvailableSeats);
            showtimeRepository.save(showtime);
            
            // Remove seat hold from Redis (booking confirmed)
            seatHoldService.confirmBooking(request.getShowtimeId(), request.getSeatIds());
            
            log.info("Booking created successfully: {}", savedBooking.getBookingCode());
            return convertToDto(savedBooking, true);
            
        } catch (Exception e) {
            log.error("Error creating booking", e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage());
        }
    }
    
    /**
     * Update booking
     */
    @Transactional
    public BookingDto updateBooking(Integer bookingId, UpdateBookingRequest request) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Update fields if provided
            if (request.getStatus() != null) {
                booking.setStatus(request.getStatus());
                
                // If status is CANCELLED, update seat availability and refund points
                if (request.getStatus() == StatusBooking.CANCELLED) {
                    List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
                    Showtime showtime = booking.getShowtime();
                    showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
                    showtimeRepository.save(showtime);
                    
                    // Update ticket status
                    tickets.forEach(ticket -> ticket.setStatus(TicketStatus.CANCELLED));
                    ticketRepository.saveAll(tickets);
                    
                    // Refund points if any were used
                    if (booking.getPointsUsed() != null && booking.getPointsUsed() > 0 && booking.getUser() != null) {
                        boolean pointsRefunded = loyaltyPointsService.refundPoints(
                                booking.getUser().getId(),
                                booking.getPointsUsed(),
                                "Hoàn điểm do huỷ booking " + booking.getBookingCode()
                        );
                        if (pointsRefunded) {
                            log.info("✅ Refunded {} points for cancelled booking {}", 
                                    booking.getPointsUsed(), booking.getBookingCode());
                        } else {
                            log.warn("⚠️ Failed to refund points for booking {}", booking.getBookingCode());
                        }
                    }
                }
                
                // If status is PAID, update payment info
                if (request.getStatus() == StatusBooking.PAID) {
                    booking.setPaidAt(Instant.now());
                    booking.setPaymentStatus(PaymentStatus.COMPLETED);
                }
            }
            
            if (request.getPaymentStatus() != null) {
                booking.setPaymentStatus(request.getPaymentStatus());
            }
            
            if (request.getPaymentReference() != null) {
                booking.setPaymentReference(request.getPaymentReference());
            }
            
            if (request.getCustomerName() != null) {
                booking.setCustomerName(request.getCustomerName());
            }
            
            if (request.getCustomerEmail() != null) {
                booking.setCustomerEmail(request.getCustomerEmail());
            }
            
            if (request.getCustomerPhone() != null) {
                booking.setCustomerPhone(request.getCustomerPhone());
            }
            
            booking.setUpdatedAt(Instant.now());
            
            Booking updatedBooking = bookingRepository.save(booking);
            log.info("Booking updated successfully: {}", bookingId);
            
            return convertToDto(updatedBooking, true);
            
        } catch (Exception e) {
            log.error("Error updating booking", e);
            throw new RuntimeException("Failed to update booking: " + e.getMessage());
        }
    }
    
    /**
     * Cancel booking
     */
    @Transactional
    public void cancelBooking(Integer bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            if (booking.getStatus() == StatusBooking.CANCELLED) {
                throw new RuntimeException("Booking is already cancelled");
            }
            
            if (booking.getStatus() == StatusBooking.PAID) {
                throw new RuntimeException("Cannot cancel a paid booking. Please request a refund.");
            }
            
            // Refund points if any were used
            if (booking.getPointsUsed() != null && booking.getPointsUsed() > 0 && booking.getUser() != null) {
                boolean pointsRefunded = loyaltyPointsService.refundPoints(
                        booking.getUser().getId(),
                        booking.getPointsUsed(),
                        "Hoàn điểm do huỷ booking " + booking.getBookingCode()
                );
                if (pointsRefunded) {
                    log.info("✅ Refunded {} points for cancelled booking {}", 
                            booking.getPointsUsed(), booking.getBookingCode());
                } else {
                    log.warn("⚠️ Failed to refund points for booking {}", booking.getBookingCode());
                }
            }
            
            // Update booking status
            booking.setStatus(StatusBooking.CANCELLED);
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);
            
            // Release seats
            List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
            Showtime showtime = booking.getShowtime();
            showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
            showtimeRepository.save(showtime);
            
            // Update ticket status
            tickets.forEach(ticket -> ticket.setStatus(TicketStatus.CANCELLED));
            ticketRepository.saveAll(tickets);
            
            log.info("Booking cancelled successfully: {}", bookingId);
            
        } catch (Exception e) {
            log.error("Error cancelling booking", e);
            throw new RuntimeException("Failed to cancel booking: " + e.getMessage());
        }
    }
    
    /**
     * Delete booking (admin only)
     */
    @Transactional
    public void deleteBooking(Integer bookingId) {
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            
            // Delete associated tickets first
            List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
            ticketRepository.deleteAll(tickets);
            
            // Restore seat availability
            Showtime showtime = booking.getShowtime();
            showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
            showtimeRepository.save(showtime);
            
            // Delete booking
            bookingRepository.delete(booking);
            
            log.info("Booking deleted successfully: {}", bookingId);
            
        } catch (Exception e) {
            log.error("Error deleting booking", e);
            throw new RuntimeException("Failed to delete booking: " + e.getMessage());
        }
    }
    
    /**
     * Convert Booking entity to DTO
     */
    private BookingDto convertToDto(Booking booking, boolean includeTickets) {
        BookingDto dto = BookingDto.builder()
                .bookingId(booking.getId())
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .username(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .customerName(booking.getCustomerName())
                .customerEmail(booking.getCustomerEmail())
                .customerPhone(booking.getCustomerPhone())
                .showtimeId(booking.getShowtime().getId())
                .movieTitle(booking.getShowtime().getMovie().getTitle())
                .cinemaId(booking.getShowtime().getHall().getCinema().getId())
                .cinemaName(booking.getShowtime().getHall().getCinema().getCinemaName())
                .hallName(booking.getShowtime().getHall().getHallName())
                .showDate(booking.getShowtime().getShowDate().toString())
                .startTime(booking.getShowtime().getStartTime().toString())
                .formatType(booking.getShowtime().getFormatType().getValue())
                .bookingDate(booking.getBookingDate())
                .totalSeats(booking.getTotalSeats())
                .subtotal(booking.getSubtotal())
                .discountAmount(booking.getDiscountAmount())
                .taxAmount(booking.getTaxAmount())
                .serviceFee(booking.getServiceFee())
                .totalAmount(booking.getTotalAmount())
                .pointsUsed(booking.getPointsUsed() != null ? booking.getPointsUsed() : 0)
                .pointsDiscount(booking.getPointsUsed() != null && booking.getPointsUsed() > 0 
                        ? POINTS_TO_VND_RATE.multiply(new BigDecimal(booking.getPointsUsed())) 
                        : BigDecimal.ZERO)
                .status(booking.getStatus())
                .paymentStatus(booking.getPaymentStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentReference(booking.getPaymentReference())
                .paidAt(booking.getPaidAt())
                .holdExpiresAt(booking.getHoldExpiresAt())
                .qrCode(booking.getQrCode())
                .invoiceNumber(booking.getInvoiceNumber())
                .invoiceIssuedAt(booking.getInvoiceIssuedAt())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
        
        if (includeTickets) {
            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            dto.setTickets(tickets.stream().map(this::convertTicketToDto).collect(Collectors.toList()));
        }
        
        // Include concession order if exists
        concessionOrderRepository.findByBookingId(booking.getId()).ifPresent(concessionOrder -> {
            List<ConcessionOrderItem> orderItems = concessionOrderItemRepository.findByOrderId(concessionOrder.getId());
            
            List<BookingDto.ConcessionItemSummary> itemSummaries = orderItems.stream()
                    .map(item -> BookingDto.ConcessionItemSummary.builder()
                            .itemId(item.getItem().getId())
                            .itemName(item.getItem().getItemName())
                            .quantity(item.getQuantity())
                            .unitPrice(item.getUnitPrice())
                            .totalPrice(item.getTotalPrice())
                            .build())
                    .collect(Collectors.toList());
            
            BookingDto.ConcessionOrderSummary orderSummary = BookingDto.ConcessionOrderSummary.builder()
                    .orderId(concessionOrder.getId())
                    .totalAmount(concessionOrder.getTotalAmount())
                    .status(concessionOrder.getStatus().name())
                    .items(itemSummaries)
                    .build();
            
            dto.setConcessionOrder(orderSummary);
        });
        
        return dto;
    }
    
    /**
     * Convert Ticket entity to DTO
     */
    private TicketDto convertTicketToDto(Ticket ticket) {
        return TicketDto.builder()
                .ticketId(ticket.getId())
                .ticketCode(ticket.getTicketCode())
                .seatId(ticket.getSeat().getId())
                .seatNumber(String.valueOf(ticket.getSeat().getSeatNumber()))
                .seatRow(ticket.getSeat().getSeatRow())
                .seatType(ticket.getSeat().getSeatType().name())
                .basePrice(ticket.getBasePrice())
                .surchargeAmount(ticket.getSurchargeAmount())
                .discountAmount(ticket.getDiscountAmount())
                .finalPrice(ticket.getFinalPrice())
                .status(ticket.getStatus())
                .checkedInAt(ticket.getCheckedInAt())
                .checkedInByUsername(ticket.getCheckedInBy() != null ? ticket.getCheckedInBy().getEmail() : null)
                .build();
    }
    
    /**
     * Build paged response
     */
    private PagedBookingResponse buildPagedResponse(Page<Booking> bookingPage) {
        List<BookingDto> bookingDtos = bookingPage.getContent().stream()
                .map(booking -> convertToDto(booking, true)) // Changed to true to include tickets
                .collect(Collectors.toList());
        
        return PagedBookingResponse.builder()
                .totalElements(bookingPage.getTotalElements())
                .totalPages(bookingPage.getTotalPages())
                .currentPage(bookingPage.getNumber())
                .pageSize(bookingPage.getSize())
                .hasNext(bookingPage.hasNext())
                .hasPrevious(bookingPage.hasPrevious())
                .data(bookingDtos)
                .build();
    }
    
    /**
     * Generate unique booking code
     */
    private String generateBookingCode() {
        String code;
        do {
            code = "BK" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")) + 
                    String.format("%04d", (int)(Math.random() * 10000));
        } while (bookingRepository.existsByBookingCode(code));
        
        return code;
    }
    
    /**
     * Generate unique ticket code
     */
    private String generateTicketCode() {
        String code;
        do {
            code = "TK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (ticketRepository.existsByTicketCode(code));
        
        return code;
    }
}

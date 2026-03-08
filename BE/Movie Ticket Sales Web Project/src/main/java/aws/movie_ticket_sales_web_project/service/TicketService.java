package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.Ticket;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.BookingRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaRepository;
import aws.movie_ticket_sales_web_project.repository.CinemaStaffRepository;
import aws.movie_ticket_sales_web_project.repository.TicketRepository;
import aws.movie_ticket_sales_web_project.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CinemaStaffRepository cinemaStaffRepository;
    private final CinemaRepository cinemaRepository;

    /**
     * Get booking details for check-in (staff use)
     * Staff có thể xem tất cả booking details nhưng chỉ check-in được của rạp mình
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getBookingDetailsForCheckIn(String bookingCode) {
        log.info("Fetching booking details for code: {}", bookingCode);
        
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với mã: " + bookingCode));

        // Get all tickets for this booking
        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("bookingId", booking.getId());
        result.put("bookingCode", booking.getBookingCode());
        result.put("customerName", booking.getCustomerName());
        result.put("customerEmail", booking.getCustomerEmail());
        result.put("customerPhone", booking.getCustomerPhone());
        result.put("totalAmount", booking.getTotalAmount());
        result.put("status", booking.getStatus().name());
        result.put("paymentStatus", booking.getPaymentStatus().name());
        result.put("paymentMethod", booking.getPaymentMethod());
        result.put("totalSeats", booking.getTotalSeats());
        result.put("bookingDate", booking.getBookingDate());
        
        // Movie and showtime info
        if (booking.getShowtime() != null) {
            Map<String, Object> showtimeInfo = new HashMap<>();
            showtimeInfo.put("showtimeId", booking.getShowtime().getId());
            showtimeInfo.put("showDate", booking.getShowtime().getShowDate());
            showtimeInfo.put("startTime", booking.getShowtime().getStartTime());
            showtimeInfo.put("endTime", booking.getShowtime().getEndTime());
            
            if (booking.getShowtime().getMovie() != null) {
                Map<String, Object> movieInfo = new HashMap<>();
                movieInfo.put("movieId", booking.getShowtime().getMovie().getId());
                movieInfo.put("title", booking.getShowtime().getMovie().getTitle());
                movieInfo.put("durationMinutes", booking.getShowtime().getMovie().getDurationMinutes());
                movieInfo.put("posterUrl", booking.getShowtime().getMovie().getPosterUrl());
                showtimeInfo.put("movie", movieInfo);
            }
            
            if (booking.getShowtime().getHall() != null) {
                Map<String, Object> hallInfo = new HashMap<>();
                hallInfo.put("hallId", booking.getShowtime().getHall().getId());
                hallInfo.put("hallName", booking.getShowtime().getHall().getHallName());
                
                if (booking.getShowtime().getHall().getCinema() != null) {
                    Map<String, Object> cinemaInfo = new HashMap<>();
                    cinemaInfo.put("cinemaId", booking.getShowtime().getHall().getCinema().getId());
                    cinemaInfo.put("cinemaName", booking.getShowtime().getHall().getCinema().getCinemaName());
                    cinemaInfo.put("address", booking.getShowtime().getHall().getCinema().getAddress());
                    hallInfo.put("cinema", cinemaInfo);
                }
                
                showtimeInfo.put("hall", hallInfo);
            }
            
            result.put("showtime", showtimeInfo);
        }
        
        // Tickets info
        List<Map<String, Object>> ticketsList = tickets.stream().map(ticket -> {
            Map<String, Object> ticketInfo = new HashMap<>();
            ticketInfo.put("ticketId", ticket.getId());
            ticketInfo.put("ticketCode", ticket.getTicketCode());
            ticketInfo.put("status", ticket.getStatus().name());
            ticketInfo.put("finalPrice", ticket.getFinalPrice());
            ticketInfo.put("checkedInAt", ticket.getCheckedInAt());
            
            if (ticket.getSeat() != null) {
                Map<String, Object> seatInfo = new HashMap<>();
                seatInfo.put("seatId", ticket.getSeat().getId());
                seatInfo.put("seatRow", ticket.getSeat().getSeatRow());
                seatInfo.put("seatNumber", ticket.getSeat().getSeatNumber());
                seatInfo.put("seatType", ticket.getSeat().getSeatType().name());
                ticketInfo.put("seat", seatInfo);
            }
            
            return ticketInfo;
        }).collect(Collectors.toList());
        
        result.put("tickets", ticketsList);
        
        log.info("Successfully fetched booking details for: {}", bookingCode);
        return result;
    }

    /**
     * Check-in by booking code (staff use)
     * Staff chỉ được check-in vé của rạp mình
     */
    @Transactional
    public Map<String, Object> checkInByBookingCode(String bookingCode, Integer staffId) {
        log.info("Processing check-in for booking: {} by staff: {}", bookingCode, staffId);
        
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với mã: " + bookingCode));

        // Validate staff/manager belongs to booking's cinema
        Cinema bookingCinema = booking.getShowtime().getHall().getCinema();
        Integer bookingCinemaId = bookingCinema.getId();
        
        // Check 1: Staff in cinema_staffs table
        Optional<Integer> staffCinemaId = cinemaStaffRepository.getCinemaIdByStaffUserId(staffId);
        boolean isStaffOfCinema = staffCinemaId.isPresent() && staffCinemaId.get().equals(bookingCinemaId);
        
        // Check 2: Manager of this cinema (manager_id in cinemas table)
        boolean isManagerOfCinema = cinemaRepository.findById(bookingCinemaId)
                .map(cinema -> cinema.getManager() != null && cinema.getManager().getId().equals(staffId))
                .orElse(false);
        
        // If user is neither staff nor manager of this cinema, deny access
        if (!isStaffOfCinema && !isManagerOfCinema) {
            if (staffCinemaId.isEmpty() && !isManagerOfCinema) {
                throw new RuntimeException("Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.");
            } else {
                throw new RuntimeException("Bạn không có quyền check-in vé của rạp " + bookingCinema.getCinemaName());
            }
        }

        // Verify booking is paid
        if (!"COMPLETED".equals(booking.getPaymentStatus().name())) {
            throw new RuntimeException("Booking chưa được thanh toán. Vui lòng thanh toán trước khi check-in.");
        }

        // Get staff user
        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với ID: " + staffId));

        // Get all tickets
        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        
        if (tickets.isEmpty()) {
            throw new RuntimeException("Không tìm thấy vé nào cho booking này");
        }

        // Check-in all tickets
        int checkedInCount = 0;
        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == TicketStatus.PAID) {
                ticket.setStatus(TicketStatus.USED);
                ticket.setCheckedInAt(Instant.now());
                ticket.setCheckedInBy(staff);
                ticketRepository.save(ticket);
                checkedInCount++;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Check-in thành công " + checkedInCount + " vé");
        result.put("bookingCode", bookingCode);
        result.put("checkedInCount", checkedInCount);
        result.put("totalTickets", tickets.size());
        result.put("staffName", staff.getFullName());
        result.put("checkedInAt", Instant.now());
        
        log.info("Check-in successful for booking: {}, checked in {} tickets", bookingCode, checkedInCount);
        return result;
    }
    
    /**
     * Process staff cash payment for booking
     * Staff collects cash and marks booking as paid
     * Staff chỉ được thanh toán booking của rạp mình
     */
    @Transactional
    public Map<String, Object> processStaffCashPayment(String bookingCode, Integer staffId) {
        log.info("Processing cash payment for booking: {} by staff: {}", bookingCode, staffId);
        
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy booking với mã: " + bookingCode));

        // Validate staff/manager belongs to booking's cinema
        Cinema bookingCinema = booking.getShowtime().getHall().getCinema();
        Integer bookingCinemaId = bookingCinema.getId();
        
        // Check 1: Staff in cinema_staffs table
        Optional<Integer> staffCinemaId = cinemaStaffRepository.getCinemaIdByStaffUserId(staffId);
        boolean isStaffOfCinema = staffCinemaId.isPresent() && staffCinemaId.get().equals(bookingCinemaId);
        
        // Check 2: Manager of this cinema (manager_id in cinemas table)
        boolean isManagerOfCinema = cinemaRepository.findById(bookingCinemaId)
                .map(cinema -> cinema.getManager() != null && cinema.getManager().getId().equals(staffId))
                .orElse(false);
        
        // If user is neither staff nor manager of this cinema, deny access
        if (!isStaffOfCinema && !isManagerOfCinema) {
            if (staffCinemaId.isEmpty() && !isManagerOfCinema) {
                throw new RuntimeException("Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.");
            } else {
                throw new RuntimeException("Bạn không có quyền thanh toán vé của rạp " + bookingCinema.getCinemaName());
            }
        }

        User staff = userRepository.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên với ID: " + staffId));

        // Update booking to PAID status
        booking.setPaymentStatus(aws.movie_ticket_sales_web_project.enums.PaymentStatus.PAID);
        booking.setStatus(aws.movie_ticket_sales_web_project.enums.StatusBooking.PAID);
        booking.setPaidAt(Instant.now());
        booking.setPaymentMethod("CASH");
        booking.setPaymentReference("CASH-" + staffId + "-" + System.currentTimeMillis());
        bookingRepository.save(booking);

        // Update all tickets to PAID status
        List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
        tickets.forEach(ticket -> {
            ticket.setStatus(TicketStatus.PAID);
        });
        ticketRepository.saveAll(tickets);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "Thanh toán tiền mặt thành công");
        result.put("bookingCode", bookingCode);
        result.put("amount", booking.getTotalAmount());
        result.put("paymentMethod", "CASH");
        result.put("staffName", staff.getFullName());
        result.put("paidAt", booking.getPaidAt());
        
        log.info("Cash payment processed successfully for booking: {}", bookingCode);
        return result;
    }
}

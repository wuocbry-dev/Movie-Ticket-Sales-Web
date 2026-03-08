package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.CheckInRequest;
import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Cinema;
import aws.movie_ticket_sales_web_project.entity.Ticket;
import aws.movie_ticket_sales_web_project.entity.User;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketCheckInService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final CinemaStaffRepository cinemaStaffRepository;
    private final CinemaRepository cinemaRepository;

    @Transactional
    public ApiResponse<String> checkIn(CheckInRequest request) {
        try {
            log.info("=== CHECK-IN REQUEST ===");
            log.info("Staff ID: {}, Booking Code: {}", request.getStaffId(), request.getBookingCode());
            
            // Find booking
            Booking booking = bookingRepository.findByBookingCode(request.getBookingCode())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Get cinema from booking's showtime
            Cinema bookingCinema = booking.getShowtime().getHall().getCinema();
            Integer bookingCinemaId = bookingCinema.getId();
            
            log.info("Booking Cinema: ID={}, Name={}", bookingCinemaId, bookingCinema.getCinemaName());
            
            // Validate staff/manager belongs to this cinema
            // Check 1: Staff in cinema_staffs table
            Optional<Integer> staffCinemaId = cinemaStaffRepository.getCinemaIdByStaffUserId(request.getStaffId());
            boolean isStaffOfCinema = staffCinemaId.isPresent() && staffCinemaId.get().equals(bookingCinemaId);
            
            log.info("Staff Cinema ID from cinema_staffs: {}", staffCinemaId.orElse(null));
            log.info("Is Staff of Cinema: {}", isStaffOfCinema);
            
            // Check 2: Manager of this cinema (manager_id in cinemas table)
            boolean isManagerOfCinema = cinemaRepository.findById(bookingCinemaId)
                    .map(cinema -> {
                        Integer managerId = cinema.getManager() != null ? cinema.getManager().getId() : null;
                        log.info("Cinema {} Manager ID: {}", bookingCinemaId, managerId);
                        return managerId != null && managerId.equals(request.getStaffId());
                    })
                    .orElse(false);
            
            log.info("Is Manager of Cinema: {}", isManagerOfCinema);
            log.info("=== END CHECK ===");
            
            // If user is neither staff nor manager of this cinema, deny access
            if (!isStaffOfCinema && !isManagerOfCinema) {
                // Determine appropriate error message
                if (staffCinemaId.isEmpty() && !isManagerOfCinema) {
                    log.warn("User {} không được gán vào rạp nào", request.getStaffId());
                    return ApiResponse.<String>builder()
                            .success(false)
                            .message("Bạn chưa được gán vào rạp nào. Vui lòng liên hệ quản lý.")
                            .build();
                } else {
                    log.warn("User {} cố check-in booking của rạp {} mà không có quyền", 
                            request.getStaffId(), bookingCinemaId);
                    return ApiResponse.<String>builder()
                            .success(false)
                            .message("Bạn không có quyền check-in vé của rạp " + bookingCinema.getCinemaName() + ". " +
                                    "Vé này thuộc về rạp khác.")
                            .build();
                }
            }

            // Validate booking status - only allow PAID bookings
            // COMPLETED means already checked in
            if (booking.getStatus() == StatusBooking.COMPLETED) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Vé đã được check-in trước đó. Booking đã hoàn tất!")
                        .build();
            }
            
            if (booking.getStatus() != StatusBooking.PAID && booking.getStatus() != StatusBooking.CONFIRMED) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Booking chưa thanh toán. Status: " + booking.getStatus())
                        .build();
            }

            // Get staff user
            User staff = userRepository.findById(request.getStaffId())
                    .orElseThrow(() -> new RuntimeException("Staff not found"));

            // Update tickets
            List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
            
            // Check if any ticket is already used
            boolean hasUsedTicket = tickets.stream()
                    .anyMatch(ticket -> ticket.getStatus() == TicketStatus.USED);
            
            if (hasUsedTicket) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Vé đã được check-in trước đó. Không thể check-in lại!")
                        .build();
            }
            
            // Check-in all tickets
            for (Ticket ticket : tickets) {
                ticket.setStatus(TicketStatus.USED);
                ticket.setCheckedInAt(Instant.now());
                ticket.setCheckedInBy(staff);
            }
            ticketRepository.saveAll(tickets);

            // Update booking status to COMPLETED after successful check-in
            booking.setStatus(StatusBooking.COMPLETED);
            booking.setUpdatedAt(Instant.now());
            bookingRepository.save(booking);

            log.info("Check-in successful for booking: {}", booking.getBookingCode());

            return ApiResponse.<String>builder()
                    .success(true)
                    .message("Check-in successful for " + tickets.size() + " ticket(s)")
                    .data(booking.getBookingCode())
                    .build();

        } catch (Exception e) {
            log.error("Error during check-in", e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Check-in failed: " + e.getMessage())
                    .build();
        }
    }
}
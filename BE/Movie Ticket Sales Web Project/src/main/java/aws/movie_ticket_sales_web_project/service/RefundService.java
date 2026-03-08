package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.RefundRequest;
import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Showtime;
import aws.movie_ticket_sales_web_project.entity.Ticket;
import aws.movie_ticket_sales_web_project.enums.PaymentStatus;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefundService {

    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    private final EmailService emailService;

    @Transactional
    public ApiResponse<String> processRefund(Integer bookingId, RefundRequest request) {
        try {
            // Find booking
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            // Validate booking can be refunded
            if (booking.getStatus() == StatusBooking.REFUNDED) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Booking already refunded")
                        .build();
            }

            if (booking.getStatus() == StatusBooking.CONFIRMED || booking.getStatus() == StatusBooking.CANCELLED) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Cannot refund completed or cancelled booking")
                        .build();
            }

            // Check refund policy (2 hours before showtime)
            Showtime showtime = booking.getShowtime();
            LocalDate showDate = showtime.getShowDate();

            // Simplified check - in production use proper datetime comparison
            if (LocalDate.now().isAfter(showDate.minusDays(1))) {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Cannot refund within 2 hours of showtime")
                        .build();
            }

            // Process refund with payment gateway
            // In production: Call real payment gateway refund API
            boolean refundSuccess = processRefundWithGateway(booking);

            if (refundSuccess) {
                // Update booking
                booking.setStatus(StatusBooking.REFUNDED);
                booking.setPaymentStatus(PaymentStatus.REFUNDED);
                booking.setUpdatedAt(Instant.now());
                bookingRepository.save(booking);

                // Update tickets
                List<Ticket> tickets = ticketRepository.findByBookingId(bookingId);
                tickets.forEach(ticket -> ticket.setStatus(TicketStatus.REFUNDED));
                ticketRepository.saveAll(tickets);

                // Restore seat availability
                showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
                showtimeRepository.save(showtime);

                // Send refund confirmation email
                emailService.sendRefundConfirmation(booking);

                log.info("Refund processed for booking: {}", booking.getBookingCode());

                return ApiResponse.<String>builder()
                        .success(true)
                        .message("Refund processed successfully")
                        .data(booking.getBookingCode())
                        .build();
            } else {
                return ApiResponse.<String>builder()
                        .success(false)
                        .message("Refund failed with payment gateway")
                        .build();
            }

        } catch (Exception e) {
            log.error("Error processing refund", e);
            return ApiResponse.<String>builder()
                    .success(false)
                    .message("Refund failed: " + e.getMessage())
                    .build();
        }
    }

    private boolean processRefundWithGateway(Booking booking) {
        // Simulate refund processing
        // In production: Call real payment gateway refund API
        return true;
    }
}
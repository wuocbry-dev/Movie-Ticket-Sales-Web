package aws.movie_ticket_sales_web_project.scheduler;

import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.entity.Showtime;
import aws.movie_ticket_sales_web_project.entity.Ticket;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import aws.movie_ticket_sales_web_project.repository.BookingRepository;
import aws.movie_ticket_sales_web_project.repository.ShowtimeRepository;
import aws.movie_ticket_sales_web_project.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

/**
 * Scheduled tasks for booking management
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingScheduler {
    
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeRepository showtimeRepository;
    
    /**
     * Auto-cancel expired bookings that are still PENDING
     * Runs every 1 minute
     */
    @Scheduled(fixedRate = 60000) // 60 seconds = 1 minute
    @Transactional
    public void cancelExpiredBookings() {
        try {
            Instant now = Instant.now();
            
            // Find all PENDING bookings where holdExpiresAt < now
            List<Booking> expiredBookings = bookingRepository
                    .findByStatusAndHoldExpiresAtBefore(StatusBooking.PENDING, now);
            
            if (expiredBookings.isEmpty()) {
                return;
            }
            
            log.info("Found {} expired bookings to cancel", expiredBookings.size());
            
            for (Booking booking : expiredBookings) {
                try {
                    // Update booking status
                    booking.setStatus(StatusBooking.CANCELLED);
                    booking.setUpdatedAt(now);
                    bookingRepository.save(booking);
                    
                    // Update ticket status
                    List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
                    tickets.forEach(ticket -> ticket.setStatus(TicketStatus.CANCELLED));
                    ticketRepository.saveAll(tickets);
                    
                    // Restore seat availability
                    Showtime showtime = booking.getShowtime();
                    showtime.setAvailableSeats(showtime.getAvailableSeats() + tickets.size());
                    showtimeRepository.save(showtime);
                    
                    log.info("Auto-cancelled expired booking: {}", booking.getBookingCode());
                    
                } catch (Exception e) {
                    log.error("Failed to cancel booking: {}", booking.getBookingCode(), e);
                }
            }
            
            log.info("Successfully cancelled {} expired bookings", expiredBookings.size());
            
        } catch (Exception e) {
            log.error("Error in cancelExpiredBookings scheduler", e);
        }
    }
    
    /**
     * Clean up old cancelled bookings (optional)
     * Runs daily at 3 AM
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupOldCancelledBookings() {
        try {
            // Delete cancelled bookings older than 30 days
            Instant thirtyDaysAgo = Instant.now().minusSeconds(30L * 24 * 60 * 60);
            
            List<Booking> oldCancelledBookings = bookingRepository
                    .findByStatusAndUpdatedAtBefore(StatusBooking.CANCELLED, thirtyDaysAgo);
            
            if (!oldCancelledBookings.isEmpty()) {
                for (Booking booking : oldCancelledBookings) {
                    // Delete tickets first
                    List<Ticket> tickets = ticketRepository.findByBookingId(booking.getId());
                    ticketRepository.deleteAll(tickets);
                    
                    // Delete booking
                    bookingRepository.delete(booking);
                }
                
                log.info("Cleaned up {} old cancelled bookings", oldCancelledBookings.size());
            }
            
        } catch (Exception e) {
            log.error("Error in cleanupOldCancelledBookings scheduler", e);
        }
    }
}

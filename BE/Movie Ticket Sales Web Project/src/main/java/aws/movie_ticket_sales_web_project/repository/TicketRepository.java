package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Ticket;
import aws.movie_ticket_sales_web_project.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {
    
    List<Ticket> findByBookingId(Integer bookingId);
    
    Optional<Ticket> findByTicketCode(String ticketCode);
    
    @Query("SELECT t FROM Ticket t WHERE t.seat.id = :seatId AND t.booking.showtime.id = :showtimeId")
    Optional<Ticket> findBySeatIdAndShowtimeId(@Param("seatId") Integer seatId, @Param("showtimeId") Integer showtimeId);
    
    @Query("SELECT t FROM Ticket t WHERE t.booking.id = :bookingId AND t.status = :status")
    List<Ticket> findByBookingIdAndStatus(@Param("bookingId") Integer bookingId, @Param("status") TicketStatus status);
    
    boolean existsByTicketCode(String ticketCode);
    
    // Find active tickets only (exclude CANCELLED and REFUNDED)
    @Query("SELECT t FROM Ticket t WHERE t.seat.id = :seatId AND t.booking.showtime.id = :showtimeId AND t.status NOT IN ('CANCELLED', 'REFUNDED')")
    Optional<Ticket> findActiveBySeatIdAndShowtimeId(@Param("seatId") Integer seatId, @Param("showtimeId") Integer showtimeId);
}

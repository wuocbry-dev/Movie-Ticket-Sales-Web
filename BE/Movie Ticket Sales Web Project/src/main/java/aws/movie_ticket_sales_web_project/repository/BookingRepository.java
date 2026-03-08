package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Booking;
import aws.movie_ticket_sales_web_project.enums.StatusBooking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {
    
    Optional<Booking> findByBookingCode(String bookingCode);
    
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId")
    Page<Booking> findByUserId(@Param("userId") Integer userId, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId")
    List<Booking> findByUserId(@Param("userId") Integer userId);
    
    Page<Booking> findByStatus(StatusBooking status, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.showtime.id = :showtimeId")
    Page<Booking> findByShowtimeId(@Param("showtimeId") Integer showtimeId, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.user.id = :userId AND b.status = :status")
    Page<Booking> findByUserIdAndStatus(@Param("userId") Integer userId, @Param("status") StatusBooking status, Pageable pageable);
    
    @Query("SELECT b FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    List<Booking> findByBookingDateBetween(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);
    
    @Query("SELECT b FROM Booking b WHERE b.customerEmail = :email")
    Page<Booking> findByCustomerEmail(@Param("email") String email, Pageable pageable);
    
    boolean existsByBookingCode(String bookingCode);
    
    // Find bookings excluding cancelled status
    @Query("SELECT b FROM Booking b WHERE b.status != :excludedStatus")
    Page<Booking> findByStatusNot(@Param("excludedStatus") StatusBooking excludedStatus, Pageable pageable);
    
    // For scheduler
    List<Booking> findByStatusAndHoldExpiresAtBefore(StatusBooking status, Instant expiresAt);
    
    List<Booking> findByStatusAndUpdatedAtBefore(StatusBooking status, Instant updatedAt);
}

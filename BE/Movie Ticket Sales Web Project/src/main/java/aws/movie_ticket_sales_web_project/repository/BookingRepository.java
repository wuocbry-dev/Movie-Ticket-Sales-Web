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
    
    @Query("SELECT b FROM Booking b WHERE " +
           "LOWER(COALESCE(b.customerName, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(b.customerEmail, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "COALESCE(b.customerPhone, '') LIKE CONCAT('%', :search, '%') OR " +
           "LOWER(COALESCE(b.bookingCode, '')) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Booking> searchBookings(@Param("search") String search, Pageable pageable);
    
    // Find bookings excluding cancelled status
    @Query("SELECT b FROM Booking b WHERE b.status != :excludedStatus")
    Page<Booking> findByStatusNot(@Param("excludedStatus") StatusBooking excludedStatus, Pageable pageable);
    
    // For scheduler
    List<Booking> findByStatusAndHoldExpiresAtBefore(StatusBooking status, Instant expiresAt);
    
    List<Booking> findByStatusAndUpdatedAtBefore(StatusBooking status, Instant updatedAt);

    /** Load booking với showtime, movie, hall, cinema (để gửi email trong async không bị LazyInitializationException) */
    @Query("SELECT b FROM Booking b LEFT JOIN FETCH b.showtime s LEFT JOIN FETCH s.movie LEFT JOIN FETCH s.hall h LEFT JOIN FETCH h.cinema WHERE b.id = :id")
    Optional<Booking> findByIdWithShowtimeAndCinema(@Param("id") Integer id);

    // --- Dashboard Analytics Queries ---
    @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.paymentStatus = 'COMPLETED' AND b.bookingDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal sumRevenueByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    @Query("SELECT SUM(b.totalSeats) FROM Booking b WHERE b.paymentStatus = 'COMPLETED' AND b.bookingDate BETWEEN :startDate AND :endDate")
    Long sumTicketsByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate")
    Long countBookingsByDateRange(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    @Query("SELECT b.paymentStatus, COUNT(b) FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate GROUP BY b.paymentStatus")
    List<Object[]> countBookingsByPaymentStatus(@Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    @Query(value = "SELECT DATE(b.booking_date) as booking_date, SUM(b.total_amount) as revenue FROM bookings b WHERE b.payment_status = 'COMPLETED' AND b.booking_date >= :startDate GROUP BY DATE(b.booking_date) ORDER BY DATE(b.booking_date) ASC", nativeQuery = true)
    List<Object[]> sumRevenueGroupedByDateNative(@Param("startDate") Instant startDate);

    @Query(value = "SELECT MONTH(b.booking_date) as booking_month, SUM(b.total_amount) as revenue FROM bookings b WHERE b.payment_status = 'COMPLETED' AND YEAR(b.booking_date) = :year GROUP BY MONTH(b.booking_date) ORDER BY MONTH(b.booking_date) ASC", nativeQuery = true)
    List<Object[]> sumRevenueGroupedByMonthNative(@Param("year") int year);

    @Query(value = "SELECT DATE(b.booking_date) as booking_date, SUM(b.total_amount) as revenue FROM bookings b WHERE b.payment_status = 'COMPLETED' AND YEAR(b.booking_date) = :year AND MONTH(b.booking_date) = :month GROUP BY DATE(b.booking_date) ORDER BY DATE(b.booking_date) ASC", nativeQuery = true)
    List<Object[]> sumRevenueGroupedByDateForMonthNative(@Param("year") int year, @Param("month") int month);

    @Query(value = "SELECT YEAR(b.booking_date) as booking_year, SUM(b.total_amount) as revenue FROM bookings b WHERE b.payment_status = 'COMPLETED' GROUP BY YEAR(b.booking_date) ORDER BY YEAR(b.booking_date) ASC", nativeQuery = true)
    List<Object[]> sumRevenueGroupedByYearNative();

    @Query("SELECT m.title, SUM(b.totalSeats) as totalTickets FROM Booking b JOIN b.showtime s JOIN s.movie m WHERE b.paymentStatus = 'COMPLETED' GROUP BY m.id ORDER BY totalTickets DESC")
    List<Object[]> findTopMoviesByTicketsSold(Pageable pageable);
}

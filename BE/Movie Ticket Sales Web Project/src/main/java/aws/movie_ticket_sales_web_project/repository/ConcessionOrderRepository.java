package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.ConcessionOrder;
import aws.movie_ticket_sales_web_project.enums.ConcessionOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConcessionOrderRepository extends JpaRepository<ConcessionOrder, Integer> {

    /**
     * Tìm order theo id với user và cinema fetch
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "LEFT JOIN FETCH co.user " +
           "LEFT JOIN FETCH co.cinema " +
           "WHERE co.id = :id")
    Optional<ConcessionOrder> findByIdWithUser(@Param("id") Integer id);

    /**
     * Tìm orders theo user
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "LEFT JOIN FETCH co.user " +
           "WHERE co.user.id = :userId " +
           "ORDER BY co.createdAt DESC")
    List<ConcessionOrder> findByUserId(@Param("userId") Integer userId);

    /**
     * Tìm orders theo cinema
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "LEFT JOIN FETCH co.user " +
           "WHERE co.cinema.id = :cinemaId " +
           "ORDER BY co.createdAt DESC")
    List<ConcessionOrder> findByCinemaId(@Param("cinemaId") Integer cinemaId);

    /**
     * Tìm orders theo status
     */
    List<ConcessionOrder> findByStatusOrderByCreatedAtDesc(ConcessionOrderStatus status);

    /**
     * Tìm orders theo cinema và status
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "LEFT JOIN FETCH co.user " +
           "WHERE co.cinema.id = :cinemaId " +
           "AND co.status = :status " +
           "ORDER BY co.createdAt DESC")
    List<ConcessionOrder> findByCinemaIdAndStatus(
            @Param("cinemaId") Integer cinemaId,
            @Param("status") ConcessionOrderStatus status
    );

    /**
     * Tìm orders theo cinema, loại trừ một status cụ thể (dành cho staff)
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "LEFT JOIN FETCH co.user " +
           "WHERE co.cinema.id = :cinemaId " +
           "AND co.status != :excludeStatus " +
           "ORDER BY co.createdAt DESC")
    List<ConcessionOrder> findByCinemaIdExcludingStatus(
            @Param("cinemaId") Integer cinemaId,
            @Param("excludeStatus") ConcessionOrderStatus excludeStatus
    );

    /**
     * Tìm order theo order number
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "LEFT JOIN FETCH co.user " +
           "WHERE co.orderNumber = :orderNumber")
    Optional<ConcessionOrder> findByOrderNumber(@Param("orderNumber") String orderNumber);

    /**
     * Tìm order theo booking
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "LEFT JOIN FETCH co.user " +
           "WHERE co.booking.id = :bookingId")
    Optional<ConcessionOrder> findByBookingId(@Param("bookingId") Integer bookingId);

    /**
     * Tìm orders trong khoảng thời gian
     */
    @Query("SELECT co FROM ConcessionOrder co " +
           "WHERE co.cinema.id = :cinemaId " +
           "AND co.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY co.createdAt DESC")
    List<ConcessionOrder> findByCinemaAndDateRange(
            @Param("cinemaId") Integer cinemaId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );

    /**
     * Đếm orders theo status tại rạp
     */
    @Query("SELECT COUNT(co) FROM ConcessionOrder co " +
           "WHERE co.cinema.id = :cinemaId " +
           "AND co.status = :status")
    long countByCinemaIdAndStatus(
            @Param("cinemaId") Integer cinemaId,
            @Param("status") ConcessionOrderStatus status
    );

    /**
     * Tính tổng doanh thu theo rạp trong khoảng thời gian
     */
    @Query("SELECT COALESCE(SUM(co.totalAmount), 0) FROM ConcessionOrder co " +
           "WHERE co.cinema.id = :cinemaId " +
           "AND co.status = 'COMPLETED' " +
           "AND co.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal calculateRevenueByCinemaAndDateRange(
            @Param("cinemaId") Integer cinemaId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );
}

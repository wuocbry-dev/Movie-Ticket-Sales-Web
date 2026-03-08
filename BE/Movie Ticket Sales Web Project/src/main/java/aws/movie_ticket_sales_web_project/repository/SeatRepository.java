package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Integer> {

    /**
     * Find all seats in a cinema hall
     */
    List<Seat> findByHallId(Integer hallId);

    /**
     * Find active seats in a cinema hall
     */
    List<Seat> findByHallIdAndIsActiveTrue(Integer hallId);

    /**
     * Delete all seats in a cinema hall
     */
    @Modifying
    @Query("DELETE FROM Seat s WHERE s.hall.id = :hallId")
    void deleteByHallId(@Param("hallId") Integer hallId);

    /**
     * Count seats in a cinema hall
     */
    long countByHallId(Integer hallId);

    /**
     * Check if seat exists by row and number in a hall
     */
    boolean existsByHallIdAndSeatRowAndSeatNumber(Integer hallId, String seatRow, Integer seatNumber);

    /**
     * Find seats by IDs
     */
    @Query("SELECT s FROM Seat s WHERE s.id IN :seatIds")
    List<Seat> findAllByIds(@Param("seatIds") List<Integer> seatIds);
}

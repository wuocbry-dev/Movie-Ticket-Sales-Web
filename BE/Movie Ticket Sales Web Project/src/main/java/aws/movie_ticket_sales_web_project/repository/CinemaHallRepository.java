package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.CinemaHall;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CinemaHallRepository extends JpaRepository<CinemaHall, Integer> {

    /**
     * Find all halls in a cinema
     */
    List<CinemaHall> findByCinemaId(Integer cinemaId);

    /**
     * Find active halls in a cinema
     */
    List<CinemaHall> findByCinemaIdAndIsActiveTrue(Integer cinemaId);

    /**
     * Find halls in a cinema with pagination
     */
    Page<CinemaHall> findByCinemaId(Integer cinemaId, Pageable pageable);

    /**
     * Find active halls in a cinema with pagination
     */
    Page<CinemaHall> findByCinemaIdAndIsActiveTrue(Integer cinemaId, Pageable pageable);

    /**
     * Search halls by name in a cinema
     */
    @Query("SELECT h FROM CinemaHall h WHERE h.cinema.id = :cinemaId AND LOWER(h.hallName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY h.createdAt DESC")
    Page<CinemaHall> searchByNameInCinema(@Param("cinemaId") Integer cinemaId, @Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Search active halls by name in a cinema
     */
    @Query("SELECT h FROM CinemaHall h WHERE h.cinema.id = :cinemaId AND h.isActive = true AND LOWER(h.hallName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY h.createdAt DESC")
    Page<CinemaHall> searchActiveByNameInCinema(@Param("cinemaId") Integer cinemaId, @Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Check if hall exists by name in a cinema
     */
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM CinemaHall h WHERE h.cinema.id = :cinemaId AND LOWER(h.hallName) = LOWER(:hallName)")
    boolean existsByHallNameInCinema(@Param("cinemaId") Integer cinemaId, @Param("hallName") String hallName);

    /**
     * Check if hall exists by name in a cinema, excluding given ID
     */
    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END FROM CinemaHall h WHERE h.cinema.id = :cinemaId AND LOWER(h.hallName) = LOWER(:hallName) AND h.id != :id")
    boolean existsByHallNameInCinemaExcludingId(@Param("cinemaId") Integer cinemaId, @Param("hallName") String hallName, @Param("id") Integer id);

    /**
     * Find hall by ID and cinema ID (security check)
     */
    Optional<CinemaHall> findByIdAndCinemaId(Integer hallId, Integer cinemaId);

    /**
     * Find hall by ID and cinema chain ID (for authorization)
     */
    @Query("SELECT h FROM CinemaHall h WHERE h.id = :hallId AND h.cinema.chain.id = :chainId")
    Optional<CinemaHall> findByIdAndChainId(@Param("hallId") Integer hallId, @Param("chainId") Integer chainId);

    /**
     * Find halls by cinema chain ID
     */
    @Query("SELECT h FROM CinemaHall h WHERE h.cinema.chain.id = :chainId")
    List<CinemaHall> findByChainId(@Param("chainId") Integer chainId);

    /**
     * Find active halls by cinema chain ID
     */
    @Query("SELECT h FROM CinemaHall h WHERE h.cinema.chain.id = :chainId AND h.isActive = true")
    List<CinemaHall> findActiveByChainId(@Param("chainId") Integer chainId);
}

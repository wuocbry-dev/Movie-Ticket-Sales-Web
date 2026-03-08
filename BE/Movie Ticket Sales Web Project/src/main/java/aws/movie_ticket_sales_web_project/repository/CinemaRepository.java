package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Cinema;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Integer> {

    /**
     * Find all cinemas for a specific chain
     */
    List<Cinema> findByChainId(Integer chainId);

    /**
     * Find all active cinemas for a specific chain
     */
    List<Cinema> findByChainIdAndIsActiveTrue(Integer chainId);

    /**
     * Find cinemas for a chain with pagination
     */
    Page<Cinema> findByChainId(Integer chainId, Pageable pageable);

    /**
     * Find active cinemas for a chain with pagination
     */
    Page<Cinema> findByChainIdAndIsActiveTrue(Integer chainId, Pageable pageable);

    /**
     * Search cinemas by name for a specific chain
     */
    @Query("SELECT c FROM Cinema c WHERE c.chain.id = :chainId AND LOWER(c.cinemaName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.createdAt DESC")
    Page<Cinema> searchByChainIdAndName(@Param("chainId") Integer chainId, @Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Search active cinemas by name for a specific chain
     */
    @Query("SELECT c FROM Cinema c WHERE c.chain.id = :chainId AND c.isActive = true AND LOWER(c.cinemaName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.createdAt DESC")
    Page<Cinema> searchActiveByChainIdAndName(@Param("chainId") Integer chainId, @Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Check if cinema exists by name in a chain
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cinema c WHERE c.chain.id = :chainId AND LOWER(c.cinemaName) = LOWER(:cinemaName)")
    boolean existsByChainIdAndCinemaName(@Param("chainId") Integer chainId, @Param("cinemaName") String cinemaName);

    /**
     * Check if cinema exists by name in a chain, excluding given ID
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Cinema c WHERE c.chain.id = :chainId AND LOWER(c.cinemaName) = LOWER(:cinemaName) AND c.id != :id")
    boolean existsByChainIdAndCinemaNameExcludingId(@Param("chainId") Integer chainId, @Param("cinemaName") String cinemaName, @Param("id") Integer id);

    /**
     * Find cinema by ID and chain ID (security check)
     */
    Optional<Cinema> findByIdAndChainId(Integer cinemaId, Integer chainId);

    /**
     * Find cinemas by manager ID
     */
    Page<Cinema> findByManagerId(Integer managerId, Pageable pageable);

    List<Cinema> findByManagerId(Integer managerId);

    /**
     * Find cinemas by manager ID and chain ID
     */
    @Query("SELECT c FROM Cinema c WHERE c.manager.id = :managerId AND c.chain.id = :chainId")
    Page<Cinema> findCinemasByManagerAndChain(@Param("managerId") Integer managerId, @Param("chainId") Integer chainId, Pageable pageable);

    /**
     * Search cinemas by manager ID and cinema name
     */
    @Query("SELECT c FROM Cinema c WHERE c.manager.id = :managerId AND LOWER(c.cinemaName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.createdAt DESC")
    Page<Cinema> findByManagerIdAndCinemaNameContainingIgnoreCase(@Param("managerId") Integer managerId, @Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Search all cinemas by name (for system admin)
     */
    @Query("SELECT c FROM Cinema c WHERE LOWER(c.cinemaName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.createdAt DESC")
    Page<Cinema> findByCinemaNameContainingIgnoreCase(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Find all active cinemas with pagination
     */
    Page<Cinema> findByIsActiveTrue(Pageable pageable);

    /**
     * Search all active cinemas by name
     */
    @Query("SELECT c FROM Cinema c WHERE c.isActive = true AND LOWER(c.cinemaName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.createdAt DESC")
    Page<Cinema> searchActiveByCinemaName(@Param("searchTerm") String searchTerm, Pageable pageable);
}

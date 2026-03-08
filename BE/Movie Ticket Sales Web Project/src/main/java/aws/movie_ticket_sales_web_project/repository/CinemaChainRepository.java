package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.CinemaChain;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CinemaChainRepository extends JpaRepository<CinemaChain, Integer> {

    /**
     * Find cinema chain by name
     */
    Optional<CinemaChain> findByChainName(String chainName);

    /**
     * Find all active cinema chains
     */
    List<CinemaChain> findAllByIsActiveTrue();

    /**
     * Find all cinema chains with pagination
     */
    Page<CinemaChain> findAll(Pageable pageable);

    /**
     * Find active cinema chains with pagination
     */
    Page<CinemaChain> findAllByIsActiveTrue(Pageable pageable);

    /**
     * Search cinema chains by name with pagination
     */
    @Query("SELECT cc FROM CinemaChain cc WHERE LOWER(cc.chainName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY cc.createdAt DESC")
    Page<CinemaChain> searchByChainName(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Search active cinema chains by name with pagination
     */
    @Query("SELECT cc FROM CinemaChain cc WHERE cc.isActive = true AND LOWER(cc.chainName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY cc.createdAt DESC")
    Page<CinemaChain> searchActiveByChainName(@Param("searchTerm") String searchTerm, Pageable pageable);

    /**
     * Check if cinema chain exists by name
     */
    boolean existsByChainName(String chainName);

    /**
     * Check if cinema chain exists by name excluding given ID
     */
    @Query("SELECT CASE WHEN COUNT(cc) > 0 THEN true ELSE false END FROM CinemaChain cc WHERE LOWER(cc.chainName) = LOWER(:chainName) AND cc.id != :id")
    boolean existsByChainNameExcludingId(@Param("chainName") String chainName, @Param("id") Integer id);
}

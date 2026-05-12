package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    List<Promotion> findByIsActiveTrueOrderByStartDateDesc();

    List<Promotion> findAllByOrderByStartDateDesc();

    Optional<Promotion> findByPromotionCode(String promotionCode);

    boolean existsByPromotionCode(String promotionCode);

    @Query("SELECT p FROM Promotion p WHERE " +
           "(LOWER(p.promotionName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(p.promotionCode) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND p.isActive = true")
    List<Promotion> searchByNameOrCode(@Param("query") String query, org.springframework.data.domain.Pageable pageable);
}

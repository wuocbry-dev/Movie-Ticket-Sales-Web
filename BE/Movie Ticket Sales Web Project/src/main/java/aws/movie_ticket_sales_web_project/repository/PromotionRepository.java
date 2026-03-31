package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Integer> {

    List<Promotion> findByIsActiveTrueOrderByStartDateDesc();

    List<Promotion> findAllByOrderByStartDateDesc();

    Optional<Promotion> findByPromotionCode(String promotionCode);

    boolean existsByPromotionCode(String promotionCode);
}

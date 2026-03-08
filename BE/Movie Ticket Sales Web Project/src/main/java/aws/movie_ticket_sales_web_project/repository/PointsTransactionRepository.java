package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.PointsTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PointsTransactionRepository extends JpaRepository<PointsTransaction, Integer> {
    List<PointsTransaction> findByUserIdOrderByCreatedAtDesc(Integer userId);
    List<PointsTransaction> findBySourceTypeAndSourceId(aws.movie_ticket_sales_web_project.enums.SourceType sourceType, Integer sourceId);
}

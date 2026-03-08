package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.ConcessionOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConcessionOrderItemRepository extends JpaRepository<ConcessionOrderItem, Integer> {

    /**
     * Tìm items theo order
     */
    @Query("SELECT coi FROM ConcessionOrderItem coi " +
           "JOIN FETCH coi.item " +
           "WHERE coi.concessionOrder.id = :orderId")
    List<ConcessionOrderItem> findByOrderId(@Param("orderId") Integer orderId);

    /**
     * Xóa tất cả items của order
     */
    void deleteByConcessionOrderId(Integer orderId);
}

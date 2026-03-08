package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.ConcessionCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConcessionCategoryRepository extends JpaRepository<ConcessionCategory, Integer> {

    /**
     * Lấy tất cả categories active và sắp xếp theo display_order
     */
    List<ConcessionCategory> findByIsActiveTrueOrderByDisplayOrderAsc();

    /**
     * Tìm category theo tên
     */
    Optional<ConcessionCategory> findByCategoryName(String categoryName);

    /**
     * Kiểm tra tên đã tồn tại chưa
     */
    boolean existsByCategoryName(String categoryName);

    /**
     * Lấy tất cả (cả active và inactive) - cho admin
     */
    List<ConcessionCategory> findAllByOrderByDisplayOrderAsc();
}

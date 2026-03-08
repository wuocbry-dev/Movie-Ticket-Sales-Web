package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.ConcessionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConcessionItemRepository extends JpaRepository<ConcessionItem, Integer> {

    /**
     * Tìm items theo category
     */
    @Query("SELECT ci FROM ConcessionItem ci " +
           "WHERE ci.category.id = :categoryId " +
           "AND ci.isAvailable = true " +
           "ORDER BY ci.displayOrder, ci.itemName")
    List<ConcessionItem> findByCategoryId(@Param("categoryId") Integer categoryId);

    /**
     * Tìm tất cả items available
     */
    List<ConcessionItem> findByIsAvailable(Boolean isAvailable);

    /**
     * Tìm items available và sắp xếp
     */
    @Query("SELECT ci FROM ConcessionItem ci " +
           "JOIN FETCH ci.category c " +
           "WHERE ci.isAvailable = true " +
           "ORDER BY c.displayOrder, ci.displayOrder, ci.itemName")
    List<ConcessionItem> findAllAvailableItems();

    /**
     * Tìm combo items
     */
    @Query("SELECT ci FROM ConcessionItem ci " +
           "WHERE ci.isCombo = true " +
           "AND ci.isAvailable = true " +
           "ORDER BY ci.displayOrder, ci.itemName")
    List<ConcessionItem> findAllCombos();

    /**
     * Tìm non-combo items
     */
    @Query("SELECT ci FROM ConcessionItem ci " +
           "WHERE ci.isCombo = false " +
           "AND ci.isAvailable = true " +
           "ORDER BY ci.category.displayOrder, ci.displayOrder, ci.itemName")
    List<ConcessionItem> findAllNonComboItems();

    /**
     * Tìm items có tồn kho thấp
     */
    @Query("SELECT ci FROM ConcessionItem ci " +
           "WHERE ci.stockQuantity <= ci.lowStockThreshold " +
           "AND ci.isAvailable = true " +
           "ORDER BY ci.stockQuantity")
    List<ConcessionItem> findLowStockItems();

    /**
     * Tìm theo tên (search)
     */
    @Query("SELECT ci FROM ConcessionItem ci " +
           "WHERE LOWER(ci.itemName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "AND ci.isAvailable = true " +
           "ORDER BY ci.itemName")
    List<ConcessionItem> searchByName(@Param("keyword") String keyword);

    /**
     * Kiểm tra tên item đã tồn tại chưa
     */
    boolean existsByItemName(String itemName);

    /**
     * Tìm item theo tên chính xác
     */
    Optional<ConcessionItem> findByItemName(String itemName);

    /**
     * Đếm số items available
     */
    @Query("SELECT COUNT(ci) FROM ConcessionItem ci WHERE ci.isAvailable = true")
    long countAvailableItems();

    /**
     * Đếm số combos available
     */
    @Query("SELECT COUNT(ci) FROM ConcessionItem ci " +
           "WHERE ci.isAvailable = true AND ci.isCombo = true")
    long countAvailableCombos();
}

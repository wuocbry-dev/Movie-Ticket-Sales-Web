package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.CinemaConcessionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CinemaConcessionItemRepository extends JpaRepository<CinemaConcessionItem, Integer> {

    /**
     * Lấy tất cả items có bán tại rạp cụ thể
     */
    @Query("SELECT cci FROM CinemaConcessionItem cci " +
           "JOIN FETCH cci.item i " +
           "JOIN FETCH i.category " +
           "WHERE cci.cinema.id = :cinemaId " +
           "AND cci.isAvailable = true " +
           "AND i.isAvailable = true " +
           "ORDER BY cci.displayOrder, i.itemName")
    List<CinemaConcessionItem> findAvailableItemsByCinemaId(@Param("cinemaId") Integer cinemaId);

    /**
     * Lấy items theo rạp và category
     */
    @Query("SELECT cci FROM CinemaConcessionItem cci " +
           "JOIN FETCH cci.item i " +
           "JOIN FETCH i.category c " +
           "WHERE cci.cinema.id = :cinemaId " +
           "AND c.id = :categoryId " +
           "AND cci.isAvailable = true " +
           "AND i.isAvailable = true " +
           "ORDER BY cci.displayOrder, i.itemName")
    List<CinemaConcessionItem> findAvailableItemsByCinemaAndCategory(
            @Param("cinemaId") Integer cinemaId,
            @Param("categoryId") Integer categoryId
    );

    /**
     * Tìm item cụ thể tại rạp
     */
    @Query("SELECT cci FROM CinemaConcessionItem cci " +
           "JOIN FETCH cci.item i " +
           "WHERE cci.cinema.id = :cinemaId " +
           "AND cci.item.id = :itemId")
    Optional<CinemaConcessionItem> findByCinemaIdAndItemId(
            @Param("cinemaId") Integer cinemaId,
            @Param("itemId") Integer itemId
    );

    /**
     * Kiểm tra item có bán tại rạp không
     */
    @Query("SELECT CASE WHEN COUNT(cci) > 0 THEN true ELSE false END " +
           "FROM CinemaConcessionItem cci " +
           "WHERE cci.cinema.id = :cinemaId " +
           "AND cci.item.id = :itemId " +
           "AND cci.isAvailable = true")
    boolean existsByCinemaIdAndItemId(
            @Param("cinemaId") Integer cinemaId,
            @Param("itemId") Integer itemId
    );

    /**
     * Lấy tất cả items của rạp (kể cả không available - dùng cho quản lý)
     */
    @Query("SELECT cci FROM CinemaConcessionItem cci " +
           "JOIN FETCH cci.item i " +
           "JOIN FETCH i.category " +
           "WHERE cci.cinema.id = :cinemaId " +
           "ORDER BY i.category.displayOrder, cci.displayOrder, i.itemName")
    List<CinemaConcessionItem> findAllByCinemaId(@Param("cinemaId") Integer cinemaId);

    /**
     * Lấy các items có tồn kho thấp
     */
    @Query("SELECT cci FROM CinemaConcessionItem cci " +
           "JOIN FETCH cci.item i " +
           "WHERE cci.cinema.id = :cinemaId " +
           "AND cci.stockQuantity < :threshold " +
           "ORDER BY cci.stockQuantity")
    List<CinemaConcessionItem> findLowStockItems(
            @Param("cinemaId") Integer cinemaId,
            @Param("threshold") Integer threshold
    );

    /**
     * Xóa item khỏi rạp
     */
    void deleteByCinemaIdAndItemId(Integer cinemaId, Integer itemId);

    /**
     * Đếm số lượng items có bán tại rạp
     */
    @Query("SELECT COUNT(cci) FROM CinemaConcessionItem cci " +
           "WHERE cci.cinema.id = :cinemaId " +
           "AND cci.isAvailable = true")
    long countAvailableItemsByCinemaId(@Param("cinemaId") Integer cinemaId);
}

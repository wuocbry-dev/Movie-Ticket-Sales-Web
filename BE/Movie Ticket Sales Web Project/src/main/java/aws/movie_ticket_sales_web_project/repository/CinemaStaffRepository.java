package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.CinemaStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository để quản lý thông tin nhân viên làm việc tại rạp
 */
@Repository
public interface CinemaStaffRepository extends JpaRepository<CinemaStaff, Integer> {

    /**
     * Tìm tất cả nhân viên của một rạp
     */
    @Query("SELECT cs FROM CinemaStaff cs " +
           "LEFT JOIN FETCH cs.user " +
           "WHERE cs.cinema.id = :cinemaId AND cs.isActive = true")
    List<CinemaStaff> findByCinemaId(@Param("cinemaId") Integer cinemaId);

    /**
     * Tìm thông tin staff theo userId
     */
    @Query("SELECT cs FROM CinemaStaff cs " +
           "LEFT JOIN FETCH cs.cinema " +
           "WHERE cs.user.id = :userId AND cs.isActive = true")
    Optional<CinemaStaff> findByUserId(@Param("userId") Integer userId);

    /**
     * Tìm thông tin staff theo userId (có thể inactive)
     */
    @Query("SELECT cs FROM CinemaStaff cs " +
           "LEFT JOIN FETCH cs.cinema " +
           "WHERE cs.user.id = :userId")
    List<CinemaStaff> findAllByUserId(@Param("userId") Integer userId);

    /**
     * Kiểm tra xem một user có phải là staff của một cinema cụ thể không
     */
    @Query("SELECT CASE WHEN COUNT(cs) > 0 THEN true ELSE false END " +
           "FROM CinemaStaff cs " +
           "WHERE cs.user.id = :userId AND cs.cinema.id = :cinemaId AND cs.isActive = true")
    boolean isStaffOfCinema(@Param("userId") Integer userId, @Param("cinemaId") Integer cinemaId);

    /**
     * Lấy cinema ID của một staff
     */
    @Query("SELECT cs.cinema.id FROM CinemaStaff cs " +
           "WHERE cs.user.id = :userId AND cs.isActive = true")
    Optional<Integer> getCinemaIdByStaffUserId(@Param("userId") Integer userId);

    /**
     * Tìm staff theo userId và cinemaId
     */
    @Query("SELECT cs FROM CinemaStaff cs " +
           "LEFT JOIN FETCH cs.user " +
           "LEFT JOIN FETCH cs.cinema " +
           "WHERE cs.user.id = :userId AND cs.cinema.id = :cinemaId")
    Optional<CinemaStaff> findByUserIdAndCinemaId(@Param("userId") Integer userId, 
                                                   @Param("cinemaId") Integer cinemaId);

    /**
     * Kiểm tra xem user đã được gán vào rạp này chưa
     */
    boolean existsByUserIdAndCinemaId(Integer userId, Integer cinemaId);

    /**
     * Lấy danh sách staff active của cinema với pagination
     */
    @Query("SELECT cs FROM CinemaStaff cs " +
           "LEFT JOIN FETCH cs.user " +
           "WHERE cs.cinema.id = :cinemaId AND cs.isActive = true " +
           "ORDER BY cs.createdAt DESC")
    List<CinemaStaff> findActiveByCinemaId(@Param("cinemaId") Integer cinemaId);
}

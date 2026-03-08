package aws.movie_ticket_sales_web_project.repository;

import aws.movie_ticket_sales_web_project.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    
    /**
     * Tìm token mới nhất theo email và code, chưa sử dụng và chưa hết hạn
     */
    @Query("SELECT t FROM PasswordResetToken t WHERE t.email = :email AND t.code = :code " +
           "AND t.isUsed = false AND t.expiresAt > :now ORDER BY t.createdAt DESC")
    Optional<PasswordResetToken> findValidToken(@Param("email") String email, 
                                                  @Param("code") String code,
                                                  @Param("now") Instant now);
    
    /**
     * Tìm token mới nhất theo email, chưa sử dụng và chưa hết hạn
     */
    @Query("SELECT t FROM PasswordResetToken t WHERE t.email = :email " +
           "AND t.isUsed = false AND t.expiresAt > :now ORDER BY t.createdAt DESC")
    Optional<PasswordResetToken> findLatestValidTokenByEmail(@Param("email") String email,
                                                               @Param("now") Instant now);
    
    /**
     * Đánh dấu tất cả token cũ của email là đã sử dụng
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.isUsed = true WHERE t.email = :email AND t.isUsed = false")
    void invalidateAllTokensByEmail(@Param("email") String email);
    
    /**
     * Xóa các token đã hết hạn (cleanup job)
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(@Param("now") Instant now);
}

package aws.movie_ticket_sales_web_project.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Service để quản lý JWT Token Blacklist
 * Dùng để invalidate token khi user logout
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    private static final String BLACKLIST_PREFIX = "jwt:blacklist:";
    private static final String REFRESH_TOKEN_PREFIX = "jwt:refresh:";
    
    /**
     * Thêm token vào blacklist khi logout
     * @param token JWT token cần blacklist
     * @param expirationMs Thời gian còn lại của token (milliseconds)
     */
    public void blacklistToken(String token, long expirationMs) {
        String key = BLACKLIST_PREFIX + token;
        // Lưu token vào blacklist với TTL = thời gian còn lại của token
        redisTemplate.opsForValue().set(key, "revoked", expirationMs, TimeUnit.MILLISECONDS);
        log.info("Token added to blacklist, will expire in {} ms", expirationMs);
    }
    
    /**
     * Kiểm tra token có trong blacklist không
     * @param token JWT token cần kiểm tra
     * @return true nếu token đã bị blacklist
     */
    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        Boolean exists = redisTemplate.hasKey(key);
        return exists != null && exists;
    }
    
    /**
     * Lưu refresh token vào Redis
     * @param userId User ID
     * @param refreshToken Refresh token
     * @param expirationMs Thời gian hết hạn (milliseconds)
     */
    public void storeRefreshToken(Integer userId, String refreshToken, long expirationMs) {
        String key = REFRESH_TOKEN_PREFIX + userId;
        redisTemplate.opsForValue().set(key, refreshToken, expirationMs, TimeUnit.MILLISECONDS);
        log.info("Refresh token stored for user {}", userId);
    }
    
    /**
     * Lấy refresh token từ Redis
     * @param userId User ID
     * @return Refresh token hoặc null
     */
    public String getRefreshToken(Integer userId) {
        String key = REFRESH_TOKEN_PREFIX + userId;
        Object token = redisTemplate.opsForValue().get(key);
        return token != null ? token.toString() : null;
    }
    
    /**
     * Xóa refresh token khi logout
     * @param userId User ID
     */
    public void removeRefreshToken(Integer userId) {
        String key = REFRESH_TOKEN_PREFIX + userId;
        redisTemplate.delete(key);
        log.info("Refresh token removed for user {}", userId);
    }
    
    /**
     * Invalidate tất cả token của user (force logout all devices)
     * @param userId User ID
     */
    public void invalidateAllUserTokens(Integer userId) {
        removeRefreshToken(userId);
        // Có thể thêm logic để track và blacklist tất cả access token nếu cần
        log.info("All tokens invalidated for user {}", userId);
    }
}

package aws.movie_ticket_sales_web_project.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret:mySecretKeyForJWTTokenGenerationAndValidationMustBeAtLeast32CharsLong}")
    private String jwtSecret;

    @Value("${app.jwt.expiration:3600000}")
    private long jwtExpirationMs;

    @Value("${app.jwt.refresh-expiration:86400000}")
    private long jwtRefreshExpirationMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generate JWT access token
     */
    public String generateAccessToken(String email, Integer userId) {
        return generateToken(email, userId, jwtExpirationMs);
    }

    /**
     * Generate JWT refresh token
     */
    public String generateRefreshToken(String email, Integer userId) {
        return generateToken(email, userId, jwtRefreshExpirationMs);
    }

    /**
     * Generate JWT token
     */
    private String generateToken(String email, Integer userId, long expirationTime) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Get email from JWT token
     */
    public String getEmailFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.getSubject();
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error getting email from token", e);
            return null;
        }
    }

    /**
     * Get userId from JWT token
     */
    public Integer getUserIdFromToken(String token) {
        try {
            Claims claims = getAllClaimsFromToken(token);
            return claims.get("userId", Integer.class);
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error getting userId from token", e);
            return null;
        }
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get all claims from JWT token
     */
    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Get token expiration time
     */
    public long getTokenExpirationTime() {
        return jwtExpirationMs;
    }
}

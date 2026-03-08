package aws.movie_ticket_sales_web_project.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        String requestURI = request.getRequestURI();
        String method = request.getMethod();
        log.info("🔍 JWT Filter - Processing: {} {}", method, requestURI);
        
        try {
            String jwt = getJwtFromRequest(request);
            log.info("🎫 JWT Token extracted: {}", jwt != null ? "Present (length: " + jwt.length() + ")" : "MISSING");

            if (StringUtils.hasText(jwt)) {
                boolean isValid = tokenProvider.validateToken(jwt);
                log.info("✅ Token validation: {}", isValid ? "VALID" : "INVALID");
                
                if (isValid) {
                    String email = tokenProvider.getEmailFromToken(jwt);
                    log.info("📧 Email from token: {}", email);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    log.info("👤 User loaded: {} with authorities: {}", email, userDetails.getAuthorities());
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    log.info("🔐 Authentication set in SecurityContext for user: {}", email);
                } else {
                    log.warn("⚠️ Token is invalid, authentication not set");
                }
            } else {
                log.warn("⚠️ No JWT token found in request");
            }
        } catch (Exception ex) {
            log.error("❌ Could not set user authentication in security context", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        log.info("📋 Authorization header: {}", bearerToken != null ? "Present (starts with 'Bearer ': " + bearerToken.startsWith("Bearer ") + ")" : "MISSING");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            log.info("🔑 Extracted token (first 20 chars): {}...", token.length() > 20 ? token.substring(0, 20) : token);
            return token;
        }
        return null;
    }
}

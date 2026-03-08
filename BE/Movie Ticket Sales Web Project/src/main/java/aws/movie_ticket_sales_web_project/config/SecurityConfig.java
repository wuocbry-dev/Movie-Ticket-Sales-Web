package aws.movie_ticket_sales_web_project.config;

import aws.movie_ticket_sales_web_project.security.JwtAccessDeniedHandler;
import aws.movie_ticket_sales_web_project.security.JwtAuthenticationEntryPoint;
import aws.movie_ticket_sales_web_project.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true, jsr250Enabled = true, prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @SuppressWarnings("deprecation")
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .authenticationProvider(authenticationProvider())
                .build();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // PRODUCTION: Specify allowed origins instead of "*"
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:3000",      // Local development
            "http://localhost:8080",      // Backend local
            "http://q2k.click*",    // TODO: Replace with actual production domain
            "https://*.your-domain.com"   // TODO: Replace with actual production subdomain
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "Accept", 
            "Origin", 
            "X-Requested-With"
        ));
        configuration.setAllowCredentials(true); // Enable for JWT cookies if needed
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public health check endpoint
                        .requestMatchers("/api/health/**").permitAll()

                        // Public authentication endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/password/**").permitAll() // Password reset endpoints
                        .requestMatchers(HttpMethod.GET, "/api/auth/check-admin").authenticated()

                        // Admin-only movie endpoints (must come BEFORE the permitAll GET)
                        .requestMatchers(HttpMethod.POST, "/api/movies").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/movies/{movieId}").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/movies/{movieId}").hasRole("SYSTEM_ADMIN")

                        // Admin-only upload endpoints
                        .requestMatchers("/api/upload/**").hasRole("SYSTEM_ADMIN")

                        // Public movie endpoints (GET only)
                        .requestMatchers(HttpMethod.GET, "/api/movies/**").permitAll()

                        // Admin-only cinema chain endpoints
                        .requestMatchers(HttpMethod.POST, "/api/cinema-chains/admin").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cinema-chains/admin/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cinema-chains/admin/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/cinema-chains/admin/**").hasRole("SYSTEM_ADMIN")

                        // Public cinema chain endpoints (GET only)
                        .requestMatchers(HttpMethod.GET, "/api/cinema-chains/**").permitAll()

                        // Admin-only cinema endpoints
                        .requestMatchers(HttpMethod.POST, "/api/cinemas/admin").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/cinemas/admin/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/cinemas/admin/**").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/cinemas/chain/{chainId}/admin").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/cinemas/admin/all").hasRole("SYSTEM_ADMIN")

                        // Authenticated cinema endpoints
                        .requestMatchers(HttpMethod.GET, "/api/cinemas/my-cinemas").authenticated()

                        // Cinema concessions - PUBLIC READ (must be BEFORE /api/cinemas/**)
                        .requestMatchers(HttpMethod.GET, "/api/cinemas/*/concessions/**").permitAll()

                        // Public cinema endpoints (GET only)
                        .requestMatchers(HttpMethod.GET, "/api/cinemas/**").permitAll()

                        // Admin-only cinema hall endpoints
                        .requestMatchers(HttpMethod.POST, "/api/cinema-halls/admin/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/cinema-halls/admin/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/cinema-halls/admin/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/cinema-halls/cinema/{cinemaId}/admin").authenticated()

                        // Manager cinema hall endpoints (authenticated - must be before public)
                        .requestMatchers(HttpMethod.GET, "/api/cinema-halls/manager/**").authenticated()

                        // Public cinema hall endpoints (GET only)
                        .requestMatchers(HttpMethod.GET, "/api/cinema-halls/**").permitAll()

                        // Manager showtime endpoints (authenticated - must be before public showtimes)
                        .requestMatchers(HttpMethod.GET, "/api/showtimes/manager/**").authenticated()

                        // Admin-only showtime endpoints
                        .requestMatchers(HttpMethod.POST, "/api/showtimes/admin/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/showtimes/admin/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/showtimes/admin/**").authenticated()

                        // Public showtime endpoints (GET only)
                        .requestMatchers(HttpMethod.GET, "/api/showtimes/**").permitAll()

                        // Booking endpoints (order matters - specific before general!)
                        .requestMatchers(HttpMethod.POST, "/api/bookings").permitAll() // Allow guest bookings
                        .requestMatchers(HttpMethod.GET, "/api/bookings/code/**").permitAll() // Check booking by code
                        .requestMatchers(HttpMethod.GET, "/api/bookings/[0-9]+").permitAll() // Get booking by ID (public for guests)
                        .requestMatchers(HttpMethod.GET, "/api/bookings/user/**").authenticated() // User's bookings
                        .requestMatchers(HttpMethod.GET, "/api/bookings/status/**").authenticated() // Filter by status
                        .requestMatchers(HttpMethod.GET, "/api/bookings/showtime/**").authenticated() // Filter by
                                                                                                      // showtime
                        .requestMatchers(HttpMethod.PUT, "/api/bookings/**").authenticated() // Update booking
                        .requestMatchers(HttpMethod.POST, "/api/bookings/*/cancel").authenticated() // Cancel booking
                        .requestMatchers(HttpMethod.DELETE, "/api/bookings/admin/**").hasRole("SYSTEM_ADMIN") // Delete
                                                                                                              // booking
                        .requestMatchers(HttpMethod.GET, "/api/bookings/**").authenticated() // View all bookings (MUST
                                                                                             // be last)

                        // Seat hold endpoints (public for guest users)
                        .requestMatchers(HttpMethod.POST, "/api/seats/hold").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/seats/release").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/seats/extend-hold").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/seats/availability/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/seats/verify-hold").permitAll()

                        // Concession endpoints
                        // Categories (public read, admin write)
                        .requestMatchers(HttpMethod.GET, "/api/concessions/categories/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/concessions/categories/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/categories/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/concessions/categories/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        
                        // Items master data (public read, admin write)
                        .requestMatchers(HttpMethod.GET, "/api/concessions/items/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/concessions/items/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/items/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/concessions/items/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        
                        // Cinema concessions - MANAGER WRITE (GET already defined above before /api/cinemas/**)
                        .requestMatchers(HttpMethod.POST, "/api/cinemas/*/concessions/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/cinemas/*/concessions/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/cinemas/*/concessions/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER")
                        
                        // Concession orders (authenticated users)
                        .requestMatchers(HttpMethod.POST, "/api/concessions/orders").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/concessions/orders/number/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/concessions/orders/booking/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/concessions/orders/user/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/concessions/orders/cinema/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/concessions/orders/staff/**").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "CINEMA_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/orders/*/status").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "CINEMA_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/orders/*/confirm").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/orders/*/prepare").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "CINEMA_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/orders/*/ready").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "CINEMA_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/orders/*/complete").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "CINEMA_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/orders/*/cancel").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "CINEMA_STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/concessions/orders/*/notes").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN", "CINEMA_MANAGER", "CINEMA_STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/concessions/orders/**").authenticated()
                        
                        // Loyalty points (public balance check for booking, authenticated for history)
                        .requestMatchers(HttpMethod.GET, "/api/loyalty/points/balance/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/loyalty/points/preview").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/loyalty/points/history/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/loyalty/points/**").authenticated()

                        // ==================== PAYMENT ENDPOINTS ====================
                        // PRODUCTION: Require authentication for all payment operations
                        .requestMatchers(HttpMethod.POST, "/api/payments/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/payments/**").authenticated()

                        // ==================== AI CHATBOT ====================
                        // Public access for chatbot
                        .requestMatchers("/api/chat/**").permitAll()

                        // ==================== USER MANAGEMENT ====================
                        // Admin only - user management
                        .requestMatchers(HttpMethod.GET, "/api/users").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/search").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/roles").hasRole("SYSTEM_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/*/status").hasAnyRole("SYSTEM_ADMIN", "CHAIN_ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()

                        // ==================== ADMIN ENDPOINTS ====================
                        .requestMatchers("/api/admin/**").hasAnyRole("SYSTEM_ADMIN", "ADMIN")

                        // ==================== STAFF ENDPOINTS ====================
                        // Staff ticket management (staff, manager, admin)
                        .requestMatchers("/api/tickets/staff/**").hasAnyRole("CINEMA_STAFF", "CINEMA_MANAGER", "CHAIN_ADMIN", "SYSTEM_ADMIN")
                        
                        // Check-in (staff and above)
                        .requestMatchers("/api/tickets/check-in").hasAnyRole("CINEMA_STAFF", "CINEMA_MANAGER", "CHAIN_ADMIN", "SYSTEM_ADMIN")

                        // ==================== MANAGER ENDPOINTS ====================
                        // Refund operations (manager and above)
                        .requestMatchers("/api/refunds/**").hasAnyRole("CINEMA_MANAGER", "CHAIN_ADMIN", "SYSTEM_ADMIN")

                        // ==================== REPORTS ====================
                        // Reports (admin only)
                        .requestMatchers("/api/reports/**").hasAnyRole("CHAIN_ADMIN", "SYSTEM_ADMIN")

                        // ==================== STATIC RESOURCES ====================
                        .requestMatchers(HttpMethod.GET, "/", "/favicon.ico", "/static/**", "/images/**", "/css/**",
                                "/js/**", "/uploads/**")
                        .permitAll()

                        // ==================== DEFAULT ====================
                        // All other requests need authentication
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

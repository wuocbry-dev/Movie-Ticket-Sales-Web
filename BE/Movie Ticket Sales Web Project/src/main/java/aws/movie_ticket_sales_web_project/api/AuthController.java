package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.service.AuthenticationService;
import aws.movie_ticket_sales_web_project.service.RoleManagementService;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthenticationService authenticationService;
    private final RoleManagementService roleManagementService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new user
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<RegisterResponse>> register(@RequestBody RegisterRequest request) {
        log.info("Register endpoint called for email: {}", request.getEmail());
        ApiResponse<RegisterResponse> response = authenticationService.register(request);

        if (response.getSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Login user
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request) {
        log.info("Login endpoint called for email: {}", request.getEmail());
        ApiResponse<LoginResponse> response = authenticationService.login(request);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

    /**
     * Check if current user is admin
     * GET /api/auth/check-admin
     */
    @GetMapping("/check-admin")
    public ResponseEntity<ApiResponse<Boolean>> checkAdmin(@RequestHeader("Authorization") String token) {
        try {
            String actualToken = token.replace("Bearer ", "");
            Integer userId = jwtTokenProvider.getUserIdFromToken(actualToken);
            
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<Boolean>builder()
                                .success(false)
                                .message("Invalid token")
                                .build());
            }

            boolean isAdmin = roleManagementService.isUserAdmin(userId);
            
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                    .success(true)
                    .message("Admin check completed")
                    .data(isAdmin)
                    .build());

        } catch (Exception e) {
            log.error("Error checking admin status", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Boolean>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }
}

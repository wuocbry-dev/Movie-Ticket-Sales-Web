package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.CinemaChainService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cinema-chains")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class CinemaChainController {

    private final CinemaChainService cinemaChainService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Extract user ID from JWT token
     */
    private Integer getUserIdFromToken(String token) {
        try {
            String actualToken = token.replace("Bearer ", "");
            return jwtTokenProvider.getUserIdFromToken(actualToken);
        } catch (Exception e) {
            log.error("Error extracting user ID from token", e);
            return null;
        }
    }

    /**
     * Get all public cinema chains (active only)
     * GET /api/cinema-chains
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedCinemaChainResponse>> getAllPublicCinemaChains(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search) {

        log.info("Getting all public cinema chains - page: {}, size: {}, search: {}", page, size, search);

        ApiResponse<PagedCinemaChainResponse> response = cinemaChainService.getAllCinemaChains(page, size, search, null);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get cinema chain by ID (public)
     * GET /api/cinema-chains/{chainId}
     */
    @GetMapping("/{chainId}")
    public ResponseEntity<ApiResponse<CinemaChainDto>> getCinemaChainById(
            @PathVariable Integer chainId) {

        log.info("Getting cinema chain by ID: {}", chainId);

        ApiResponse<CinemaChainDto> response = cinemaChainService.getCinemaChainById(chainId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Get all cinema chains (admin only) - includes inactive chains
     * GET /api/cinema-chains/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<PagedCinemaChainResponse>> getAllCinemaChainsByAdmin(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search,
            @RequestHeader("Authorization") String token) {

        log.info("Admin getting all cinema chains - page: {}, size: {}, search: {}", page, size, search);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<PagedCinemaChainResponse>builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            ApiResponse<PagedCinemaChainResponse> response = cinemaChainService.getAllCinemaChainsByAdmin(page, size, search, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting cinema chains by admin", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<PagedCinemaChainResponse>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Create cinema chain (admin only)
     * POST /api/cinema-chains/admin
     */
    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<CinemaChainDto>> createCinemaChain(
            @RequestBody CreateCinemaChainRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Creating cinema chain: {}", request.getChainName());

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<CinemaChainDto>builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            ApiResponse<CinemaChainDto> response = cinemaChainService.createCinemaChain(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error creating cinema chain", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<CinemaChainDto>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Update cinema chain (admin only)
     * PUT /api/cinema-chains/admin/{chainId}
     */
    @PutMapping("/admin/{chainId}")
    public ResponseEntity<ApiResponse<CinemaChainDto>> updateCinemaChain(
            @PathVariable Integer chainId,
            @RequestBody UpdateCinemaChainRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Updating cinema chain: {}", chainId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<CinemaChainDto>builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            // Ensure chainId in URL matches request body
            request.setChainId(chainId);

            ApiResponse<CinemaChainDto> response = cinemaChainService.updateCinemaChain(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error updating cinema chain", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<CinemaChainDto>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Delete cinema chain (admin only) - soft delete
     * DELETE /api/cinema-chains/admin/{chainId}
     */
    @DeleteMapping("/admin/{chainId}")
    public ResponseEntity<ApiResponse<Void>> deleteCinemaChain(
            @PathVariable Integer chainId,
            @RequestHeader("Authorization") String token) {

        log.info("Deleting cinema chain: {}", chainId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<Void>builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            ApiResponse<Void> response = cinemaChainService.deleteCinemaChain(chainId, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error deleting cinema chain", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }

    /**
     * Permanently delete cinema chain (admin only)
     * DELETE /api/cinema-chains/admin/{chainId}/permanent
     */
    @DeleteMapping("/admin/{chainId}/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentlyDeleteCinemaChain(
            @PathVariable Integer chainId,
            @RequestHeader("Authorization") String token) {

        log.info("Permanently deleting cinema chain: {}", chainId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<Void>builder()
                                .success(false)
                                .message("Invalid or expired token")
                                .build());
            }

            ApiResponse<Void> response = cinemaChainService.permanentlyDeleteCinemaChain(chainId, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error permanently deleting cinema chain", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Invalid or expired token")
                            .build());
        }
    }
}

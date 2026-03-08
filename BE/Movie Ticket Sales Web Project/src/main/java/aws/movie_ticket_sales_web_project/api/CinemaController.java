package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.CinemaService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cinemas")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class CinemaController {

    private final CinemaService cinemaService;
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
     * Get all cinemas (public - active only, for dropdowns)
     * GET /api/cinemas
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedCinemaResponse>> getAllCinemas(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "100") Integer size,
            @RequestParam(required = false) String search) {

        log.info("Getting all active cinemas - page: {}, size: {}, search: {}", page, size, search);

        ApiResponse<PagedCinemaResponse> response = cinemaService.getAllActiveCinemas(page, size, search);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get all cinemas for a chain (public - active only)
     * GET /api/cinemas/chain/{chainId}
     */
    @GetMapping("/chain/{chainId}")
    public ResponseEntity<ApiResponse<PagedCinemaResponse>> getAllCinemasByChain(
            @PathVariable Integer chainId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search) {

        log.info("Getting all cinemas for chain: {} - page: {}, size: {}, search: {}", chainId, page, size, search);

        ApiResponse<PagedCinemaResponse> response = cinemaService.getAllCinemasByChain(chainId, page, size, search);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get all cinemas for a chain (admin - all including inactive)
     * GET /api/cinemas/chain/{chainId}/admin
     */
    @GetMapping("/chain/{chainId}/admin")
    public ResponseEntity<ApiResponse<PagedCinemaResponse>> getAllCinemasByChainAdmin(
            @PathVariable Integer chainId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search,
            @RequestHeader("Authorization") String token) {

        log.info("Admin getting all cinemas for chain: {} - page: {}, size: {}, search: {}", chainId, page, size, search);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<PagedCinemaResponse>builder()
                                .success(false)
                                .message("Token khong hop le hoac da het han")
                                .build());
            }

            ApiResponse<PagedCinemaResponse> response = cinemaService.getAllCinemasByChainAdmin(chainId, page, size, search, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting cinemas by chain for admin", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<PagedCinemaResponse>builder()
                            .success(false)
                            .message("Token khong hop le hoac da het han")
                            .build());
        }
    }

    /**
     * Get cinema by ID
     * GET /api/cinemas/{cinemaId}?chainId={chainId}
     */
    @GetMapping("/{cinemaId}")
    public ResponseEntity<ApiResponse<CinemaDto>> getCinemaById(
            @PathVariable Integer cinemaId,
            @RequestParam Integer chainId) {

        log.info("Getting cinema: {} for chain: {}", cinemaId, chainId);

        ApiResponse<CinemaDto> response = cinemaService.getCinemaById(chainId, cinemaId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Create cinema (admin only)
     * POST /api/cinemas/admin
     */
    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<CinemaDto>> createCinema(
            @RequestBody CreateCinemaRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Creating cinema: {} for chain: {}", request.getCinemaName(), request.getChainId());

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<CinemaDto>builder()
                                .success(false)
                                .message("Token khong hop le hoac da het han")
                                .build());
            }

            ApiResponse<CinemaDto> response = cinemaService.createCinema(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error creating cinema", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<CinemaDto>builder()
                            .success(false)
                            .message("Token khong hop le hoac da het han")
                            .build());
        }
    }

    /**
     * Update cinema (admin only)
     * PUT /api/cinemas/admin/{cinemaId}
     */
    @PutMapping("/admin/{cinemaId}")
    public ResponseEntity<ApiResponse<CinemaDto>> updateCinema(
            @PathVariable Integer cinemaId,
            @RequestBody UpdateCinemaRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Updating cinema: {} for chain: {}", cinemaId, request.getChainId());

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<CinemaDto>builder()
                                .success(false)
                                .message("Token khong hop le hoac da het han")
                                .build());
            }

            // Ensure cinemaId in URL matches request body
            request.setCinemaId(cinemaId);

            ApiResponse<CinemaDto> response = cinemaService.updateCinema(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error updating cinema", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<CinemaDto>builder()
                            .success(false)
                            .message("Token khong hop le hoac da het han")
                            .build());
        }
    }

    /**
     * Delete cinema (admin only)
     * DELETE /api/cinemas/admin/{cinemaId}?chainId={chainId}
     */
    @DeleteMapping("/admin/{cinemaId}")
    public ResponseEntity<ApiResponse<Void>> deleteCinema(
            @PathVariable Integer cinemaId,
            @RequestParam Integer chainId,
            @RequestHeader("Authorization") String token) {

        log.info("Deleting cinema: {} for chain: {}", cinemaId, chainId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<Void>builder()
                                .success(false)
                                .message("Token khong hop le hoac da het han")
                                .build());
            }

            ApiResponse<Void> response = cinemaService.deleteCinema(chainId, cinemaId, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error deleting cinema", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Token khong hop le hoac da het han")
                            .build());
        }
    }

    /**
     * Get my cinemas (for CINEMA_MANAGER - only cinemas managed by this user)
     * Or all cinemas for SYSTEM_ADMIN
     * GET /api/cinemas/my-cinemas
     */
    @GetMapping("/my-cinemas")
    public ResponseEntity<ApiResponse<PagedCinemaResponse>> getMycinemas(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search,
            @RequestHeader("Authorization") String token) {

        log.info("Getting my cinemas for manager - page: {}, size: {}, search: {}", page, size, search);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<PagedCinemaResponse>builder()
                                .success(false)
                                .message("Token khong hop le hoac da het han")
                                .build());
            }

            ApiResponse<PagedCinemaResponse> response = cinemaService.getMycinemas(userId, page, size, search);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting my cinemas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<PagedCinemaResponse>builder()
                            .success(false)
                            .message("Error: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Get all cinemas for SYSTEM_ADMIN (all chains, all statuses)
     * GET /api/cinemas/admin/all
     */
    @GetMapping("/admin/all")
    public ResponseEntity<ApiResponse<PagedCinemaResponse>> getAllCinemasForSystemAdmin(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer chainId,
            @RequestHeader("Authorization") String token) {

        log.info("Getting all cinemas for SYSTEM_ADMIN - page: {}, size: {}, search: {}, chainId: {}", page, size, search, chainId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<PagedCinemaResponse>builder()
                                .success(false)
                                .message("Token khong hop le hoac da het han")
                                .build());
            }

            ApiResponse<PagedCinemaResponse> response = cinemaService.getAllCinemasForSystemAdmin(userId, page, size, search, chainId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting all cinemas", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<PagedCinemaResponse>builder()
                            .success(false)
                            .message("Error: " + e.getMessage())
                            .build());
        }
    }
}

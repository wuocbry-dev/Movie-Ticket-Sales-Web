package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.ShowtimeService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ShowtimeController {

    private final ShowtimeService showtimeService;
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
     * Get all showtimes with pagination (public)
     * GET /api/showtimes
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedShowtimeResponse>> getAllShowtimes(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        log.info("Getting all showtimes - page: {}, size: {}", page, size);

        ApiResponse<PagedShowtimeResponse> response = showtimeService.getAllShowtimes(page, size);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get showtimes by movie (public)
     * GET /api/showtimes/movie/{movieId}
     */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<List<ShowtimeDto>>> getShowtimesByMovie(
            @PathVariable Integer movieId) {

        log.info("Getting showtimes for movie: {}", movieId);

        ApiResponse<List<ShowtimeDto>> response = showtimeService.getShowtimesByMovie(movieId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get showtime by ID (public)
     * GET /api/showtimes/{showtimeId}
     */
    @GetMapping("/{showtimeId}")
    public ResponseEntity<ApiResponse<ShowtimeDto>> getShowtimeById(
            @PathVariable Integer showtimeId) {

        log.info("Getting showtime by ID: {}", showtimeId);

        ApiResponse<ShowtimeDto> response = showtimeService.getShowtimeById(showtimeId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Create showtime (admin only)
     * POST /api/showtimes/admin
     */
    @PostMapping("/admin")
    public ResponseEntity<ApiResponse<ShowtimeDto>> createShowtime(
            @RequestBody CreateShowtimeRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Creating showtime for movie: {}, hall: {}", request.getMovieId(), request.getHallId());

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<ShowtimeDto>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            ApiResponse<ShowtimeDto> response = showtimeService.createShowtime(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error creating showtime", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ShowtimeDto>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }

    /**
     * Update showtime (admin only)
     * PUT /api/showtimes/admin/{showtimeId}
     */
    @PutMapping("/admin/{showtimeId}")
    public ResponseEntity<ApiResponse<ShowtimeDto>> updateShowtime(
            @PathVariable Integer showtimeId,
            @RequestBody UpdateShowtimeRequest request,
            @RequestHeader("Authorization") String token) {

        log.info("Updating showtime ID: {}", showtimeId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<ShowtimeDto>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            // Ensure showtimeId in URL matches request body
            request.setShowtimeId(showtimeId);

            ApiResponse<ShowtimeDto> response = showtimeService.updateShowtime(request, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error updating showtime", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<ShowtimeDto>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }

    /**
     * Delete showtime (admin only)
     * DELETE /api/showtimes/admin/{showtimeId}
     */
    @DeleteMapping("/admin/{showtimeId}")
    public ResponseEntity<ApiResponse<Void>> deleteShowtime(
            @PathVariable Integer showtimeId,
            @RequestHeader("Authorization") String token) {

        log.info("Deleting showtime ID: {}", showtimeId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<Void>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            ApiResponse<Void> response = showtimeService.deleteShowtime(showtimeId, userId);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        } catch (Exception e) {
            log.error("Error deleting showtime", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<Void>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }

    /**
     * Get showtimes for cinema manager's cinemas
     * GET /api/showtimes/manager/my-showtimes
     */
    @GetMapping("/manager/my-showtimes")
    public ResponseEntity<ApiResponse<PagedShowtimeResponse>> getMyShowtimes(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Integer cinemaId,
            @RequestHeader("Authorization") String token) {

        log.info("Getting showtimes for cinema manager - page: {}, size: {}, cinemaId: {}", page, size, cinemaId);

        try {
            Integer userId = getUserIdFromToken(token);
            if (userId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.<PagedShowtimeResponse>builder()
                                .success(false)
                                .message("Token không hợp lệ hoặc đã hết hạn")
                                .build());
            }

            ApiResponse<PagedShowtimeResponse> response = showtimeService.getShowtimesForManager(userId, cinemaId, page, size);

            if (response.getSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
        } catch (Exception e) {
            log.error("Error getting manager showtimes", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.<PagedShowtimeResponse>builder()
                            .success(false)
                            .message("Token không hợp lệ hoặc đã hết hạn")
                            .build());
        }
    }
}

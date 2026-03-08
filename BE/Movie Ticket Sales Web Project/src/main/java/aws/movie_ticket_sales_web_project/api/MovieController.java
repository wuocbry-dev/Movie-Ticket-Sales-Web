package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.service.MovieService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@AllArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class MovieController {

    private final MovieService movieService;

    /**
     * Get movies list with pagination and filters
     * GET /api/movies
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedMoviesResponse>> getMovies(
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "size", defaultValue = "12") Integer size,
            @RequestParam(value = "sortBy", defaultValue = "releaseDate") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {
        
        log.info("GET /api/movies - status: {}, page: {}, size: {}, sortBy: {}, sortDir: {}", 
                status, page, size, sortBy, sortDir);

        ApiResponse<PagedMoviesResponse> response = movieService.getMovies(status, page, size, sortBy, sortDir);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get movie details by ID
     * GET /api/movies/{movieId}
     */
    @GetMapping("/{movieId}")
    public ResponseEntity<ApiResponse<MovieDetailDto>> getMovieById(
            @PathVariable Integer movieId) {
        
        log.info("GET /api/movies/{}", movieId);

        ApiResponse<MovieDetailDto> response = movieService.getMovieById(movieId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Create a new movie (Admin only)
     * POST /api/movies
     */
    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<MovieDetailDto>> createMovie(
            @RequestBody CreateMovieRequest request) {
        
        log.info("POST /api/movies - Creating movie: {}", request.getTitle());

        ApiResponse<MovieDetailDto> response = movieService.createMovie(request);

        if (response.getSuccess()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Update a movie (Admin only)
     * PUT /api/movies/{movieId}
     */
    @PutMapping("/{movieId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<MovieDetailDto>> updateMovie(
            @PathVariable Integer movieId,
            @RequestBody UpdateMovieRequest request) {
        
        log.info("PUT /api/movies/{} - Updating movie", movieId);

        ApiResponse<MovieDetailDto> response = movieService.updateMovie(movieId, request);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Soft delete a movie (Admin only)
     * DELETE /api/movies/{movieId}
     */
    @DeleteMapping("/{movieId}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(
            @PathVariable Integer movieId) {
        
        log.info("DELETE /api/movies/{} - Soft deleting movie", movieId);

        ApiResponse<Void> response = movieService.deleteMovie(movieId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Restore soft deleted movie (Admin only)
     * POST /api/movies/{movieId}/restore
     */
    @PostMapping("/{movieId}/restore")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> restoreMovie(
            @PathVariable Integer movieId) {
        
        log.info("POST /api/movies/{}/restore - Restoring deleted movie", movieId);

        ApiResponse<Void> response = movieService.restoreMovie(movieId);

        if (response.getSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Get all genres
     * GET /api/movies/genres
     */
    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<GenreDto>>> getAllGenres() {
        
        log.info("GET /api/movies/genres");

        ApiResponse<List<GenreDto>> response = movieService.getAllGenres();

        return ResponseEntity.ok(response);
    }
}
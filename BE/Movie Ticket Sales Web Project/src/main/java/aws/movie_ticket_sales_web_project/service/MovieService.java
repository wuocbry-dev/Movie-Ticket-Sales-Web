package aws.movie_ticket_sales_web_project.service;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.entity.*;
import aws.movie_ticket_sales_web_project.enums.FormatType;
import aws.movie_ticket_sales_web_project.enums.MovieStatus;
import aws.movie_ticket_sales_web_project.repository.*;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Slf4j
public class MovieService {

    private final MovieRepository movieRepository;
    private final MovieGenreMappingRepository movieGenreMappingRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieGenreRepository movieGenreRepository;

    /**
     * Get movies list with pagination and filters
     */
    public ApiResponse<PagedMoviesResponse> getMovies(String status, 
                                                     Integer page, 
                                                     Integer size, 
                                                     String sortBy, 
                                                     String sortDir) {
        try {
            log.info("Getting movies with filters - status: {}, page: {}, size: {}, sortBy: {}, sortDir: {}", 
                    status, page, size, sortBy, sortDir);

            // Validate and set defaults
            page = (page != null) ? page : 0;
            size = (size != null) ? size : 12;
            sortBy = (sortBy != null) ? sortBy : "releaseDate";
            sortDir = (sortDir != null) ? sortDir : "desc";

            // Create sort object
            Sort sort = Sort.by(Sort.Direction.fromString(sortDir), mapSortField(sortBy));
            Pageable pageable = PageRequest.of(page, size, sort);

            // Get movies (exclude soft deleted)
            Page<Movie> moviesPage;
            if (status != null && !status.isEmpty()) {
                try {
                    MovieStatus movieStatus = MovieStatus.valueOf(status.toUpperCase());
                    moviesPage = movieRepository.findByStatusAndIsDeletedFalse(movieStatus, pageable);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid status parameter: {}", status);
                    moviesPage = movieRepository.findAllActive(pageable);
                }
            } else {
                moviesPage = movieRepository.findAllActive(pageable);
            }

            // Convert to DTOs
            List<MovieListItemDto> movieDtos = moviesPage.getContent().stream()
                    .map(this::convertToMovieListItem)
                    .collect(Collectors.toList());

            PagedMoviesResponse response = new PagedMoviesResponse();
            response.setContent(movieDtos);
            response.setTotalElements(moviesPage.getTotalElements());
            response.setTotalPages(moviesPage.getTotalPages());
            response.setCurrentPage(page);
            response.setSize(size);

            return ApiResponse.<PagedMoviesResponse>builder()
                    .success(true)
                    .message("Movies retrieved successfully")
                    .data(response)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving movies", e);
            return ApiResponse.<PagedMoviesResponse>builder()
                    .success(false)
                    .message("Failed to retrieve movies: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get movie details by ID
     */
    public ApiResponse<MovieDetailDto> getMovieById(Integer movieId) {
        try {
            log.info("Getting movie details for ID: {}", movieId);

            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));

            MovieDetailDto movieDetail = convertToMovieDetail(movie);

            return ApiResponse.<MovieDetailDto>builder()
                    .success(true)
                    .message("Movie details retrieved successfully")
                    .data(movieDetail)
                    .build();

        } catch (Exception e) {
            log.error("Error retrieving movie details for ID: {}", movieId, e);
            return ApiResponse.<MovieDetailDto>builder()
                    .success(false)
                    .message("Failed to retrieve movie details: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Convert Movie entity to MovieListItemDto
     */
    private MovieListItemDto convertToMovieListItem(Movie movie) {
        MovieListItemDto dto = new MovieListItemDto();
        dto.setMovieId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setTitleEn(movie.getTitleEn());
        dto.setAgeRating(movie.getAgeRating() != null ? movie.getAgeRating().toString() : null);
        dto.setDuration(movie.getDurationMinutes());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setStatus(movie.getStatus() != null ? movie.getStatus().toString() : null);
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setImdbRating(movie.getImdbRating());
        dto.setIsFeatured(movie.getIsFeatured());
        
        // Get genres
        dto.setGenres(getMovieGenres(movie.getId()));
        
        // Get available formats
        dto.setFormats(getMovieFormats(movie.getId()));

        return dto;
    }

    /**
     * Convert Movie entity to MovieDetailDto
     */
    private MovieDetailDto convertToMovieDetail(Movie movie) {
        MovieDetailDto dto = new MovieDetailDto();
        dto.setMovieId(movie.getId());
        dto.setTitle(movie.getTitle());
        dto.setTitleEn(movie.getTitleEn());
        dto.setAgeRating(movie.getAgeRating() != null ? movie.getAgeRating().toString() : null);
        dto.setContentWarning(movie.getContentWarning());
        dto.setSynopsis(movie.getSynopsis());
        dto.setSynopsisEn(movie.getSynopsisEn());
        dto.setDuration(movie.getDurationMinutes());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setEndDate(movie.getEndDate());
        dto.setCountry(movie.getCountry());
        dto.setLanguage(movie.getLanguage());
        dto.setSubtitleLanguage(movie.getSubtitleLanguage());
        dto.setDirector(movie.getDirector());
        dto.setCast(movie.getCast());
        dto.setProducer(movie.getProducer());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setBackdropUrl(movie.getBackdropUrl());
        dto.setTrailerUrl(movie.getTrailerUrl());
        dto.setStatus(movie.getStatus() != null ? movie.getStatus().toString() : null);
        dto.setIsFeatured(movie.getIsFeatured());
        dto.setImdbRating(movie.getImdbRating());
        dto.setImdbId(movie.getImdbId());
        
        // Get genres
        dto.setGenres(getMovieGenres(movie.getId()));
        
        // Get available formats
        dto.setAvailableFormats(getMovieFormats(movie.getId()));

        return dto;
    }

    /**
     * Get genres for a movie
     */
    private List<GenreDto> getMovieGenres(Integer movieId) {
        try {
            List<MovieGenreMapping> genreMappings = movieGenreMappingRepository.findByMovieIdWithGenre(movieId);
            return genreMappings.stream()
                    .map(mapping -> new GenreDto(mapping.getGenre().getId(), mapping.getGenre().getGenreName()))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting genres for movie ID: {}", movieId, e);
            return List.of();
        }
    }

    /**
     * Get available formats for a movie
     */
    private List<String> getMovieFormats(Integer movieId) {
        try {
            List<FormatType> formats = showtimeRepository.findDistinctFormatTypesByMovieId(movieId);
            return formats.stream()
                    .map(FormatType::getValue)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting formats for movie ID: {}", movieId, e);
            return List.of();
        }
    }

    /**
     * Map sort field names
     */
    private String mapSortField(String sortBy) {
        switch (sortBy) {
            case "releaseDate":
                return "releaseDate";
            case "title":
                return "title";
            case "popularity":
                return "isFeatured"; // Using isFeatured as popularity indicator
            default:
                return "releaseDate";
        }
    }

    /**
     * Delete genre mappings by movie ID
     */
    private void deleteGenreMappingsByMovieId(Integer movieId) {
        List<MovieGenreMapping> mappings = movieGenreMappingRepository.findByMovieIdWithGenre(movieId);
        movieGenreMappingRepository.deleteAll(mappings);
    }

    /**
     * Create a new movie (Admin only)
     */
    public ApiResponse<MovieDetailDto> createMovie(CreateMovieRequest request) {
        try {
            log.info("Creating new movie: {}", request.getTitle());

            // Create movie entity
            Movie movie = new Movie();
            movie.setTitle(request.getTitle());
            movie.setTitleEn(request.getTitleEn());
            movie.setAgeRating(request.getAgeRating());
            movie.setContentWarning(request.getContentWarning());
            movie.setSynopsis(request.getSynopsis());
            movie.setSynopsisEn(request.getSynopsisEn());
            movie.setDurationMinutes(request.getDurationMinutes());
            movie.setReleaseDate(request.getReleaseDate());
            movie.setEndDate(request.getEndDate());
            movie.setStatus(request.getStatus());
            movie.setDirector(request.getDirector());
            movie.setCast(request.getCast());
            movie.setCountry(request.getCountry());
            movie.setLanguage(request.getLanguage());
            movie.setSubtitleLanguage(request.getSubtitleLanguage());
            movie.setProducer(request.getProducer());
            movie.setPosterUrl(request.getPosterUrl());
            movie.setBackdropUrl(request.getBackdropUrl());
            movie.setTrailerUrl(request.getTrailerUrl());
            movie.setImdbRating(request.getImdbRating());
            movie.setImdbId(request.getImdbId());
            movie.setIsFeatured(request.getIsFeatured() != null ? request.getIsFeatured() : false);

            // Save movie first to get ID
            Movie savedMovie = movieRepository.save(movie);

            // Save genre mappings
            if (request.getGenreIds() != null && !request.getGenreIds().isEmpty()) {
                for (Integer genreId : request.getGenreIds()) {
                    MovieGenre genre = movieGenreRepository.findById(genreId)
                            .orElseThrow(() -> new RuntimeException("Genre not found: " + genreId));

                    MovieGenreMappingId mappingId = new MovieGenreMappingId();
                    mappingId.setMovieId(savedMovie.getId());
                    mappingId.setGenreId(genreId);

                    MovieGenreMapping mapping = new MovieGenreMapping();
                    mapping.setId(mappingId);
                    mapping.setMovie(savedMovie);
                    mapping.setGenre(genre);

                    movieGenreMappingRepository.save(mapping);
                }
            }

            // Return movie details
            MovieDetailDto movieDetail = convertToMovieDetail(savedMovie);

            return ApiResponse.<MovieDetailDto>builder()
                    .success(true)
                    .message("Movie created successfully")
                    .data(movieDetail)
                    .build();

        } catch (Exception e) {
            log.error("Error creating movie", e);
            return ApiResponse.<MovieDetailDto>builder()
                    .success(false)
                    .message("Failed to create movie: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Update a movie (Admin only)
     */
    public ApiResponse<MovieDetailDto> updateMovie(Integer movieId, UpdateMovieRequest request) {
        try {
            log.info("Updating movie ID: {}", movieId);

            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));

            // Update fields if provided
            if (request.getTitle() != null) movie.setTitle(request.getTitle());
            if (request.getTitleEn() != null) movie.setTitleEn(request.getTitleEn());
            if (request.getAgeRating() != null) movie.setAgeRating(request.getAgeRating());
            if (request.getContentWarning() != null) movie.setContentWarning(request.getContentWarning());
            if (request.getSynopsis() != null) movie.setSynopsis(request.getSynopsis());
            if (request.getSynopsisEn() != null) movie.setSynopsisEn(request.getSynopsisEn());
            if (request.getDurationMinutes() != null) movie.setDurationMinutes(request.getDurationMinutes());
            if (request.getReleaseDate() != null) movie.setReleaseDate(request.getReleaseDate());
            if (request.getEndDate() != null) movie.setEndDate(request.getEndDate());
            if (request.getStatus() != null) movie.setStatus(request.getStatus());
            if (request.getDirector() != null) movie.setDirector(request.getDirector());
            if (request.getCast() != null) movie.setCast(request.getCast());
            if (request.getCountry() != null) movie.setCountry(request.getCountry());
            if (request.getLanguage() != null) movie.setLanguage(request.getLanguage());
            if (request.getSubtitleLanguage() != null) movie.setSubtitleLanguage(request.getSubtitleLanguage());
            if (request.getProducer() != null) movie.setProducer(request.getProducer());
            if (request.getPosterUrl() != null) movie.setPosterUrl(request.getPosterUrl());
            if (request.getBackdropUrl() != null) movie.setBackdropUrl(request.getBackdropUrl());
            if (request.getTrailerUrl() != null) movie.setTrailerUrl(request.getTrailerUrl());
            if (request.getImdbRating() != null) movie.setImdbRating(request.getImdbRating());
            if (request.getImdbId() != null) movie.setImdbId(request.getImdbId());
            if (request.getIsFeatured() != null) movie.setIsFeatured(request.getIsFeatured());

            // Update genre mappings if provided
            if (request.getGenreIds() != null) {
                // Delete existing mappings
                deleteGenreMappingsByMovieId(movieId);

                // Add new mappings
                for (Integer genreId : request.getGenreIds()) {
                    MovieGenre genre = movieGenreRepository.findById(genreId)
                            .orElseThrow(() -> new RuntimeException("Genre not found: " + genreId));

                    MovieGenreMappingId mappingId = new MovieGenreMappingId();
                    mappingId.setMovieId(movieId);
                    mappingId.setGenreId(genreId);

                    MovieGenreMapping mapping = new MovieGenreMapping();
                    mapping.setId(mappingId);
                    mapping.setMovie(movie);
                    mapping.setGenre(genre);

                    movieGenreMappingRepository.save(mapping);
                }
            }

            Movie updatedMovie = movieRepository.save(movie);
            MovieDetailDto movieDetail = convertToMovieDetail(updatedMovie);

            return ApiResponse.<MovieDetailDto>builder()
                    .success(true)
                    .message("Movie updated successfully")
                    .data(movieDetail)
                    .build();

        } catch (Exception e) {
            log.error("Error updating movie ID: {}", movieId, e);
            return ApiResponse.<MovieDetailDto>builder()
                    .success(false)
                    .message("Failed to update movie: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Delete a movie (Admin only)
     */
    public ApiResponse<Void> deleteMovie(Integer movieId) {
        try {
            log.info("Soft deleting movie ID: {}", movieId);

            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));

            // Check if already deleted
            if (movie.getIsDeleted() != null && movie.getIsDeleted()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Movie is already deleted")
                        .build();
            }

            // Soft delete - just mark as deleted
            movie.setIsDeleted(true);
            movie.setDeletedAt(java.time.Instant.now());
            movie.setUpdatedAt(java.time.Instant.now());
            movieRepository.save(movie);

            log.info("Movie soft deleted successfully: {}", movie.getTitle());

            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Movie deleted successfully")
                    .build();

        } catch (Exception e) {
            log.error("Error soft deleting movie ID: {}", movieId, e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Failed to delete movie: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Restore soft deleted movie (Admin only)
     */
    public ApiResponse<Void> restoreMovie(Integer movieId) {
        try {
            log.info("Restoring soft deleted movie ID: {}", movieId);

            Movie movie = movieRepository.findById(movieId)
                    .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));

            // Check if movie is actually deleted
            if (movie.getIsDeleted() == null || !movie.getIsDeleted()) {
                return ApiResponse.<Void>builder()
                        .success(false)
                        .message("Movie is not deleted")
                        .build();
            }

            // Restore movie
            movie.setIsDeleted(false);
            movie.setDeletedAt(null);
            movie.setUpdatedAt(java.time.Instant.now());
            movieRepository.save(movie);

            log.info("Movie restored successfully: {}", movie.getTitle());

            return ApiResponse.<Void>builder()
                    .success(true)
                    .message("Movie restored successfully")
                    .build();

        } catch (Exception e) {
            log.error("Error restoring movie ID: {}", movieId, e);
            return ApiResponse.<Void>builder()
                    .success(false)
                    .message("Failed to restore movie: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Get all genres
     */
    public ApiResponse<List<GenreDto>> getAllGenres() {
        try {
            log.info("Getting all active genres");

            List<MovieGenre> genres = movieGenreRepository.findByIsActiveTrue();
            List<GenreDto> genreDtos = genres.stream()
                    .map(genre -> new GenreDto(genre.getId(), genre.getGenreName()))
                    .collect(Collectors.toList());

            return ApiResponse.<List<GenreDto>>builder()
                    .success(true)
                    .message("Genres retrieved successfully")
                    .data(genreDtos)
                    .build();

        } catch (Exception e) {
            log.error("Error getting genres", e);
            return ApiResponse.<List<GenreDto>>builder()
                    .success(false)
                    .message("Failed to get genres: " + e.getMessage())
                    .build();
        }
    }
}
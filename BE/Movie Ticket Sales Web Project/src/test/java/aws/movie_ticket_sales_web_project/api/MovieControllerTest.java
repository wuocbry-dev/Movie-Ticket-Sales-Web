package aws.movie_ticket_sales_web_project.api;

import aws.movie_ticket_sales_web_project.dto.*;
import aws.movie_ticket_sales_web_project.enums.AgeRating;
import aws.movie_ticket_sales_web_project.service.MovieService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("MovieController Unit Tests")
class MovieControllerTest {

    @Mock
    private MovieService movieService;

    @InjectMocks
    private MovieController movieController;

    private static final Integer MOVIE_ID = 1;

    private MovieDetailDto createTestMovieDetail() {
        MovieDetailDto dto = new MovieDetailDto();
        dto.setMovieId(MOVIE_ID);
        dto.setTitle("Test Movie");
        dto.setTitleEn("Test Movie English");
        dto.setSynopsis("Test description");
        dto.setDuration(120);
        dto.setReleaseDate(LocalDate.now());
        dto.setPosterUrl("https://example.com/poster.jpg");
        dto.setTrailerUrl("https://example.com/trailer");
        dto.setAgeRating("PG-13");
        dto.setStatus("NOW_SHOWING");
        return dto;
    }

    private PagedMoviesResponse createTestPagedResponse() {
        MovieListItemDto movie = new MovieListItemDto();
        movie.setMovieId(MOVIE_ID);
        movie.setTitle("Test Movie");
        movie.setPosterUrl("https://example.com/poster.jpg");
        movie.setStatus("NOW_SHOWING");

        PagedMoviesResponse response = new PagedMoviesResponse();
        response.setContent(Arrays.asList(movie));
        response.setCurrentPage(0);
        response.setTotalPages(1);
        response.setTotalElements(1L);
        response.setSize(12);
        return response;
    }

    @Nested
    @DisplayName("getMovies Tests")
    class GetMoviesTests {

        @Test
        @DisplayName("Should return movies with default pagination")
        void shouldReturnMoviesWithDefaultPagination() {
            // Arrange
            PagedMoviesResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedMoviesResponse> expectedResponse = ApiResponse.<PagedMoviesResponse>builder()
                    .success(true)
                    .message("Movies retrieved successfully")
                    .data(pagedResponse)
                    .build();

            when(movieService.getMovies(null, 0, 12, "releaseDate", "desc"))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedMoviesResponse>> response = 
                    movieController.getMovies(null, 0, 12, "releaseDate", "desc");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getContent()).hasSize(1);
            
            verify(movieService).getMovies(null, 0, 12, "releaseDate", "desc");
        }

        @Test
        @DisplayName("Should return movies filtered by status")
        void shouldReturnMoviesFilteredByStatus() {
            // Arrange
            PagedMoviesResponse pagedResponse = createTestPagedResponse();
            ApiResponse<PagedMoviesResponse> expectedResponse = ApiResponse.<PagedMoviesResponse>builder()
                    .success(true)
                    .data(pagedResponse)
                    .build();

            when(movieService.getMovies("NOW_SHOWING", 0, 10, "title", "asc"))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedMoviesResponse>> response = 
                    movieController.getMovies("NOW_SHOWING", 0, 10, "title", "asc");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getSuccess()).isTrue();
            
            verify(movieService).getMovies("NOW_SHOWING", 0, 10, "title", "asc");
        }

        @Test
        @DisplayName("Should return empty list when no movies found")
        void shouldReturnEmptyListWhenNoMoviesFound() {
            // Arrange
            PagedMoviesResponse emptyResponse = new PagedMoviesResponse();
            emptyResponse.setContent(Collections.emptyList());
            emptyResponse.setCurrentPage(0);
            emptyResponse.setTotalPages(0);
            emptyResponse.setTotalElements(0L);

            ApiResponse<PagedMoviesResponse> expectedResponse = ApiResponse.<PagedMoviesResponse>builder()
                    .success(true)
                    .data(emptyResponse)
                    .build();

            when(movieService.getMovies(anyString(), anyInt(), anyInt(), anyString(), anyString()))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedMoviesResponse>> response = 
                    movieController.getMovies("UPCOMING", 0, 12, "releaseDate", "desc");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getData().getContent()).isEmpty();
        }
    }

    @Nested
    @DisplayName("getMovieById Tests")
    class GetMovieByIdTests {

        @Test
        @DisplayName("Should return movie when found")
        void shouldReturnMovieWhenFound() {
            // Arrange
            MovieDetailDto movieDetail = createTestMovieDetail();
            ApiResponse<MovieDetailDto> expectedResponse = ApiResponse.<MovieDetailDto>builder()
                    .success(true)
                    .message("Movie found")
                    .data(movieDetail)
                    .build();

            when(movieService.getMovieById(MOVIE_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<MovieDetailDto>> response = 
                    movieController.getMovieById(MOVIE_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getMovieId()).isEqualTo(MOVIE_ID);
            assertThat(response.getBody().getData().getTitle()).isEqualTo("Test Movie");
            
            verify(movieService).getMovieById(MOVIE_ID);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when movie not found")
        void shouldReturnNotFoundWhenMovieNotFound() {
            // Arrange
            ApiResponse<MovieDetailDto> expectedResponse = ApiResponse.<MovieDetailDto>builder()
                    .success(false)
                    .message("Movie not found")
                    .build();

            when(movieService.getMovieById(999)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<MovieDetailDto>> response = 
                    movieController.getMovieById(999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(movieService).getMovieById(999);
        }
    }

    @Nested
    @DisplayName("createMovie Tests")
    class CreateMovieTests {

        @Test
        @DisplayName("Should create movie successfully")
        void shouldCreateMovieSuccessfully() {
            // Arrange
            CreateMovieRequest request = CreateMovieRequest.builder()
                    .title("New Movie")
                    .titleEn("New Movie English")
                    .synopsis("New movie description")
                    .durationMinutes(150)
                    .releaseDate(LocalDate.now().plusMonths(1))
                    .ageRating(AgeRating.T13)
                    .build();

            MovieDetailDto createdMovie = createTestMovieDetail();
            createdMovie.setTitle("New Movie");

            ApiResponse<MovieDetailDto> expectedResponse = ApiResponse.<MovieDetailDto>builder()
                    .success(true)
                    .message("Movie created successfully")
                    .data(createdMovie)
                    .build();

            when(movieService.createMovie(request)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<MovieDetailDto>> response = 
                    movieController.createMovie(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            verify(movieService).createMovie(request);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when creation fails")
        void shouldReturnBadRequestWhenCreationFails() {
            // Arrange
            CreateMovieRequest request = CreateMovieRequest.builder()
                    .title("")
                    .build();

            ApiResponse<MovieDetailDto> expectedResponse = ApiResponse.<MovieDetailDto>builder()
                    .success(false)
                    .message("Invalid movie data")
                    .build();

            when(movieService.createMovie(request)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<MovieDetailDto>> response = 
                    movieController.createMovie(request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(movieService).createMovie(request);
        }
    }

    @Nested
    @DisplayName("updateMovie Tests")
    class UpdateMovieTests {

        @Test
        @DisplayName("Should update movie successfully")
        void shouldUpdateMovieSuccessfully() {
            // Arrange
            UpdateMovieRequest request = UpdateMovieRequest.builder()
                    .title("Updated Movie Title")
                    .synopsis("Updated description")
                    .build();

            MovieDetailDto updatedMovie = createTestMovieDetail();
            updatedMovie.setTitle("Updated Movie Title");

            ApiResponse<MovieDetailDto> expectedResponse = ApiResponse.<MovieDetailDto>builder()
                    .success(true)
                    .message("Movie updated successfully")
                    .data(updatedMovie)
                    .build();

            when(movieService.updateMovie(MOVIE_ID, request)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<MovieDetailDto>> response = 
                    movieController.updateMovie(MOVIE_ID, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getTitle()).isEqualTo("Updated Movie Title");
            
            verify(movieService).updateMovie(MOVIE_ID, request);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when update fails")
        void shouldReturnBadRequestWhenUpdateFails() {
            // Arrange
            UpdateMovieRequest request = UpdateMovieRequest.builder()
                    .title("Updated Title")
                    .build();

            ApiResponse<MovieDetailDto> expectedResponse = ApiResponse.<MovieDetailDto>builder()
                    .success(false)
                    .message("Movie not found or update failed")
                    .build();

            when(movieService.updateMovie(999, request)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<MovieDetailDto>> response = 
                    movieController.updateMovie(999, request);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(movieService).updateMovie(999, request);
        }
    }

    @Nested
    @DisplayName("deleteMovie Tests")
    class DeleteMovieTests {

        @Test
        @DisplayName("Should delete movie successfully")
        void shouldDeleteMovieSuccessfully() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(true)
                    .message("Movie deleted successfully")
                    .build();

            when(movieService.deleteMovie(MOVIE_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    movieController.deleteMovie(MOVIE_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            verify(movieService).deleteMovie(MOVIE_ID);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when movie to delete not found")
        void shouldReturnNotFoundWhenMovieToDeleteNotFound() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message("Movie not found")
                    .build();

            when(movieService.deleteMovie(999)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    movieController.deleteMovie(999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(movieService).deleteMovie(999);
        }
    }

    @Nested
    @DisplayName("restoreMovie Tests")
    class RestoreMovieTests {

        @Test
        @DisplayName("Should restore movie successfully")
        void shouldRestoreMovieSuccessfully() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(true)
                    .message("Movie restored successfully")
                    .build();

            when(movieService.restoreMovie(MOVIE_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    movieController.restoreMovie(MOVIE_ID);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            verify(movieService).restoreMovie(MOVIE_ID);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when restore fails")
        void shouldReturnBadRequestWhenRestoreFails() {
            // Arrange
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message("Movie not found or already active")
                    .build();

            when(movieService.restoreMovie(999)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    movieController.restoreMovie(999);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(movieService).restoreMovie(999);
        }
    }

    @Nested
    @DisplayName("getAllGenres Tests")
    class GetAllGenresTests {

        @Test
        @DisplayName("Should return all genres successfully")
        void shouldReturnAllGenresSuccessfully() {
            // Arrange
            List<GenreDto> genres = Arrays.asList(
                    new GenreDto(1, "Action"),
                    new GenreDto(2, "Comedy"),
                    new GenreDto(3, "Drama")
            );

            ApiResponse<List<GenreDto>> expectedResponse = ApiResponse.<List<GenreDto>>builder()
                    .success(true)
                    .message("Genres retrieved successfully")
                    .data(genres)
                    .build();

            when(movieService.getAllGenres()).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<List<GenreDto>>> response = 
                    movieController.getAllGenres();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).hasSize(3);
            assertThat(response.getBody().getData().get(0).getName()).isEqualTo("Action");
            
            verify(movieService).getAllGenres();
        }

        @Test
        @DisplayName("Should return empty list when no genres exist")
        void shouldReturnEmptyListWhenNoGenresExist() {
            // Arrange
            ApiResponse<List<GenreDto>> expectedResponse = ApiResponse.<List<GenreDto>>builder()
                    .success(true)
                    .data(Collections.emptyList())
                    .build();

            when(movieService.getAllGenres()).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<List<GenreDto>>> response = 
                    movieController.getAllGenres();

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getData()).isEmpty();
            
            verify(movieService).getAllGenres();
        }
    }
}

package aws.movie_ticket_sales_web_project.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import aws.movie_ticket_sales_web_project.dto.ApiResponse;
import aws.movie_ticket_sales_web_project.dto.CreateShowtimeRequest;
import aws.movie_ticket_sales_web_project.dto.PagedShowtimeResponse;
import aws.movie_ticket_sales_web_project.dto.ShowtimeDto;
import aws.movie_ticket_sales_web_project.dto.UpdateShowtimeRequest;
import aws.movie_ticket_sales_web_project.security.JwtTokenProvider;
import aws.movie_ticket_sales_web_project.service.ShowtimeService;

@ExtendWith(MockitoExtension.class)
@DisplayName("ShowtimeController Unit Tests")
class ShowtimeControllerTest {

    @Mock
    private ShowtimeService showtimeService;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private ShowtimeController showtimeController;

    private ShowtimeDto testShowtimeDto;
    private PagedShowtimeResponse testPagedResponse;
    private CreateShowtimeRequest testCreateRequest;
    private UpdateShowtimeRequest testUpdateRequest;
    private static final String VALID_TOKEN = "Bearer valid.jwt.token";
    private static final Integer USER_ID = 1;

    @BeforeEach
    void setUp() {
        testShowtimeDto = ShowtimeDto.builder()
                .showtimeId(1)
                .movieId(1)
                .movieTitle("Test Movie")
                .moviePosterUrl("http://example.com/poster.jpg")
                .hallId(1)
                .hallName("Hall A")
                .cinemaId(1)
                .cinemaName("Test Cinema")
                .showDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 30))
                .formatType("2D")
                .subtitleLanguage("Vietnamese")
                .status("ACTIVE")
                .build();

        testPagedResponse = PagedShowtimeResponse.builder()
                .totalElements(100L)
                .totalPages(10)
                .currentPage(0)
                .pageSize(10)
                .hasNext(true)
                .hasPrevious(false)
                .data(Arrays.asList(testShowtimeDto))
                .build();

        testCreateRequest = CreateShowtimeRequest.builder()
                .movieId(1)
                .hallId(1)
                .showDate(LocalDate.now().plusDays(1))
                .startTime(LocalTime.of(14, 0))
                .endTime(LocalTime.of(16, 30))
                .formatType("2D")
                .subtitleLanguage("Vietnamese")
                .basePrice(new BigDecimal("100000"))
                .build();

        testUpdateRequest = UpdateShowtimeRequest.builder()
                .showtimeId(1)
                .movieId(1)
                .hallId(1)
                .showDate(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(18, 0))
                .endTime(LocalTime.of(20, 30))
                .formatType("3D")
                .subtitleLanguage("English")
                .status("ACTIVE")
                .basePrice(new BigDecimal("150000"))
                .build();
    }

    @Nested
    @DisplayName("getAllShowtimes Tests")
    class GetAllShowtimesTests {

        @Test
        @DisplayName("Should get all showtimes successfully with default pagination")
        void shouldGetAllShowtimesSuccessfullyWithDefaultPagination() {
            // Arrange
            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .message("Showtimes retrieved successfully")
                    .data(testPagedResponse)
                    .build();

            when(showtimeService.getAllShowtimes(0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getAllShowtimes(0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getTotalElements()).isEqualTo(100L);
            
            verify(showtimeService).getAllShowtimes(0, 10);
        }

        @Test
        @DisplayName("Should get all showtimes with custom pagination")
        void shouldGetAllShowtimesWithCustomPagination() {
            // Arrange
            PagedShowtimeResponse customPagedResponse = PagedShowtimeResponse.builder()
                    .totalElements(100L)
                    .totalPages(5)
                    .currentPage(2)
                    .pageSize(20)
                    .hasNext(true)
                    .hasPrevious(true)
                    .data(Arrays.asList(testShowtimeDto))
                    .build();

            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .data(customPagedResponse)
                    .build();

            when(showtimeService.getAllShowtimes(2, 20)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getAllShowtimes(2, 20);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getData().getCurrentPage()).isEqualTo(2);
            assertThat(response.getBody().getData().getPageSize()).isEqualTo(20);
            
            verify(showtimeService).getAllShowtimes(2, 20);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when service fails")
        void shouldReturnBadRequestWhenServiceFails() {
            // Arrange
            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(false)
                    .message("Failed to retrieve showtimes")
                    .build();

            when(showtimeService.getAllShowtimes(0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getAllShowtimes(0, 10);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService).getAllShowtimes(0, 10);
        }
    }

    @Nested
    @DisplayName("getShowtimesByMovie Tests")
    class GetShowtimesByMovieTests {

        @Test
        @DisplayName("Should get showtimes by movie successfully")
        void shouldGetShowtimesByMovieSuccessfully() {
            // Arrange
            Integer movieId = 1;
            List<ShowtimeDto> showtimes = Arrays.asList(testShowtimeDto);
            
            ApiResponse<List<ShowtimeDto>> expectedResponse = ApiResponse.<List<ShowtimeDto>>builder()
                    .success(true)
                    .message("Showtimes retrieved")
                    .data(showtimes)
                    .build();

            when(showtimeService.getShowtimesByMovie(movieId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<List<ShowtimeDto>>> response = 
                    showtimeController.getShowtimesByMovie(movieId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).hasSize(1);
            
            verify(showtimeService).getShowtimesByMovie(movieId);
        }

        @Test
        @DisplayName("Should return empty list when no showtimes found")
        void shouldReturnEmptyListWhenNoShowtimesFound() {
            // Arrange
            Integer movieId = 999;
            
            ApiResponse<List<ShowtimeDto>> expectedResponse = ApiResponse.<List<ShowtimeDto>>builder()
                    .success(true)
                    .message("No showtimes found")
                    .data(Collections.emptyList())
                    .build();

            when(showtimeService.getShowtimesByMovie(movieId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<List<ShowtimeDto>>> response = 
                    showtimeController.getShowtimesByMovie(movieId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getData()).isEmpty();
            
            verify(showtimeService).getShowtimesByMovie(movieId);
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when movie not found")
        void shouldReturnBadRequestWhenMovieNotFound() {
            // Arrange
            Integer movieId = 999;
            
            ApiResponse<List<ShowtimeDto>> expectedResponse = ApiResponse.<List<ShowtimeDto>>builder()
                    .success(false)
                    .message("Movie not found")
                    .build();

            when(showtimeService.getShowtimesByMovie(movieId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<List<ShowtimeDto>>> response = 
                    showtimeController.getShowtimesByMovie(movieId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService).getShowtimesByMovie(movieId);
        }
    }

    @Nested
    @DisplayName("getShowtimeById Tests")
    class GetShowtimeByIdTests {

        @Test
        @DisplayName("Should get showtime by ID successfully")
        void shouldGetShowtimeByIdSuccessfully() {
            // Arrange
            Integer showtimeId = 1;
            
            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Showtime retrieved")
                    .data(testShowtimeDto)
                    .build();

            when(showtimeService.getShowtimeById(showtimeId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.getShowtimeById(showtimeId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData().getShowtimeId()).isEqualTo(1);
            
            verify(showtimeService).getShowtimeById(showtimeId);
        }

        @Test
        @DisplayName("Should return NOT_FOUND when showtime not found")
        void shouldReturnNotFoundWhenShowtimeNotFound() {
            // Arrange
            Integer showtimeId = 999;
            
            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Showtime not found")
                    .build();

            when(showtimeService.getShowtimeById(showtimeId)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.getShowtimeById(showtimeId);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService).getShowtimeById(showtimeId);
        }
    }

    @Nested
    @DisplayName("createShowtime Tests")
    class CreateShowtimeTests {

        @Test
        @DisplayName("Should create showtime successfully")
        void shouldCreateShowtimeSuccessfully() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Showtime created successfully")
                    .data(testShowtimeDto)
                    .build();

            when(showtimeService.createShowtime(testCreateRequest, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.createShowtime(testCreateRequest, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            assertThat(response.getBody().getData()).isNotNull();
            
            verify(jwtTokenProvider).getUserIdFromToken("valid.jwt.token");
            verify(showtimeService).createShowtime(testCreateRequest, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when token is invalid")
        void shouldReturnUnauthorizedWhenTokenIsInvalid() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("invalid.token"))
                    .thenThrow(new RuntimeException("Invalid token"));

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.createShowtime(testCreateRequest, "Bearer invalid.token");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            assertThat(response.getBody().getMessage()).contains("Token không hợp lệ");
            
            verify(showtimeService, never()).createShowtime(any(), any());
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when user ID is null")
        void shouldReturnUnauthorizedWhenUserIdIsNull() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(null);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.createShowtime(testCreateRequest, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService, never()).createShowtime(any(), any());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when creation fails")
        void shouldReturnBadRequestWhenCreationFails() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Hall not available at this time")
                    .build();

            when(showtimeService.createShowtime(testCreateRequest, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.createShowtime(testCreateRequest, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService).createShowtime(testCreateRequest, USER_ID);
        }
    }

    @Nested
    @DisplayName("updateShowtime Tests")
    class UpdateShowtimeTests {

        @Test
        @DisplayName("Should update showtime successfully")
        void shouldUpdateShowtimeSuccessfully() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ShowtimeDto updatedShowtime = ShowtimeDto.builder()
                    .showtimeId(1)
                    .formatType("3D")
                    .startTime(LocalTime.of(18, 0))
                    .build();

            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .message("Showtime updated successfully")
                    .data(updatedShowtime)
                    .build();

            when(showtimeService.updateShowtime(any(UpdateShowtimeRequest.class), eq(USER_ID)))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.updateShowtime(showtimeId, testUpdateRequest, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            verify(jwtTokenProvider).getUserIdFromToken("valid.jwt.token");
            verify(showtimeService).updateShowtime(any(UpdateShowtimeRequest.class), eq(USER_ID));
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when token is invalid")
        void shouldReturnUnauthorizedWhenTokenIsInvalid() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("invalid.token"))
                    .thenThrow(new RuntimeException("Invalid token"));

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.updateShowtime(showtimeId, testUpdateRequest, "Bearer invalid.token");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService, never()).updateShowtime(any(), any());
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when user ID is null")
        void shouldReturnUnauthorizedWhenUserIdIsNull() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(null);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.updateShowtime(showtimeId, testUpdateRequest, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService, never()).updateShowtime(any(), any());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when update fails")
        void shouldReturnBadRequestWhenUpdateFails() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(false)
                    .message("Showtime has bookings and cannot be updated")
                    .build();

            when(showtimeService.updateShowtime(any(UpdateShowtimeRequest.class), eq(USER_ID)))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.updateShowtime(showtimeId, testUpdateRequest, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService).updateShowtime(any(UpdateShowtimeRequest.class), eq(USER_ID));
        }

        @Test
        @DisplayName("Should set showtime ID from path variable")
        void shouldSetShowtimeIdFromPathVariable() {
            // Arrange
            Integer showtimeId = 5;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .data(testShowtimeDto)
                    .build();

            when(showtimeService.updateShowtime(argThat(req -> req.getShowtimeId().equals(5)), eq(USER_ID)))
                    .thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<ShowtimeDto>> response = 
                    showtimeController.updateShowtime(showtimeId, testUpdateRequest, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            verify(showtimeService).updateShowtime(argThat(req -> req.getShowtimeId().equals(5)), eq(USER_ID));
        }
    }

    @Nested
    @DisplayName("deleteShowtime Tests")
    class DeleteShowtimeTests {

        @Test
        @DisplayName("Should delete showtime successfully")
        void shouldDeleteShowtimeSuccessfully() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(true)
                    .message("Showtime deleted successfully")
                    .build();

            when(showtimeService.deleteShowtime(showtimeId, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    showtimeController.deleteShowtime(showtimeId, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            verify(jwtTokenProvider).getUserIdFromToken("valid.jwt.token");
            verify(showtimeService).deleteShowtime(showtimeId, USER_ID);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when token is invalid")
        void shouldReturnUnauthorizedWhenTokenIsInvalid() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("invalid.token"))
                    .thenThrow(new RuntimeException("Invalid token"));

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    showtimeController.deleteShowtime(showtimeId, "Bearer invalid.token");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService, never()).deleteShowtime(any(), any());
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when user ID is null")
        void shouldReturnUnauthorizedWhenUserIdIsNull() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(null);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    showtimeController.deleteShowtime(showtimeId, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService, never()).deleteShowtime(any(), any());
        }

        @Test
        @DisplayName("Should return BAD_REQUEST when deletion fails")
        void shouldReturnBadRequestWhenDeletionFails() {
            // Arrange
            Integer showtimeId = 1;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<Void> expectedResponse = ApiResponse.<Void>builder()
                    .success(false)
                    .message("Cannot delete showtime with existing bookings")
                    .build();

            when(showtimeService.deleteShowtime(showtimeId, USER_ID)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<Void>> response = 
                    showtimeController.deleteShowtime(showtimeId, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService).deleteShowtime(showtimeId, USER_ID);
        }
    }

    @Nested
    @DisplayName("getMyShowtimes Tests")
    class GetMyShowtimesTests {

        @Test
        @DisplayName("Should get manager showtimes successfully")
        void shouldGetManagerShowtimesSuccessfully() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .message("Manager showtimes retrieved")
                    .data(testPagedResponse)
                    .build();

            when(showtimeService.getShowtimesForManager(USER_ID, null, 0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getMyShowtimes(0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getSuccess()).isTrue();
            
            verify(jwtTokenProvider).getUserIdFromToken("valid.jwt.token");
            verify(showtimeService).getShowtimesForManager(USER_ID, null, 0, 10);
        }

        @Test
        @DisplayName("Should get manager showtimes with cinema filter")
        void shouldGetManagerShowtimesWithCinemaFilter() {
            // Arrange
            Integer cinemaId = 5;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .data(testPagedResponse)
                    .build();

            when(showtimeService.getShowtimesForManager(USER_ID, cinemaId, 0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getMyShowtimes(0, 10, cinemaId, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            
            verify(showtimeService).getShowtimesForManager(USER_ID, cinemaId, 0, 10);
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when token is invalid")
        void shouldReturnUnauthorizedWhenTokenIsInvalid() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("invalid.token"))
                    .thenThrow(new RuntimeException("Invalid token"));

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getMyShowtimes(0, 10, null, "Bearer invalid.token");

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService, never()).getShowtimesForManager(any(), any(), any(), any());
        }

        @Test
        @DisplayName("Should return UNAUTHORIZED when user ID is null")
        void shouldReturnUnauthorizedWhenUserIdIsNull() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(null);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getMyShowtimes(0, 10, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService, never()).getShowtimesForManager(any(), any(), any(), any());
        }

        @Test
        @DisplayName("Should return FORBIDDEN when user is not manager of cinema")
        void shouldReturnForbiddenWhenUserIsNotManagerOfCinema() {
            // Arrange
            Integer cinemaId = 10;
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(false)
                    .message("You are not authorized to view showtimes for this cinema")
                    .build();

            when(showtimeService.getShowtimesForManager(USER_ID, cinemaId, 0, 10)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getMyShowtimes(0, 10, cinemaId, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
            assertThat(response.getBody().getSuccess()).isFalse();
            
            verify(showtimeService).getShowtimesForManager(USER_ID, cinemaId, 0, 10);
        }

        @Test
        @DisplayName("Should get manager showtimes with custom pagination")
        void shouldGetManagerShowtimesWithCustomPagination() {
            // Arrange
            when(jwtTokenProvider.getUserIdFromToken("valid.jwt.token")).thenReturn(USER_ID);
            
            PagedShowtimeResponse customPage = PagedShowtimeResponse.builder()
                    .currentPage(3)
                    .pageSize(25)
                    .data(Arrays.asList(testShowtimeDto))
                    .build();

            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .data(customPage)
                    .build();

            when(showtimeService.getShowtimesForManager(USER_ID, null, 3, 25)).thenReturn(expectedResponse);

            // Act
            ResponseEntity<ApiResponse<PagedShowtimeResponse>> response = 
                    showtimeController.getMyShowtimes(3, 25, null, VALID_TOKEN);

            // Assert
            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody().getData().getCurrentPage()).isEqualTo(3);
            assertThat(response.getBody().getData().getPageSize()).isEqualTo(25);
            
            verify(showtimeService).getShowtimesForManager(USER_ID, null, 3, 25);
        }
    }

    @Nested
    @DisplayName("Service Interaction Tests")
    class ServiceInteractionTests {

        @Test
        @DisplayName("Should call service once for getAllShowtimes")
        void shouldCallServiceOnceForGetAllShowtimes() {
            // Arrange
            ApiResponse<PagedShowtimeResponse> expectedResponse = ApiResponse.<PagedShowtimeResponse>builder()
                    .success(true)
                    .data(testPagedResponse)
                    .build();

            when(showtimeService.getAllShowtimes(0, 10)).thenReturn(expectedResponse);

            // Act
            showtimeController.getAllShowtimes(0, 10);

            // Assert
            verify(showtimeService, times(1)).getAllShowtimes(0, 10);
        }

        @Test
        @DisplayName("Should call service once for getShowtimesByMovie")
        void shouldCallServiceOnceForGetShowtimesByMovie() {
            // Arrange
            ApiResponse<List<ShowtimeDto>> expectedResponse = ApiResponse.<List<ShowtimeDto>>builder()
                    .success(true)
                    .data(Arrays.asList(testShowtimeDto))
                    .build();

            when(showtimeService.getShowtimesByMovie(1)).thenReturn(expectedResponse);

            // Act
            showtimeController.getShowtimesByMovie(1);

            // Assert
            verify(showtimeService, times(1)).getShowtimesByMovie(1);
        }

        @Test
        @DisplayName("Should call service once for getShowtimeById")
        void shouldCallServiceOnceForGetShowtimeById() {
            // Arrange
            ApiResponse<ShowtimeDto> expectedResponse = ApiResponse.<ShowtimeDto>builder()
                    .success(true)
                    .data(testShowtimeDto)
                    .build();

            when(showtimeService.getShowtimeById(1)).thenReturn(expectedResponse);

            // Act
            showtimeController.getShowtimeById(1);

            // Assert
            verify(showtimeService, times(1)).getShowtimeById(1);
        }
    }
}
